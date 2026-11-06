"""Sintetiza a trilha do anúncio (batida trap 120 BPM) e o som de venda "plim".
python3 ferramentas/beat.py  -> public/ad/beat.wav, public/ad/plim.wav, public/ad/hit.wav"""
import numpy as np, wave, os
SR = 48000
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'ad')
BPM = 120; B = 60 / BPM; DUR = 33.0


def salvar(nome, x):
    x = np.clip(x / (np.abs(x).max() + 1e-9) * 0.9, -1, 1)
    st = np.stack([x, x], 1)
    with wave.open(os.path.join(OUT, nome), 'w') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())


def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d)


def kick():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.18) * 1.2


def clap():
    n = int(0.25 * SR); r = np.random.default_rng(1).standard_normal(n)
    idx = np.arange(n)
    e = sum(env(n, 0.001, 0.012) * (idx >= int(k * SR)) for k in (0, 0.011, 0.022)) + env(n, 0.001, 0.09) * 0.6
    return np.convolve(r, [1, -0.9], 'same') * e * 0.5


def hat(d=0.03):
    n = int(0.08 * SR); r = np.random.default_rng(2).standard_normal(n)
    return np.diff(np.concatenate([[0], r])) * env(n, 0.0005, d) * 0.18


def b808(freq, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t + 0.3 * np.sin(2 * np.pi * freq * t))
    return np.tanh(s * 2.2) * env(n, 0.003, dur * 0.7) * 0.55


def pad(freqs, dur):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in freqs:
        for dt in (-0.12, 0, 0.12):
            ph = 2 * np.pi * f * (1 + dt / 100) * t
            s += 2 * (ph / (2 * np.pi) % 1) - 1
    s = np.convolve(s, np.ones(24) / 24, 'same')
    a = np.minimum(t / 0.4, 1) * np.minimum((dur - t) / 0.4, 1)
    return s * a * 0.05


def mix(buf, x, t, g=1.0):
    i = int(t * SR); j = min(len(buf), i + len(x))
    if i < len(buf): buf[i:j] += x[:j - i] * g


def trilha():
    buf = np.zeros(int(DUR * SR))
    raizes = [55.0, 43.65, 65.41, 49.0]
    acordes = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]]
    k, c = kick(), clap()
    for i in range(int(DUR / B)):
        t = i * B; barra = i // 4; pos = i % 4
        if pos == 0: mix(buf, pad(acordes[barra % 4], 4 * B), t)
        if t < 3.0:
            mix(buf, hat(0.02), t, 0.5); continue
        if pos == 0 or (pos == 2 and barra % 2): mix(buf, k, t)
        if pos == 3 and barra % 2 == 0: mix(buf, k, t + B / 2, 0.8)
        if pos in (1, 3): mix(buf, c, t)
        if pos == 0: mix(buf, b808(raizes[barra % 4], 4 * B * 0.9), t)
        rolo = (pos == 3 and barra % 4 == 3)
        for s in range(8 if rolo else 2):
            mix(buf, hat(), t + s * B / (8 if rolo else 2), 0.8 if s % 2 == 0 else 0.5)
    n = int(1.0 * SR); tt = np.arange(n) / SR
    rz = np.random.default_rng(3).standard_normal(n) * tt ** 2 * 0.25
    mix(buf, rz + np.sin(2 * np.pi * np.cumsum(300 + 1500 * tt) / SR) * tt * 0.08, 2.0)
    fade = np.ones(len(buf)); m = int(1.5 * SR); fade[-m:] = np.linspace(1, 0, m)
    return buf * fade


def plim():
    n = int(0.9 * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f, ini in ((1567.98, 0), (2093.0, 0.07)):
        tt = np.clip(t - ini, 0, None); on = t >= ini
        s += on * (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt / 0.22)
    s += np.random.default_rng(4).standard_normal(n) * np.exp(-t / 0.01) * 0.15
    return s


def hit():
    n = int(1.2 * SR); t = np.arange(n) / SR
    b = np.sin(2 * np.pi * np.cumsum(40 + 80 * np.exp(-t * 12)) / SR) * np.exp(-t / 0.5)
    r = np.random.default_rng(5).standard_normal(n) * np.exp(-t / 0.08) * 0.4
    return b + r


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    salvar('beat.wav', trilha()); salvar('plim.wav', plim()); salvar('hit.wav', hit())
    print('ok')
