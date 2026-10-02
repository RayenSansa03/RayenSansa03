"""A denoising autoencoder that stores each letter of my name as two numbers, and draws it back.

Each letter is a 5x7 pixel glyph (35 values). The network squeezes it through a 2-unit
bottleneck (35 -> 16 -> 2 -> 16 -> 35) and learns to rebuild the clean glyph from noisy copies.
The banner shows, for every letter of my name, its real latent code (the two numbers the
encoder outputs) and the real reconstruction the decoder draws from them.

Usage (from this folder): python scripts/train_autoencoder.py  ->  data/autoencoder_name.json
"""
import json

import numpy as np
from sklearn.neural_network import MLPRegressor

NAME = 'MOHAMED RAYEN SANSA'
G = {
    'M': ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
    'O': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    'H': ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    'A': ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    'E': ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    'D': ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    'R': ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    'Y': ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
    'N': ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    'S': ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
}
letters = sorted(G)
clean = {k: np.array([int(b) for row in G[k] for b in row], dtype=float) for k in letters}

rng = np.random.default_rng(0)
X, Y = [], []
for _ in range(400):
    for k in letters:
        x = clean[k].copy()
        flip = rng.random(35) < 0.08          # 8 % of pixels flipped
        x[flip] = 1 - x[flip]
        X.append(x); Y.append(clean[k])
X, Y = np.array(X), np.array(Y)

ae = MLPRegressor(hidden_layer_sizes=(16, 2, 16), activation='tanh', max_iter=3000, random_state=1, tol=1e-6)
ae.fit(X, Y)

def forward(x, upto):
    a = x
    for i in range(upto):
        a = a @ ae.coefs_[i] + ae.intercepts_[i]
        if i < len(ae.coefs_) - 1:
            a = np.tanh(a)
    return a

codes = {k: forward(clean[k], 2) for k in letters}           # input -> 16 -> 2
recon = {k: np.clip(ae.predict(clean[k][None])[0], 0, 1) for k in letters}
err = float(np.mean([np.mean((recon[k] - clean[k]) ** 2) for k in letters]))
pix_ok = float(np.mean([np.mean((recon[k] > 0.5) == (clean[k] > 0.5)) for k in letters]))

out = {
    'name': NAME, 'architecture': '35-16-2-16-35', 'mse': round(err, 4), 'pixel_accuracy': round(pix_ok, 4),
    'letters': {k: {'code': [round(float(v), 2) for v in codes[k]], 'recon': [round(float(v), 2) for v in recon[k]]} for k in letters},
}
json.dump(out, open('data/autoencoder_name.json', 'w'), indent=1)
print(f"mse {err:.4f}, pixels right {pix_ok:.3%}")
for k in letters:
    print(k, out['letters'][k]['code'])
