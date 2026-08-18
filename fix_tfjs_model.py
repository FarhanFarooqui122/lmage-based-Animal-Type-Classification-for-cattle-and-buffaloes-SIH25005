# -*- coding: utf-8 -*-
"""
Fix TF.js model.json exported by tensorflowjs_converter 4.x + Keras 3.
The Keras 3 serialization uses schemas TF.js 4.22's loadLayersModel can't parse.
This script rewrites public/models/model.json into the Keras 2-compatible
schema that tfjs expects. Idempotent — safe to run repeatedly.

Fixes applied:
  1. InputLayer: batch_shape -> batch_input_shape
  2. layer dtype: DTypePolicy object -> plain "float32"
  3. strip Keras 3 extras: module / registered_name
  4. inbound_nodes: {args: [...], kwargs: {...}} -> flat Keras 2 node arrays
     (flattens nested lists used for multi-input layers like Add)
  5. model_config class_name Functional -> Model; wrap flat input_layers /
     output_layers tuples into lists
  6. weightsManifest: rename DepthwiseConv2D 'kernel' -> 'depthwise_kernel'
     (Keras 3 vs TF.js weight-name difference)

Usage: python fix_tfjs_model.py [path-to-model.json]
"""

import json
import sys


def fix_model(path: str) -> None:
    with open(path, encoding='utf-8') as f:
        j = json.load(f)

    mc = j['modelTopology']['model_config']
    layers = mc['config']['layers']

    def strip(obj):
        if isinstance(obj, dict):
            obj.pop('module', None)
            obj.pop('registered_name', None)
            inner = obj.get('config')
            if isinstance(inner, dict):
                strip(inner)
        elif isinstance(obj, list):
            for x in obj:
                strip(x)

    def ref_to_list(t):
        h = t['config']['keras_history']
        return [h[0], h[1], h[2], {}]

    def collect(v, out):
        if isinstance(v, list):
            for x in v:
                collect(x, out)
        elif isinstance(v, dict) and v.get('class_name') == '__keras_tensor__':
            out.append(ref_to_list(v))

    def convert_nodes(nodes):
        if not isinstance(nodes, list):
            return []
        out = []
        for node in nodes:
            if isinstance(node, list):
                out.append(node)
                continue
            data = []
            collect(node.get('args'), data)
            kwargs = node.get('kwargs') or {}
            if isinstance(kwargs, dict):
                for k, v in kwargs.items():
                    sub = []
                    collect(v, sub)
                    if sub:
                        data.append({k: sub[0] if len(sub) == 1 else sub})
            out.append(data)
        return out

    for layer in layers:
        cfg = layer['config']
        if layer['class_name'] == 'InputLayer' and 'batch_shape' in cfg:
            cfg['batch_input_shape'] = cfg.pop('batch_shape')
        dtype = cfg.get('dtype')
        if isinstance(dtype, dict) and dtype.get('class_name') == 'DTypePolicy':
            cfg['dtype'] = 'float32'
        strip(cfg)
        layer['inbound_nodes'] = convert_nodes(layer['inbound_nodes'])

    mc['class_name'] = 'Model'
    for key in ('input_layers', 'output_layers'):
        v = mc['config'].get(key)
        if v and isinstance(v[0], str):
            mc['config'][key] = [v]

    depthwise = {l['name'] for l in layers if l['class_name'] == 'DepthwiseConv2D'}
    renamed = 0
    for w in j['weightsManifest'][0]['weights']:
        parts = w['name'].split('/')
        if len(parts) == 2 and parts[0] in depthwise and parts[1] == 'kernel':
            w['name'] = parts[0] + '/depthwise_kernel'
            renamed += 1

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(j, f)

    print(f'fixed {len(layers)} layers, {renamed} depthwise kernel renames -> {path}')


if __name__ == '__main__':
    fix_model(sys.argv[1] if len(sys.argv) > 1 else 'public/models/model.json')