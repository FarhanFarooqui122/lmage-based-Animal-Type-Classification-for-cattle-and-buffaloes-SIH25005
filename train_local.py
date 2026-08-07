#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Train MobileNetV2 for Animal Breed Classification (8 Indian Breeds) — LOCAL GPU version.

Drop-in replacement for colab_train.py that runs on a local machine
(e.g. the college RTX 2000 Ada, 24 GB VRAM) instead of Google Colab.

Workflow:
  1. Downloads Kaggle datasets via the `kaggle` CLI (API key in ~/.kaggle/kaggle.json)
  2. Extracts ONLY the 8 target breed folders
  3. Splits into train (80%) / val (20%)
  4. Phase 1: train head with frozen MobileNetV2 base
  5. Phase 2: fine-tune the top third of the base
  6. Evaluates and exports a TF.js LayersModel + metadata.json

Output target: copy `training/output/tfjs_model/*` into `public/models/`.

Install deps first:  pip install -r requirements-train.txt
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import random
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import numpy as np
import tensorflow as tf

SCRIPT_DIR = Path(__file__).resolve().parent
WORK_DIR = SCRIPT_DIR / "training"
DOWNLOAD_DIR = WORK_DIR / "downloads"
RAW_DIR = WORK_DIR / "raw"
TRAIN_DIR = WORK_DIR / "data" / "train"
VAL_DIR = WORK_DIR / "data" / "val"
OUTPUT_DIR = WORK_DIR / "output"

IMAGE_SIZE = 224
NUM_CLASSES = 8

CLASSES = [
    "Gir",
    "Sahiwal",
    "Kankrej",
    "Ongole",
    "Murrah",
    "Surti",
    "Jaffarabadi",
    "Bhadawari",
]

CATTLE_BREEDS = ["Gir", "Sahiwal", "Kankrej", "Ongole"]
BUFFALO_BREEDS = ["Murrah", "Surti", "Jaffarabadi", "Bhadwari"]
ALL_8 = CLASSES + ["Bhadwari"]

DATASETS = {
    "atharvadarpude/indian-cattle-image-dataset": CATTLE_BREEDS,
    "atharvadarpude/indian-buffalo-dataset": BUFFALO_BREEDS,
    "birendranathnandi/indian-cattle-and-buffalo-breeds-dataset": ALL_8,
}

RENAME_MAP = {"Bhadwari": "Bhadawari"}


def setup_seed(seed: int = 42) -> None:
    tf.keras.utils.set_random_seed(seed)
    random.seed(seed)
    np.random.seed(seed)


def report_gpu() -> None:
    gpus = tf.config.list_physical_devices("GPU")
    if gpus:
        for g in gpus:
            print(f"  GPU: {g}")
        for g in tf.config.get_visible_device_list():
            try:
                print(f"  Memory: {tf.config.experimental.get_memory_info('GPU:' + g)}")
            except Exception:
                pass
    else:
        print("  WARNING: no GPU found — falling back to CPU (slow).")


def check_kaggle() -> None:
    if shutil.which("kaggle") is None:
        sys.exit("`kaggle` CLI not found. Install it:  pip install kaggle")
    default = Path.home() / ".kaggle" / "kaggle.json"
    if not default.exists():
        raise SystemExit(
            "kaggle.json not found at ~/.kaggle/kaggle.json. Put your Kaggle API key there."
        )


def download_datasets() -> None:
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ, KAGGLE_CONFIG_DIR=str(Path.home() / ".kaggle"))
    for dataset in DATASETS:
        dest = DOWNLOAD_DIR / (dataset.split("/")[-1] + ".zip")
        if dest.exists():
            print(f"  Already downloaded: {dest.name}")
            continue
        print(f"  Downloading {dataset} ...")
        subprocess.run(
            ["kaggle", "datasets", "download", "-d", dataset, "-p", str(DOWNLOAD_DIR)],
            env=env,
            check=True,
        )


def extract_breeds(zip_path: Path, breed_list: list[str], raw_dir: Path) -> None:
    tmp = WORK_DIR / "_extract" / zip_path.stem
    if tmp.exists():
        shutil.rmtree(tmp)
    tmp.mkdir(parents=True, exist_ok=True)

    shutil.unpack_archive(str(zip_path), str(tmp))

    moved = 0
    for path in tmp.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in (".jpg", ".jpeg", ".png"):
            continue
        key = path.name.lower().replace("_", "").replace("-", "")
        for breed in breed_list:
            if breed.lower() in key:
                out_name = RENAME_MAP.get(breed, breed.title())
                dst = raw_dir / out_name
                dst.mkdir(parents=True, exist_ok=True)
                filename = path.name
                dest = dst / filename
                if dest.exists():
                    dest = dst / f"{path.stem}_{hashlib.md5(str(path).encode()).hexdigest()[:8]}{path.suffix}"
                shutil.move(str(path), str(dest))
                moved += 1
                break

    shutil.rmtree(tmp)
    print(f"    {zip_path.name}: {moved} images matched")


def organize_raw() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    for dataset, breeds in DATASETS.items():
        zip_path = DOWNLOAD_DIR / (dataset.split("/")[-1] + ".zip")
        if zip_path.exists():
            print(f"Extracting {zip_path.name} ...")
            extract_breeds(zip_path, breeds, RAW_DIR)

    print("\nFinal counts per breed:")
    if not RAW_DIR.exists():
        return
    for breed in sorted(p.name for p in RAW_DIR.iterdir() if p.is_dir()):
        count = sum(1 for f in (RAW_DIR / breed).iterdir() if f.is_file())
        print(f"  {breed}: {count} images")


def split_data(scale: float) -> None:
    TRAIN_DIR.mkdir(parents=True, exist_ok=True)
    VAL_DIR.mkdir(parents=True, exist_ok=True)
    for breed_dir in sorted(RAW_DIR.iterdir()):
        if not breed_dir.is_dir():
            continue
        images = [p for p in breed_dir.iterdir() if p.suffix.lower() in (".jpg", ".jpeg", ".png")]
        random.shuffle(images)
        idx = int(len(images) * scale)
        for p in images[:idx]:
            (TRAIN_DIR / breed_dir.name / p.name).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, TRAIN_DIR / breed_dir.name / p.name)
        for p in images[idx:]:
            (VAL_DIR / breed_dir.name / p.name).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, VAL_DIR / breed_dir.name / p.name)
        print(f"  {breed_dir.name}: {idx} train, {len(images) - idx} val")

    print("Data ready at", WORK_DIR / "data")


def build_dataset(data_dir: Path, training: bool, batch_size: int) -> tf.data.Dataset:
    ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        labels="inferred",
        label_mode="int",
        class_names=CLASSES,
        image_size=(IMAGE_SIZE, IMAGE_SIZE),
        batch_size=batch_size,
        shuffle=training,
        seed=42 if training else None,
    )
    ds = ds.map(
        lambda x, y: (tf.cast(x, tf.float32) / 127.5 - 1.0, y),
        num_parallel_calls=tf.data.AUTOTUNE,
    )
    if training:
        aug = tf.keras.Sequential(
            [
                tf.keras.layers.RandomFlip("horizontal"),
                tf.keras.layers.RandomRotation(0.3),
                tf.keras.layers.RandomZoom(0.2),
                tf.keras.layers.RandomBrightness(0.15),
                tf.keras.layers.RandomContrast(0.1),
            ]
        )
        ds = ds.map(
            lambda x, y: (aug(x, training=True), y),
            num_parallel_calls=tf.data.AUTOTUNE,
        )
    return ds.prefetch(tf.data.AUTOTUNE)


def build_model():
    keras = tf.keras
    base = keras.applications.MobileNetV2(
        input_shape=(IMAGE_SIZE, IMAGE_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    base.trainable = False
    x = base.output
    x = keras.layers.GlobalAveragePooling2D()(x)
    x = keras.layers.Dropout(0.3)(x)
    x = keras.layers.Dense(256, activation="relu")(x)
    x = keras.layers.Dropout(0.2)(x)
    outputs = keras.layers.Dense(NUM_CLASSES, activation="softmax")(x)
    model = keras.models.Model(inputs=base.input, outputs=outputs)
    return model, base


def train_phase(model, train_ds, val_ds, epochs, lr, checkpoint_path, patience):
    keras = tf.keras
    model.compile(
        keras.optimizers.Adam(learning_rate=lr),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    callbacks = [
        keras.callbacks.EarlyStopping(monitor="val_loss", patience=patience, restore_best_weights=True),
        keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=patience // 2, min_lr=1e-7),
        keras.callbacks.ModelCheckpoint(str(checkpoint_path), monitor="val_accuracy", save_best_only=True),
    ]
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        callbacks=callbacks,
    )
    return history


def evaluate(model, val_ds) -> None:
    loss, acc = model.evaluate(val_ds, verbose=0)
    print(f"Validation Accuracy: {acc * 100:.2f}%")
    print(f"Validation Loss: {loss:.4f}")

    try:
        from sklearn.metrics import classification_report

        y_true = np.concatenate([y.numpy() for _, y in val_ds], axis=0)
        preds = model.predict(val_ds, verbose=1)
        y_pred = np.argmax(preds, axis=1)
        print(classification_report(y_true, y_pred, target_names=CLASSES))
    except ImportError:
        print("sklearn not installed — skipping classification report.")


def export_tfjs(model, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    h5_path = out_dir / "model_final.h5"
    model.save(str(h5_path))

    subprocess.run(
        [
            "tensorflowjs_converter",
            "--input_format=keras",
            "--output_format=tfjs_layers_model",
            str(h5_path),
            str(out_dir / "tfjs_model"),
        ],
        check=True,
    )

    metadata = {
        "tfjsVersion": "1.7.4",
        "timeStamp": datetime.now(timezone.utc).isoformat(),
        "userMetadata": {},
        "modelName": "atc-breed-model",
        "labels": CLASSES,
        "imageSize": IMAGE_SIZE,
    }
    with open(out_dir / "tfjs_model" / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
    print("TF.js model written to", out_dir / "tfjs_model")


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the ATC 8-breed model locally on GPU.")
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--split", type=float, default=0.8)
    parser.add_argument("--skip-download", action="store_true")
    parser.add_argument("--skip-phase1", action="store_true")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    setup_seed(args.seed)
    print("TensorFlow version:", tf.__version__)
    print("GPU devices:")
    report_gpu()

    check_kaggle()

    if not (TRAIN_DIR.exists() and any(TRAIN_DIR.iterdir())):
        if not args.skip_download:
            download_datasets()
        organize_raw()
        split_data(args.split)
    else:
        print("Existing train/val data found — skipping download and split.")

    train_ds = build_dataset(TRAIN_DIR, True, args.batch_size)
    val_ds = build_dataset(VAL_DIR, False, args.batch_size)

    model, base = build_model()
    model.summary()

    frozen_ckpt = OUTPUT_DIR / "best_model_frozen.h5"
    finetuned_ckpt = OUTPUT_DIR / "best_model_finetuned.h5"

    if not args.skip_phase1:
        print(f"\nPhase 1: training head (base frozen), lr=1e-3")
        train_phase(model, train_ds, val_ds, args.epochs, 1e-3, frozen_ckpt, patience=10)

    if frozen_ckpt.exists():
        model.load_weights(str(frozen_ckpt))
        print("Loaded frozen checkpoint.")

    print("\nPhase 2: fine-tuning top third, lr=1e-5")
    base.trainable = True
    fine_tune_at = len(base.layers) * 2 // 3
    for layer in base.layers[:fine_tune_at]:
        layer.trainable = False
    print(f"Fine-tuning from layer {fine_tune_at} of {len(base.layers)}")
    train_phase(model, train_ds, val_ds, args.epochs, 1e-5, finetuned_ckpt, patience=8)

    if not finetuned_ckpt.exists():
        raise SystemExit("No finetuned checkpoint found. Training may have failed.")
    model.load_weights(str(finetuned_ckpt))

    print("\nEvaluation:")
    evaluate(model, val_ds)

    export_tfjs(model, OUTPUT_DIR)
    print(
        "\nDone. Copy training/output/tfjs_model/* into public/models/ "
        "to update the deployed model."
    )


if __name__ == "__main__":
    main()