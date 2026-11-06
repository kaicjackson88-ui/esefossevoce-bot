"""Gera por código os efeitos sonoros e as trilhas de fundo em public/biel/ (nada baixado da internet)."""
import numpy as np, wave, os
SR = 48000; OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'biel'); os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)
def salvar(n, x):
    x = np.asarray(x, dtype=np.float32); x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    w = wave.open(os.path.join(OUT, n), 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
t = lambda d: np.arange(int(SR * d)) / SR
def env(d, a=0.005, r=None):
    n = int(SR * d); e = np.ones(n); k = max(1, int(SR * a)); e[:k] = np.linspace(0, 1, k)
    return e * np.exp(-np.arange(n) / (SR * (r or d / 4)))
def lp(x, k):
    return np.convolve(x, np.ones(k) / k, mode='same')
# boom: grave caindo + ruído
d = 1.6; f = 90 * np.exp(-t(d) * 2.2) + 35; boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, r=0.45) + lp(rng.standard_normal(len(t(d))), 40) * env(d, r=0.08) * 0.6
salvar('boom.wav', boom)
d = 0.18; salvar('pop.wav', np.sin(2 * np.pi * (600 + 900 * np.exp(-t(d) * 40)) * t(d)) * env(d, r=0.04))
d = 0.6; n1 = np.sin(2 * np.pi * 1318 * t(d)) * env(d, r=0.12); n2 = np.sin(2 * np.pi * 1760 * t(d)) * env(d, r=0.15)
noti = np.concatenate([n1[:int(SR * .12)], n2]); salvar('noti.wav', noti)
d = 0.7; ns = rng.standard_normal(len(t(d))); k = np.linspace(80, 6, len(ns)).astype(int)
wh = np.array([ns[max(0, i - kk):i + 1].mean() for i, kk in enumerate(k)]) * np.sin(np.pi * np.linspace(0, 1, len(ns)))
salvar('sfx_whoosh.wav', wh)
d = 1.4; f = 200 + 1200 * (t(d) / d) ** 2; rz = np.sin(2 * np.pi * np.cumsum(f) / SR) * (t(d) / d) ** 1.5 + lp(rng.standard_normal(len(t(d))), 6) * (t(d) / d) ** 2 * 0.4
salvar('sfx_riser.wav', rz)
d = 0.05; salvar('tique.wav', np.sin(2 * np.pi * 2500 * t(d)) * env(d, a=0.001, r=0.008))
d = 1.6; hb = np.zeros(len(t(d)))
for s0 in (0.0, 0.25, 0.85, 1.1):
    i = int(s0 * SR); b = np.sin(2 * np.pi * 55 * t(0.18)) * env(0.18, r=0.05); hb[i:i + len(b)] += b[:len(hb) - i]
salvar('coracao.wav', hb)
d = 0.9; vb = np.sign(np.sin(2 * np.pi * 150 * t(d))) * (np.sin(2 * np.pi * 9 * t(d)) > 0) * 0.5; salvar('vibra.wav', lp(vb, 20))
d = 1.0; salvar('pneu.wav', lp(rng.standard_normal(len(t(d))), 3) * np.sin(2 * np.pi * 900 * t(d)) * env(d, a=0.05, r=0.5))
# trilhas: pulso grave + pad, tensão leve (60 s)
def trilha(nome, base, bpm, menor=True):
    d = 60; x = np.zeros(int(SR * d)); T = t(d); beat = 60 / bpm
    for k in range(int(d / beat)):
        i = int(k * beat * SR); b = np.sin(2 * np.pi * base * t(0.35)) * env(0.35, r=0.12); x[i:i + len(b)] += b[:len(x) - i] * (1 if k % 4 == 0 else 0.55)
    terca = 1.189 if menor else 1.26
    pad = sum(np.sin(2 * np.pi * base * 2 * m * T + np.sin(2 * np.pi * 0.2 * T) * 0.3) for m in (1, terca, 1.498)) * 0.18
    x += pad * (0.6 + 0.4 * np.sin(2 * np.pi * T / 8))
    tic = np.zeros_like(x)
    for k in range(int(d / (beat / 2))):
        i = int(k * beat / 2 * SR); b = rng.standard_normal(int(SR * 0.02)) * env(0.02, a=0.001, r=0.006); tic[i:i + len(b)] += b[:len(x) - i]
    x += lp(tic, 2) * 0.12
    fade = np.ones_like(x); fade[-SR * 3:] = np.linspace(1, 0, SR * 3); salvar(nome, x * fade)
trilha('musica_bl1.wav', 55, 96); trilha('musica_pr1.wav', 49, 104); trilha('musica_px.wav', 52, 88)
print('sons ok:', sorted(os.listdir(OUT)))
