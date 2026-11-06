"""Corta a voz de um episódio em cenas e gera src/biel_<ep>.json.
python ferramentas/montar.py <ep> <cortes em s, vírgula> <imagens por cena, vírgula>
Lê a voz de ../episodios/<ep>/voz_*.mp3 e as falas de ../episodios/<ep>.json."""
import json, wave, subprocess, numpy as np, re, sys, os, glob
EP = sys.argv[1]; CORTES = [float(x) for x in sys.argv[2].split(',')]; IMGS = sys.argv[3].split(',')
ED = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); BOT = os.path.dirname(ED)
OUT = f'{ED}/public/biel/{EP}/'; os.makedirs(OUT, exist_ok=True)
ep = json.load(open(f'{BOT}/episodios/{EP}.json'))
mp3 = sorted(glob.glob(f'{BOT}/episodios/{EP}/voz_*.mp3'))[0]
tmpw = OUT + 'tudo.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp3, '-ac', '1', '-c:a', 'pcm_s16le', tmpw], check=True)
w = wave.open(tmpw); sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)
def minimo(t, jan=0.1):
    i0, i1 = int((t - jan) * sr), int((t + jan) * sr); hop = 240
    e = [np.mean(a[i:i + hop] ** 2) for i in range(i0, i1 - hop, hop)]
    return (i0 + int(np.argmin(e)) * hop + hop // 2) / sr
tot = len(a) / sr
cs = [0] + [minimo(c) for c in CORTES] + [tot]
falas = ep['falas']
PRE, POS = 0.05, 0.3
cenas = []
for j, img in enumerate(IMGS):
    t0, t1 = cs[j], cs[j + 1]
    b = a[int(t0 * sr):int(t1 * sr)]
    b = np.concatenate([np.zeros(int(PRE * sr)), b, np.zeros(int(POS * sr))]).astype(np.int16)
    tmp = OUT + 'tmp.wav'; ww = wave.open(tmp, 'wb'); ww.setnchannels(1); ww.setsampwidth(2); ww.setframerate(sr); ww.writeframes(b.tobytes()); ww.close()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', 'afade=t=in:d=0.02,areverse,afade=t=in:d=0.05,areverse', '-c:a', 'libmp3lame', '-b:a', '192k', OUT + f'c{j + 1:02d}.mp3'], check=True)
    dur = len(b) / sr
    hop = int(sr * 0.01); e = np.array([np.sqrt(np.mean(b[i:i + hop].astype(np.float32) ** 2)) + 1e-9 for i in range(0, len(b) - hop, hop)])
    on = 20 * np.log10(e / 32768) > -38
    reg = []; i = 0
    while i < len(on):
        if on[i]:
            j2 = i
            while j2 < len(on) and (on[j2] or (j2 + 12 < len(on) and on[j2:j2 + 12].any())): j2 += 1
            if j2 - i > 5: reg.append((i * 0.01, j2 * 0.01))
            i = j2
        else: i += 1
    texto = falas[j]['texto']; ws = texto.split()
    pesos = [len(re.sub(r'\W', '', x)) + 1.5 for x in ws]; total_fala = sum(r[1] - r[0] for r in reg); acc = 0; pal = []
    def real(x):
        for r0, r1 in reg:
            if x <= r1 - r0: return r0 + x
            x -= r1 - r0
        return reg[-1][1]
    for x, p in zip(ws, pesos):
        d = p / sum(pesos) * total_fala
        pal.append({'palavra': re.sub(r'[^\wÀ-ú-]', '', x), 'inicio': round(real(acc + 0.001), 3), 'fim': round(real(acc + d), 3)}); acc += d
    cenas.append({'img': img, 'dur': round(dur, 3), 'falas': [{'quem': falas[j]['quem'], 'texto': texto, 'palavras': pal}]})
    print(j + 1, img, falas[j]['quem'], round(dur, 2), texto[:40])
for f in (tmpw, OUT + 'tmp.wav'):
    if os.path.exists(f): os.remove(f)
json.dump({'cenas': cenas}, open(f'{ED}/src/biel_{EP}.json', 'w'), ensure_ascii=False)
print('total', round(sum(c['dur'] for c in cenas), 1))
