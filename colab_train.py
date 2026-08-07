# -*- coding: utf-8 -*-
"""
Train MobileNetV2 for Animal Breed Classification (8 Indian Breeds)
Compatible with existing ATC project — replaces Teachable Machine model.

Downloads ONLY the needed breed folders from Kaggle datasets via API.
No full dataset download needed.

8 Breeds: Gir, Sahiwal, Kankrej, Ongole, Murrah, Surti, Jaffarabadi, Bhadawari
Preprocessing: pixels / 127.5 - 1.0  (matches current TF.js loader)
"""

# ─────────────────────────────────────────────────────────────
# CELL 1: Install dependencies
# ─────────────────────────────────────────────────────────────
"""
!pip install --no-cache-dir tensorflowjs kaggle

import os, zipfile, shutil, random, json
import tensorflow as tf
import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import confusion_matrix, classification_report
import seaborn as sns
print('Done')
"""

# ─────────────────────────────────────────────────────────────
# CELL 2: Upload Kaggle API key & download datasets
# ─────────────────────────────────────────────────────────────
"""
from google.colab import files

print('Please upload your kaggle.json file:')
!mkdir -p ~/.kaggle
uploaded = files.upload()
for fn in uploaded.keys():
    !mv "$fn" ~/.kaggle/kaggle.json
!chmod 600 ~/.kaggle/kaggle.json

!kaggle datasets download atharvadarpude/indian-cattle-image-dataset
!kaggle datasets download atharvadarpude/indian-buffalo-dataset
!kaggle datasets download birendranathnandi/indian-cattle-and-buffalo-breeds-dataset
print('Downloads complete')
"""

# ─────────────────────────────────────────────────────────────
# CELL 3: Extract ONLY the 8 breed folders we need
# ─────────────────────────────────────────────────────────────
"""
CATTLE_ZIP = '/content/indian-cattle-image-dataset.zip'
BUFFALO_ZIP = '/content/indian-buffalo-dataset.zip'
EXTRA_ZIP = '/content/indian-cattle-and-buffalo-breeds-dataset.zip'

CATTLE_BREEDS = ['Gir', 'Sahiwal', 'Kankrej', 'Ongole']
BUFFALO_BREEDS = ['Murrah', 'Surti', 'Jaffarabadi', 'bhadwari']

RAW_DIR = '/content/raw_data'
os.makedirs(RAW_DIR, exist_ok=True)

def extract_breeds_simple(zip_path, breed_list, raw_dir, rename_map=None):
    if rename_map is None:
        rename_map = {}
    with zipfile.ZipFile(zip_path, 'r') as zf:
        for name in zf.namelist():
            if name.endswith('/'):
                continue
            if not any(name.lower().endswith(ext) for ext in ('.jpg', '.jpeg', '.png')):
                continue
            for breed in breed_list:
                if breed.lower() in name.lower().replace('_', '').replace('-', ''):
                    out_name = rename_map.get(breed, breed.title().replace('Bhadwari', 'Bhadawari'))
                    dest_dir = os.path.join(raw_dir, out_name)
                    os.makedirs(dest_dir, exist_ok=True)
                    filename = os.path.basename(name)
                    dst_path = os.path.join(dest_dir, filename)
                    if os.path.exists(dst_path):
                        base, ext = os.path.splitext(filename)
                        dst_path = os.path.join(dest_dir, f"{base}_{hash(name) & 0xFFFF}{ext}")
                    zf.extract(name, '/content/tmp_extract')
                    src = os.path.join('/content/tmp_extract', name)
                    if os.path.isfile(src):
                        shutil.move(src, dst_path)
                    break
    if os.path.exists('/content/tmp_extract'):
        shutil.rmtree('/content/tmp_extract')

print('Extracting cattle breeds...')
extract_breeds_simple(CATTLE_ZIP, CATTLE_BREEDS, RAW_DIR)

print('Extracting buffalo breeds...')
extract_breeds_simple(BUFFALO_ZIP, BUFFALO_BREEDS, RAW_DIR, rename_map={'bhadwari': 'Bhadawari'})

print('Extracting extra dataset...')
ALL_8 = ['Gir', 'Sahiwal', 'Kankrej', 'Ongole', 'Murrah', 'Surti', 'Jaffarabadi', 'Bhadawari', 'bhadwari']
extract_breeds_simple(EXTRA_ZIP, ALL_8, RAW_DIR, rename_map={'bhadwari': 'Bhadawari'})

print('\nFinal counts per breed:')
for breed in sorted(os.listdir(RAW_DIR)):
    count = len([f for f in os.listdir(os.path.join(RAW_DIR, breed))
                 if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    print(f'  {breed}: {count} images')
"""

# ─────────────────────────────────────────────────────────────
# CELL 4: Split into train (80%) / val (20%)
# ─────────────────────────────────────────────────────────────
"""
TRAIN_DIR = '/content/data/train'
VAL_DIR = '/content/data/val'
os.makedirs(TRAIN_DIR, exist_ok=True)
os.makedirs(VAL_DIR, exist_ok=True)

random.seed(42)
for breed in sorted(os.listdir(RAW_DIR)):
    breed_path = os.path.join(RAW_DIR, breed)
    if not os.path.isdir(breed_path):
        continue
    images = [f for f in os.listdir(breed_path)
              if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    random.shuffle(images)
    split_idx = int(len(images) * 0.8)
    os.makedirs(os.path.join(TRAIN_DIR, breed), exist_ok=True)
    os.makedirs(os.path.join(VAL_DIR, breed), exist_ok=True)
    for img in images[:split_idx]:
        shutil.copy2(os.path.join(breed_path, img), os.path.join(TRAIN_DIR, breed, img))
    for img in images[split_idx:]:
        shutil.copy2(os.path.join(breed_path, img), os.path.join(VAL_DIR, breed, img))
    print(f'{breed}: {split_idx} train, {len(images)-split_idx} val')

print('Data ready at /content/data/')
"""

# ─────────────────────────────────────────────────────────────
# CELL 5: Configure training parameters
# ─────────────────────────────────────────────────────────────
"""
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator

IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 100
NUM_CLASSES = 8

CLASSES = ['Gir', 'Sahiwal', 'Kankrej', 'Ongole',
           'Murrah', 'Surti', 'Jaffarabadi', 'Bhadawari']

train_dir = '/content/data/train'
val_dir = '/content/data/val'

print('TF version:', tf.__version__)
print('GPU devices:', tf.config.list_physical_devices('GPU'))
print('Classes:', CLASSES)
"""

# ─────────────────────────────────────────────────────────────
# CELL 6: Data generators with augmentation
# ─────────────────────────────────────────────────────────────
"""
train_datagen = ImageDataGenerator(
    preprocessing_function=keras.applications.mobilenet_v2.preprocess_input,
    rotation_range=30,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.15,
    zoom_range=0.2,
    horizontal_flip=True,
    brightness_range=[0.8, 1.2],
    fill_mode='nearest',
)

val_datagen = ImageDataGenerator(
    preprocessing_function=keras.applications.mobilenet_v2.preprocess_input,
)

train_generator = train_datagen.flow_from_directory(
    train_dir, target_size=(IMG_SIZE, IMG_SIZE), batch_size=BATCH_SIZE,
    class_mode='categorical', classes=CLASSES, shuffle=True,
)

val_generator = val_datagen.flow_from_directory(
    val_dir, target_size=(IMG_SIZE, IMG_SIZE), batch_size=BATCH_SIZE,
    class_mode='categorical', classes=CLASSES, shuffle=False,
)

print('Class mapping:', train_generator.class_indices)
"""

# ─────────────────────────────────────────────────────────────
# CELL 7: Build MobileNetV2 model
# ─────────────────────────────────────────────────────────────
"""
base_model = MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights='imagenet',
)
base_model.trainable = False

x = base_model.output
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.3)(x)
x = layers.Dense(256, activation='relu')(x)
x = layers.Dropout(0.2)(x)
x = layers.Dense(NUM_CLASSES, activation='softmax')(x)

model = models.Model(inputs=base_model.input, outputs=x)

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=1e-3),
    loss='categorical_crossentropy',
    metrics=['accuracy'],
)

model.summary()
"""

# ─────────────────────────────────────────────────────────────
# CELL 8: Phase 1 — train head (frozen base)
# ─────────────────────────────────────────────────────────────
"""
callbacks = [
    keras.callbacks.EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True),
    keras.callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=1e-7),
    keras.callbacks.ModelCheckpoint('/content/best_model_frozen.h5', monitor='val_accuracy', save_best_only=True),
]

print('Phase 1: Training head (base frozen)...')
history = model.fit(
    train_generator,
    steps_per_epoch=train_generator.samples // BATCH_SIZE,
    validation_data=val_generator,
    validation_steps=val_generator.samples // BATCH_SIZE,
    epochs=EPOCHS,
    callbacks=callbacks,
)
"""

# ─────────────────────────────────────────────────────────────
# CELL 8b: RECOVERY — use if runtime disconnected after Phase 1
# ─────────────────────────────────────────────────────────────
"""
print('Data folder exists:', os.path.isdir('/content/data/train'))
print('Checkpoint exists:', os.path.isfile('/content/best_model_frozen.h5'))

model.load_weights('/content/best_model_frozen.h5')
print('Checkpoint loaded! Run Cell 9 for fine-tuning.')
"""

# ─────────────────────────────────────────────────────────────
# CELL 9: Phase 2 — fine-tune last layers
# ─────────────────────────────────────────────────────────────
"""
base_model.trainable = True
fine_tune_at = len(base_model.layers) // 3 * 2
for layer in base_model.layers[:fine_tune_at]:
    layer.trainable = False

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=1e-5),
    loss='categorical_crossentropy',
    metrics=['accuracy'],
)

callbacks_ft = [
    keras.callbacks.EarlyStopping(monitor='val_loss', patience=8, restore_best_weights=True),
    keras.callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=4, min_lr=1e-8),
    keras.callbacks.ModelCheckpoint('/content/best_model_finetuned.h5', monitor='val_accuracy', save_best_only=True),
]

print('Phase 2: Fine-tuning...')
history_ft = model.fit(
    train_generator,
    steps_per_epoch=train_generator.samples // BATCH_SIZE,
    validation_data=val_generator,
    validation_steps=val_generator.samples // BATCH_SIZE,
    epochs=EPOCHS,
    callbacks=callbacks_ft,
)
"""

# ─────────────────────────────────────────────────────────────
# CELL 10: Evaluate
# ─────────────────────────────────────────────────────────────
"""
val_generator.reset()
predictions = model.predict(val_generator, verbose=1)
y_pred = np.argmax(predictions, axis=1)
y_true = val_generator.classes

cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', xticklabels=CLASSES, yticklabels=CLASSES)
plt.title('Confusion Matrix')
plt.ylabel('True')
plt.xlabel('Predicted')
plt.show()

print(classification_report(y_true, y_pred, target_names=CLASSES))

val_loss, val_acc = model.evaluate(val_generator, verbose=0)
print(f'Validation Accuracy: {val_acc*100:.2f}%')
print(f'Validation Loss: {val_loss:.4f}')
"""

# ─────────────────────────────────────────────────────────────
# CELL 11: Convert to TF.js LayersModel
# ─────────────────────────────────────────────────────────────
"""
!mkdir -p /content/tfjs_model

model.load_weights('/content/best_model_finetuned.h5')
model.save('/content/model_final.h5')

!tensorflowjs_converter \
    --input_format=keras \
    --output_format=tfjs_layers_model \
    /content/model_final.h5 \
    /content/tfjs_model/

print('TF.js model files:')
!ls -la /content/tfjs_model/
"""

# ─────────────────────────────────────────────────────────────
# CELL 12: Generate metadata.json
# ─────────────────────────────────────────────────────────────
"""
metadata = {
    "tfjsVersion": "1.7.4",
    "tmVersion": "2.4.14",
    "packageVersion": "0.8.4-alpha2",
    "packageName": "@teachablemachine/image",
    "timeStamp": "2026-07-23T00:00:00.000Z",
    "userMetadata": {},
    "modelName": "atc-breed-model",
    "labels": CLASSES,
    "imageSize": IMG_SIZE,
}

with open('/content/tfjs_model/metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print('metadata.json:')
!cat /content/tfjs_model/metadata.json
"""

# ─────────────────────────────────────────────────────────────
# CELL 13: Download TF.js model ZIP
# ─────────────────────────────────────────────────────────────
"""
shutil.make_archive('/content/tfjs_model', 'zip', '/content/tfjs_model')

from google.colab import files
files.download('/content/tfjs_model.zip')
print('Done — extract model.json + weights.bin + metadata.json into public/models/')
"""
