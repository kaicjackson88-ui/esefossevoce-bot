"""Gera a narração de um episódio com a voz do Google (GEMINI_API_KEY), uma fala por cena.
python narrar.py p1  -> episodios/p1/cNN.mp3 e episodios/p1/tempos.json ({"cenas": [{"img", "fala", "dur", "palavras": [...]}]})"""
import json, subprocess, sys, time
from pathlib import Path
import voz_google

RAIZ = Path(__file__).resolve().parent
ep_id = sys.argv[1]
ep = json.loads((RAIZ / 'episodios' / f'{ep_id}.json').read_text(encoding='utf-8'))
pasta = RAIZ / 'episodios' / ep_id
pasta.mkdir(parents=True, exist_ok=True)
saida = []
for i, c in enumerate(ep['cenas'], 1):
    mp3 = pasta / f'c{i:02d}.mp3'
    for t in range(4):
        try:
            pal = voz_google.falar(c['fala'], str(mp3), ep.get('voz', 'pt-BR-AntonioNeural'), ep.get('rate', '+0%'))
            break
        except Exception as e:  # noqa: BLE001
            print(f'cena {i} falhou ({e}); nova tentativa em 40 s', flush=True); voz_google._ESTADO['fora_ate'] = 0; time.sleep(40)
    else:
        sys.exit(f'não consegui narrar a cena {i}')
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(mp3)],
                               capture_output=True, text=True).stdout.strip())
    saida.append({'img': c['img'], 'fala': c['fala'], 'dur': round(dur, 3), 'palavras': pal})
    print(f'cena {i}: {dur:.1f}s', flush=True)
(pasta / 'tempos.json').write_text(json.dumps({'cenas': saida}, ensure_ascii=False, indent=1), encoding='utf-8')
print('total', round(sum(c['dur'] for c in saida), 1), 's')
