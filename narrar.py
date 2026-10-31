"""Narra um episódio inteiro com UM pedido à voz do Google (economiza cota) e corta o áudio por cena nas pausas.
python narrar.py p1  -> episodios/p1/cNN.mp3 e episodios/p1/tempos.json ({"cenas": [{"img", "fala", "dur", "palavras": [...]}]})"""
import json, re, subprocess, sys, tempfile, time
from pathlib import Path
import numpy as np
from scipy.io import wavfile
import voz_google

RAIZ = Path(__file__).resolve().parent
ep_id = sys.argv[1]
ep = json.loads((RAIZ / 'episodios' / f'{ep_id}.json').read_text(encoding='utf-8'))
pasta = RAIZ / 'episodios' / ep_id
pasta.mkdir(parents=True, exist_ok=True)
falas = [c['fala'] for c in ep['cenas']]
texto = '\n\n'.join(falas)
voz_google.ESTILO = ('Narre em português do Brasil, sotaque brasileiro natural, como um contador de histórias de suspense: voz grave, '
                     'ritmo envolvente, tensão nas pausas, sem soar como locutor nem robô. Faça uma pausa de um segundo entre cada parágrafo. Texto:\n\n')
tmp = Path(tempfile.mkdtemp())
tudo = pasta / 'tudo.mp3'
if tudo.exists():  # reaproveita a narração já feita (não gasta cota de novo)
    import shutil; shutil.copy(tudo, tmp / 'tudo.mp3')
for t in range(0 if tudo.exists() else 5):
    try:
        voz_google.falar(texto, str(tmp / 'tudo.mp3'), ep.get('voz', 'pt-BR-AntonioNeural'), ep.get('rate', '+0%'))
        break
    except Exception as e:  # noqa: BLE001
        print('voz falhou:', str(e)[:600], flush=True)
        voz_google._ESTADO['fora_ate'] = 0
        time.sleep(65)
else:
    if not tudo.exists():
        sys.exit('não consegui narrar (cota da voz do Google esgotada?)')
if not tudo.exists():
    import shutil; shutil.copy(tmp / 'tudo.mp3', tudo); print('narração completa salva', flush=True)
if '--so-audio' in sys.argv:
    print('total (só o áudio)'); sys.exit(0)

subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(tmp / 'tudo.mp3'), '-ac', '1', '-ar', '24000', str(tmp / 'tudo.wav')], check=True)
sr, x = wavfile.read(tmp / 'tudo.wav'); x = x.astype(np.float32) / 32768
jan = sr // 50; n = len(x) // jan
en = np.sqrt((x[:n * jan].reshape(n, jan) ** 2).mean(1))
cala = en < max(0.01, float(np.percentile(en, 95)) * 0.05)
# silêncios: (início, fim) em janelas
sil, i = [], 0
while i < n:
    if cala[i]:
        j = i
        while j < n and cala[j]: j += 1
        if j - i >= 8: sil.append((i, j))
        i = j
    else:
        i += 1
# cada corte = o silêncio mais longo perto da posição esperada (proporcional ao tamanho do texto)
pesos = np.cumsum([len(f) for f in falas]); pesos = pesos / pesos[-1]
cortes, usados = [], set()
for k in range(len(falas) - 1):
    alvo = pesos[k] * n
    cands = [(s[1] - s[0]) - abs((s[0] + s[1]) / 2 - alvo) / (n * 0.08) for s in sil]
    ordem = sorted(range(len(sil)), key=lambda q: -cands[q])
    q = next((q for q in ordem if q not in usados and (not cortes or sil[q][0] > cortes[-1])), None)
    if q is None: sys.exit('não achei as pausas entre as cenas')
    usados.add(q); cortes.append((sil[q][0] + sil[q][1]) // 2)
limites = [0] + [c * jan for c in cortes] + [len(x)]
saida = []
for k, c in enumerate(ep['cenas']):
    seg = x[limites[k]:limites[k + 1]]
    nz = np.where(np.abs(seg) > 0.02)[0]
    seg = seg[max(0, nz[0] - sr // 20): nz[-1] + sr // 10] if len(nz) else seg
    w = tmp / f'c{k}.wav'; wavfile.write(w, sr, (seg * 32767).astype(np.int16))
    mp3 = pasta / f'c{k + 1:02d}.mp3'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(w), '-c:a', 'libmp3lame', '-b:a', '160k', str(mp3)], check=True)
    pal = voz_google._tempos(seg, re.findall(r'[\w]+', c['fala'], flags=re.UNICODE))
    saida.append({'img': c['img'], 'fala': c['fala'], 'dur': round(len(seg) / sr, 3), 'palavras': pal})
    print(f'cena {k + 1}: {len(seg) / sr:.1f}s', flush=True)
(pasta / 'tempos.json').write_text(json.dumps({'cenas': saida}, ensure_ascii=False, indent=1), encoding='utf-8')
print('total', round(sum(c['dur'] for c in saida), 1), 's')
