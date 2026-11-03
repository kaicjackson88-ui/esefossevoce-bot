"""YouTube Shorts do canal O Corre do Biel (API oficial YouTube Data v3).

Sobe no YouTube os episódios do Biel que já foram publicados no Instagram (estado.json), na ordem,
com título, descrição, tags e o comentário de votação. Robô separado do Meu Cão Obedece.

python youtube.py autorizar <codigo>   # uma vez: código da página yt-biel.html
python youtube.py enviar [n]           # sobe os episódios que faltam (padrão: todos)
python youtube.py metricas             # views/likes/comentários -> dados/youtube_metricas.json

Segredos: YT_CLIENT_ID, YT_CLIENT_SECRET. Token criptografado em dados/youtube_token.enc.
Enquanto o projeto do Google não passar pela auditoria da API, o YouTube deixa os vídeos como
"privado": é só mudar para Público no YouTube Studio.
"""
import json, os, re, subprocess, sys, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
CID = os.environ.get('YT_CLIENT_ID', '').strip()
CS = os.environ.get('YT_CLIENT_SECRET', '').strip()
REDIRECT = 'https://kaicjackson88-ui.github.io/meucaoobedece-postss/yt-biel.html'
DADOS = RAIZ / 'dados'
TOKEN = DADOS / 'youtube_token.enc'
ENVIADOS = DADOS / 'youtube_enviados.json'
IGNORAR = {'biel-p1'}  # versão antiga da Parte 1 (arquivada)
PRIVACIDADE = os.environ.get('YT_PRIVACIDADE', 'public')  # o Google força "private" até a auditoria


def ler(p, padrao):
    try:
        return json.loads(Path(p).read_text(encoding='utf-8'))
    except Exception:  # noqa: BLE001
        return padrao


def gravar(p, d):
    Path(p).parent.mkdir(exist_ok=True)
    Path(p).write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding='utf-8')


def http(metodo, url, dados=None, headers=None, json_body=None, raw=None, devolver_headers=False):
    h = dict(headers or {})
    if json_body is not None:
        dados = json.dumps(json_body).encode(); h['Content-Type'] = 'application/json; charset=UTF-8'
    elif dados is not None:
        dados = urllib.parse.urlencode(dados).encode(); h['Content-Type'] = 'application/x-www-form-urlencoded'
    elif raw is not None:
        dados = raw
    req = urllib.request.Request(url, data=dados, headers=h, method=metodo)
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            corpo = r.read().decode() or '{}'
            j = json.loads(corpo) if corpo.strip().startswith('{') else {}
            return (j, dict(r.headers)) if devolver_headers else j
    except urllib.error.HTTPError as e:
        raise RuntimeError(f'Google respondeu {e.code}: {e.read().decode(errors="replace")[:500]}')


def salvar_token(tok):
    p = subprocess.run(['openssl', 'enc', '-aes-256-cbc', '-pbkdf2', '-salt', '-a', '-pass', 'env:YT_CLIENT_SECRET'],
                       input=json.dumps(tok).encode(), capture_output=True, check=True)
    DADOS.mkdir(exist_ok=True)
    TOKEN.write_bytes(p.stdout)


def ler_token():
    p = subprocess.run(['openssl', 'enc', '-d', '-aes-256-cbc', '-pbkdf2', '-a', '-pass', 'env:YT_CLIENT_SECRET'],
                       input=TOKEN.read_bytes(), capture_output=True, check=True)
    return json.loads(p.stdout)


def autorizar(codigo):
    codigo = urllib.parse.unquote(codigo.strip())
    m = re.search(r'[?&]code=([^&\s]+)', codigo)  # aceita também a URL inteira colada
    if m:
        codigo = urllib.parse.unquote(m.group(1))
    r = http('POST', 'https://oauth2.googleapis.com/token', {'code': codigo, 'client_id': CID, 'client_secret': CS,
                                                             'redirect_uri': REDIRECT, 'grant_type': 'authorization_code'})
    if 'refresh_token' not in r:
        raise RuntimeError('Não consegui autorizar (o código vale poucos minutos; gere outro).')
    salvar_token({'refresh_token': r['refresh_token'], 'escopos': r.get('scope')})
    canal = http('GET', 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
                 headers={'Authorization': f"Bearer {r['access_token']}"})
    itens = canal.get('items', [])
    print('YouTube conectado!', ('Canal: ' + itens[0]['snippet']['title']) if itens else '⚠️ essa conta do Google não tem canal.')


def access_token():
    tok = ler_token()
    r = http('POST', 'https://oauth2.googleapis.com/token', {'client_id': CID, 'client_secret': CS,
                                                             'refresh_token': tok['refresh_token'], 'grant_type': 'refresh_token'})
    if 'access_token' not in r:
        raise RuntimeError('Não consegui renovar o acesso: reconecte o canal pela página yt-biel.html.')
    return r['access_token']


def metadados(item):
    leg = item['legenda']
    primeira = leg.strip().splitlines()[0]
    m = re.match(r'PARTE\s+(\d+)\s*[—-]\s*([^\U0001F300-\U0001FAFF☀-➿]+)', primeira, re.I)
    if m:
        titulo = f"O Corre do Biel • Parte {m.group(1)} — {m.group(2).strip().title()} #shorts"
    else:
        titulo = f"O Corre do Biel • {primeira[:60]} #shorts"
    corpo = leg.replace('Segue @ocorredobiel pra não perder!', 'Se inscreve no canal pra não perder! 🔔')
    corpo = re.sub(r'#reels\b', '#shorts', corpo)
    desc = (corpo + '\n\n📺 Assista desde a Parte 1 na playlist do canal.\nNo Instagram: @ocorredobiel').strip()[:4900]
    tags = [t.lstrip('#') for t in re.findall(r'#\w+', leg) if t != '#reels'] + ['o corre do biel', 'série animada', 'você decide', 'shorts']
    return titulo[:100], desc, list(dict.fromkeys(tags))[:20]


def subir(at, arq, item):
    titulo, desc, tags = metadados(item)
    meta = {'snippet': {'title': titulo, 'description': desc, 'tags': tags, 'categoryId': '1',
                        'defaultLanguage': 'pt-BR', 'defaultAudioLanguage': 'pt-BR'},
            'status': {'privacyStatus': PRIVACIDADE, 'selfDeclaredMadeForKids': False, 'embeddable': True}}
    tam = arq.stat().st_size
    _, hd = http('POST', 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
                 headers={'Authorization': f'Bearer {at}', 'X-Upload-Content-Type': 'video/mp4', 'X-Upload-Content-Length': str(tam)},
                 json_body=meta, devolver_headers=True)
    url = hd.get('Location') or hd.get('location')
    r = http('PUT', url, headers={'Authorization': f'Bearer {at}', 'Content-Type': 'video/mp4', 'Content-Length': str(tam)},
             raw=arq.read_bytes())
    return r.get('id'), r.get('status', {}).get('privacyStatus'), titulo


def comentar_enquete(at, vid, item):
    v = item.get('votacao') or {}
    opcoes = v.get('opcoes') or []
    if not opcoes:
        return None
    emojis = item.get('emojis') or {}
    linhas = '\n'.join(f"{emojis.get(o, '👉')} {o}" for o in opcoes)
    texto = (f"🗳️ VOTAÇÃO! O que o Biel deve fazer?\n\n{linhas}\n\n"
             f"Comenta {' ou '.join(opcoes)} — o mais votado decide o próximo episódio 👀")
    r = http('POST', 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet', headers={'Authorization': f'Bearer {at}'},
             json_body={'snippet': {'videoId': vid, 'topLevelComment': {'snippet': {'textOriginal': texto}}}})
    return r.get('id')


def por_capa(at, vid, url):
    """Coloca a capa (thumbnail) no vídeo. O YouTube exige canal verificado por telefone para capas personalizadas."""
    with urllib.request.urlopen(url, timeout=60) as r:
        img = r.read()
    http('POST', f'https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId={vid}',
         headers={'Authorization': f'Bearer {at}', 'Content-Type': 'image/jpeg', 'Content-Length': str(len(img))}, raw=img)


def capas():
    """Coloca a capa nos vídeos já enviados que ainda estão sem."""
    env = ler(ENVIADOS, [])
    fila = ler(RAIZ / 'fila' / 'fila.json', {'itens': {}})['itens']
    at = access_token()
    for e in env:
        url = fila.get(e['id'], {}).get('capa_url')
        if not e.get('video_id') or e.get('capa') == 'ok' or not url:
            continue
        try:
            por_capa(at, e['video_id'], url); e['capa'] = 'ok'
            print('🖼️ capa colocada:', e['titulo'])
        except Exception as x:  # noqa: BLE001
            e['capa'] = 'erro: ' + str(x)[:200]
            print('capa falhou:', e['titulo'], str(x)[:300])
    gravar(ENVIADOS, env)


def pendentes():
    estado = ler(RAIZ / 'estado.json', {'publicados': []})
    fila = ler(RAIZ / 'fila' / 'fila.json', {'itens': {}})['itens']
    ja = {e['id'] for e in ler(ENVIADOS, []) if e.get('video_id')}
    out = []
    for p in sorted(estado['publicados'], key=lambda p: p.get('publicado_em', '')):
        i = p['id']
        if i.startswith('biel') and i not in IGNORAR and i not in ja and i in fila:
            out.append(dict(fila[i], id=i))
    return out


def enviar(n=None):
    cand = pendentes()
    if not cand:
        print('Nada novo para o YouTube.'); return
    at = access_token()
    env = ler(ENVIADOS, [])
    for item in cand[:n or len(cand)]:
        arq = RAIZ / item['video']
        if not arq.exists():
            print('sem arquivo de vídeo:', item['id']); continue
        try:
            vid, priv, titulo = subir(at, arq, item)
        except Exception as e:  # noqa: BLE001
            print('falhou', item['id'], str(e)[:300])
            if 'quota' in str(e).lower():
                break
            continue
        reg = {'id': item['id'], 'video_id': vid, 'privacidade': priv, 'titulo': titulo,
               'link': f'https://youtube.com/shorts/{vid}', 'quando': datetime.now(timezone.utc).isoformat()}
        if item.get('capa_url'):
            try:
                por_capa(at, vid, item['capa_url']); reg['capa'] = 'ok'
            except Exception as e:  # noqa: BLE001
                reg['capa'] = 'erro: ' + str(e)[:200]
        try:
            reg['comentario_id'] = comentar_enquete(at, vid, item)
        except Exception as e:  # noqa: BLE001
            reg['comentario_erro'] = str(e)[:200]
        env.append(reg)
        gravar(ENVIADOS, env)
        print(f'✅ YouTube: {titulo} → {reg["link"]} ({priv})')


def metricas():
    env = [e for e in ler(ENVIADOS, []) if e.get('video_id')]
    if not env:
        print('Nenhum vídeo no YouTube ainda.'); return
    at = access_token()
    ids = ','.join(e['video_id'] for e in env[:50])
    r = http('GET', f'https://www.googleapis.com/youtube/v3/videos?part=statistics,status&id={ids}', headers={'Authorization': f'Bearer {at}'})
    st = {it['id']: it for it in r.get('items', [])}
    out = []
    for e in env[:50]:
        it = st.get(e['video_id'], {}); s = it.get('statistics', {})
        out.append({'episodio': e['id'], 'privacidade': it.get('status', {}).get('privacyStatus'), 'views': int(s.get('viewCount', 0)),
                    'curtidas': int(s.get('likeCount', 0)), 'comentarios': int(s.get('commentCount', 0)), 'link': e['link']})
    canal = http('GET', 'https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true', headers={'Authorization': f'Bearer {at}'})
    gravar(DADOS / 'youtube_metricas.json', {'canal': (canal.get('items') or [{}])[0].get('statistics', {}),
                                             'atualizado': datetime.now(timezone.utc).isoformat(), 'videos': out})
    print(json.dumps(out, ensure_ascii=False, indent=1))


def main():
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    if a[0] == 'pendentes':
        print([p['id'] for p in pendentes()]); return
    if not CID or not CS:
        sys.exit('Faltam os segredos YT_CLIENT_ID e YT_CLIENT_SECRET no GitHub (repositório esefossevoce-bot).')
    if a[0] == 'autorizar':
        autorizar(a[1])
    elif not TOKEN.exists():
        sys.exit('Canal ainda não conectado: rode a ação "autorizar" com o código da página yt-biel.html.')
    elif a[0] == 'enviar':
        enviar(int(a[1]) if len(a) > 1 and a[1].isdigit() else None)
    elif a[0] == 'metricas':
        metricas()
    elif a[0] == 'capas':
        capas()


if __name__ == '__main__':
    try:
        main()
    except RuntimeError as e:
        sys.exit(str(e))
