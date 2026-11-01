"""Narra um episódio com UMA VOZ POR PERSONAGEM (voz do Google, GEMINI_API_KEY).
Lê episodios/<id>.json: {"vozes": {"Narrador": "Fenrir", "Biel": "Puck", "Mae": "Sulafat", ...},
                          "grupos": [["Narrador", "Biel"], ["Mae"], ["Lorival"]],
                          "estilo": "...", "falas": [{"quem": "Narrador", "texto": "..."}, ...]}
O Gemini aceita até 2 vozes por pedido: o robô junta as falas de até 2 personagens por pedido
e grava episodios/<id>/voz_<A>_<B>.mp3. O corte fala a fala é feito depois (alinhamento pela transcrição).
python vozes.py p2"""
import base64, json, os, subprocess, sys, tempfile, time, urllib.error, urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
API = 'https://generativelanguage.googleapis.com/v1beta/models'
MODELOS = ['gemini-2.5-flash-preview-tts', 'gemini-2.5-pro-preview-tts']


def pedir(texto, vozes):
    chave = os.environ['GEMINI_API_KEY'].strip()
    if len(vozes) == 1:
        speech = {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': list(vozes.values())[0]}}}
    else:
        speech = {'multiSpeakerVoiceConfig': {'speakerVoiceConfigs': [
            {'speaker': q, 'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': v}}} for q, v in vozes.items()]}}
    corpo = {'contents': [{'parts': [{'text': texto}]}],
             'generationConfig': {'responseModalities': ['AUDIO'], 'speechConfig': speech}}
    ultimo = None
    for m in MODELOS:
        for t in range(4):
            req = urllib.request.Request(f'{API}/{m}:generateContent?key={chave}', data=json.dumps(corpo).encode(),
                                         method='POST', headers={'Content-Type': 'application/json'})
            try:
                with urllib.request.urlopen(req, timeout=240) as r:
                    d = json.loads(r.read().decode())
                cand = (d.get('candidates') or [{}])[0]
                if 'content' not in cand:
                    ultimo = f"{m}: recusado — {cand.get('finishReason')} {json.dumps(d.get('promptFeedback', {}))[:200]}"
                    print('  ', ultimo, flush=True); break
                for p in cand['content']['parts']:
                    if 'inlineData' in p:
                        return base64.b64decode(p['inlineData']['data'])
                ultimo = 'resposta sem áudio'
            except urllib.error.HTTPError as e:
                ultimo = f'{m}: {e.code} {e.read().decode(errors="replace")[:300]}'
                print('  ', ultimo, flush=True)
                if e.code in (429, 500, 503):
                    time.sleep(60); continue
            break
    raise RuntimeError(ultimo)


def main():
    ep_id = sys.argv[1]
    ep = json.loads((RAIZ / 'episodios' / f'{ep_id}.json').read_text(encoding='utf-8'))
    pasta = RAIZ / 'episodios' / ep_id
    pasta.mkdir(parents=True, exist_ok=True)
    grupos = ep.get('grupos') or [[q] for q in ep['vozes']]
    for g in grupos:
        nome = 'voz_' + '_'.join(g) + '.mp3'
        if (pasta / nome).exists():
            print('já existe', nome); continue
        falas = [f for f in ep['falas'] if f['quem'] in g]
        if not falas:
            continue
        if len(g) == 1:
            texto = (ep.get('estilo_por', {}).get(g[0]) or (ep['estilo'] + ' Fale como ' + g[0] + ':')) + '\n\n' + '\n\n'.join(f['texto'] for f in falas)
        else:
            texto = ep['estilo'] + f'\n\nConversa entre {g[0]} e {g[1]}:\n' + '\n'.join(f"{f['quem']}: {f['texto']}" for f in falas)
        try:
            pcm = pedir(texto, {q: ep['vozes'][q] for q in g})
        except Exception as e:  # noqa: BLE001
            print('FALHOU', nome, str(e)[:300], flush=True); continue
        tmp = Path(tempfile.mkdtemp()) / 'v.pcm'
        tmp.write_bytes(pcm)
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', str(tmp),
                        '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'libmp3lame', '-b:a', '192k', str(pasta / nome)], check=True)
        print('ok', nome, flush=True)
    print('total')


if __name__ == '__main__':
    main()
