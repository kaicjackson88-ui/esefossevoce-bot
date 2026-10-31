"""Gera imagens com o FLUX.2 [klein] 4B do Cloudflare Workers AI (grátis: 10 mil neurons/dia).
Segredos: CF_ACCOUNT_ID e CF_API_TOKEN. Lê arte/pedidos.json:
[{"id": "biel_ref", "w": 1024, "h": 1024, "prompt": "...", "refs": ["outro_id"], "seed": 7}]
"refs" = imagens já geradas em arte/ usadas como referência (mantém o mesmo personagem). Grava arte/<id>.png.
python arte_cf.py            -> gera só o que falta
python arte_cf.py biel_ref   -> refaz esses ids"""
import base64, io, json, os, sys, time, urllib.error, urllib.request, uuid
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
ARTE = RAIZ / 'arte'
CONTA = os.environ.get('CF_ACCOUNT_ID', '').strip()
TOKEN = os.environ.get('CF_API_TOKEN', '').strip()
MODELO = os.environ.get('CF_MODELO', '@cf/black-forest-labs/flux-2-klein-4b')


def log(*a):
    print(*a, flush=True)
    with open(ARTE / 'log.txt', 'a', encoding='utf-8') as f:
        f.write(' '.join(str(x) for x in a) + '\n')


def ref_pequena(caminho):
    """O modelo exige referências menores que 512x512."""
    from PIL import Image
    im = Image.open(caminho).convert('RGB')
    im.thumbnail((508, 508))
    b = io.BytesIO(); im.save(b, 'PNG')
    return b.getvalue()


def multipart(campos, arquivos):
    fronteira = uuid.uuid4().hex
    corpo = b''
    for k, v in campos.items():
        corpo += f'--{fronteira}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
    for k, dados in arquivos.items():
        corpo += (f'--{fronteira}\r\nContent-Disposition: form-data; name="{k}"; filename="{k}.png"\r\n'
                  'Content-Type: image/png\r\n\r\n').encode() + dados + b'\r\n'
    corpo += f'--{fronteira}--\r\n'.encode()
    return corpo, f'multipart/form-data; boundary={fronteira}'


def gerar(item):
    campos = {'prompt': item['prompt'], 'width': item.get('w', 1024), 'height': item.get('h', 1024)}
    if item.get('seed') is not None:
        campos['seed'] = item['seed']
    arquivos = {f'input_image_{i}': ref_pequena(ARTE / f'{r}.png') for i, r in enumerate(item.get('refs', [])[:4])}
    corpo, tipo = multipart(campos, arquivos)
    url = f'https://api.cloudflare.com/client/v4/accounts/{CONTA}/ai/run/{MODELO}'
    for t in range(3):
        req = urllib.request.Request(url, data=corpo, method='POST', headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': tipo})
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                bruto, ct = r.read(), r.headers.get('Content-Type', '')
            if 'json' in ct:
                d = json.loads(bruto)
                img = (d.get('result') or {}).get('image') if isinstance(d.get('result'), dict) else None
                if not img:
                    raise RuntimeError('resposta sem imagem: ' + bruto[:300].decode(errors='replace'))
                return base64.b64decode(img)
            return bruto
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors='replace')[:400]
            log(f'  HTTP {e.code}: {msg}')
            if e.code in (429, 500, 502, 503) and t < 2:
                time.sleep(15 * (t + 1)); continue
            raise RuntimeError(f'HTTP {e.code}')


def main():
    ARTE.mkdir(exist_ok=True)
    if not CONTA or not TOKEN:
        log('FALTA SEGREDO:', 'CF_ACCOUNT_ID ok' if CONTA else 'CF_ACCOUNT_ID vazio', '|', 'CF_API_TOKEN ok' if TOKEN else 'CF_API_TOKEN vazio')
        sys.exit(1)
    log('segredos OK (conta com', len(CONTA), 'caracteres) | GEMINI_API_KEY', 'ok' if os.environ.get('GEMINI_API_KEY', '').strip() else 'vazio')
    pedidos = json.loads((ARTE / 'pedidos.json').read_text(encoding='utf-8'))
    refazer = set(sys.argv[1:])
    for it in pedidos:
        destino = ARTE / f"{it['id']}.png"
        if destino.exists() and it['id'] not in refazer:
            continue
        t = time.time()
        try:
            dados = gerar(it)
            from PIL import Image
            Image.open(io.BytesIO(dados)).convert('RGB').save(destino, 'PNG')
            log(f"OK {it['id']} ({time.time() - t:.0f}s)")
        except Exception as e:  # noqa: BLE001
            log(f"falhou {it['id']}: {str(e)[:300]}")


if __name__ == '__main__':
    main()
