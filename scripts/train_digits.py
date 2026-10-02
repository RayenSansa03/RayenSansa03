"""Trains the small network shown in the banner, and exports what the banner draws.

A multilayer perceptron (64 inputs -> 16 ReLU -> 10 softmax) learns to read handwritten digits
(scikit-learn's 8x8 "digits" dataset, 1,797 images). The banner shows real things only: test
images it never saw, the hidden activations it actually computes for them, its real output
probabilities, its real weights between the hidden and output layers, and its test accuracy.

Usage (from this folder): python scripts/train_digits.py  ->  data/digits_model.json
"""
import json

import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier

X, y = load_digits(return_X_y=True)
X = X / 16.0
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

mlp = MLPClassifier(hidden_layer_sizes=(16,), activation='relu', max_iter=800, random_state=0)
mlp.fit(X_tr, y_tr)
acc = mlp.score(X_te, y_te)

W1, b1 = mlp.coefs_[0], mlp.intercepts_[0]
W2 = mlp.coefs_[1]
hidden = np.maximum(0, X_te @ W1 + b1)
proba = mlp.predict_proba(X_te)
pred = proba.argmax(1)

# Four test images, four different digits, all read correctly, plus their numbers.
picked, seen = [], set()
for i in np.argsort(-proba.max(1)):
    if pred[i] == y_te[i] and y_te[i] not in seen and len(picked) < 3:
        picked.append(int(i)); seen.add(int(y_te[i]))
# and one the model is less sure about, still correct, so the bars are not always a single spike
for i in np.argsort(proba.max(1)):
    if pred[i] == y_te[i] and y_te[i] not in seen and proba[i].max() > 0.55:
        picked.append(int(i)); break

hmax = hidden[picked].max()
out = {
    'accuracy': round(float(acc), 4),
    'train': int(len(X_tr)), 'test': int(len(X_te)),
    'w2': np.round(W2, 3).tolist(),
    'samples': [
        {
            'label': int(y_te[i]),
            'image': np.round(X_te[i], 2).tolist(),
            'hidden': np.round(hidden[i] / hmax, 3).tolist(),
            'proba': np.round(proba[i], 4).tolist(),
        }
        for i in picked
    ],
}
json.dump(out, open('data/digits_model.json', 'w'), indent=1)
print(f"test accuracy {acc:.4f} on {len(X_te)} images; samples:", [(s['label'], max(s['proba'])) for s in out['samples']])
