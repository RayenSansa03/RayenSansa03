"""A character-level language model trained on the text of my portfolio, used to "write" my name.

Trigram model (each character predicted from the two before it), add-k smoothing, trained on
every text field of the portfolio content (projects, internships, profile, FR and EN). For each
character of my name it records the model's real top-3 next-character probabilities given the
two characters before, and the probability it gave to the right one. The banner draws exactly
that: what the model "thinks" at each step, as an LLM decodes a word.

Usage (from this folder): python scripts/train_charlm.py  ->  data/charlm_name.json
"""
import glob
import json
import re
from collections import Counter, defaultdict

NAME = 'Mohamed Rayen Sansa'
K = 0.05  # add-k smoothing

texts = []
for path in glob.glob('C:/dev/portfolio/src/content/**/*.*', recursive=True):
    if path.endswith(('.yaml', '.mdx', '.md')):
        raw = open(path, encoding='utf-8').read()
        raw = re.sub(r'^[\w-]+:\s*$', ' ', raw, flags=re.M)  # yaml keys alone on a line
        raw = re.sub(r'[\w/-]+\.(png|jpe?g|gif|svg|webp|pdf|mp4)', ' ', raw)  # file paths
        texts.append(raw)
corpus = re.sub(r'\s+', ' ', ' '.join(texts))
vocab = sorted(set(corpus) | set(NAME))
counts = defaultdict(Counter)
padded = '\x02\x02' + corpus
for i in range(2, len(padded)):
    counts[padded[i - 2:i]][padded[i]] += 1

def dist(ctx):
    c = counts[ctx]
    total = sum(c.values()) + K * len(vocab)
    return {ch: (c[ch] + K) / total for ch in vocab}

steps, logp = [], 0.0
text = '\x02\x02' + NAME
for i in range(2, len(text)):
    ctx, true = text[i - 2:i], text[i]
    d = dist(ctx)
    top = sorted(d.items(), key=lambda kv: -kv[1])[:3]
    p = d[true]
    import math
    logp += math.log(p)
    steps.append({
        'context': NAME[:i - 2][-6:],
        'char': true,
        'p': round(p, 4),
        'top': [[ch, round(pr, 4)] for ch, pr in top],
    })

out = {'name': NAME, 'order': 3, 'chars': len(corpus), 'vocab': len(vocab),
       'perplexity_name': round(math.exp(-logp / len(NAME)), 2), 'steps': steps}
json.dump(out, open('data/charlm_name.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f"trained on {len(corpus)} chars, vocab {len(vocab)}; name perplexity {out['perplexity_name']}")
for s in steps:
    print(repr(s['context']), '->', repr(s['char']), s['p'], s['top'])
