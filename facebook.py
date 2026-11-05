"""Página do Facebook do Biel: diagnóstico e publicação dos Reels.

Uso:
  python facebook.py diagnostico      -> mostra qual página/permissões o token enxerga (nunca imprime o token)
  python facebook.py postar [id]      -> publica no Facebook o episódio já postado no Instagram (padrão: o mais recente
                                          ainda não enviado). Guarda o registro em dados/facebook_enviados.json.

Token: FB_TOKEN (token de página com pages_manage_posts + pages_read_engagement); se faltar, tenta IG_TOKEN.
Página: FB_PAGE_ID (opcional). Sem ele, usa a página ligada ao Instagram @ocorredobiel.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

VERSAO = os.environ.get("GRAPH_VERSION", "v24.0")
GRAPH = f"https://graph.facebook.com/{VERSAO}"
RAIZ = os.path.dirname(os.path.abspath(__file__))
ARQ = os.path.join(RAIZ, "dados", "facebook_enviados.json")
CONTA_IG = os.environ.get("IG_USERNAME", "ocorredobiel").lstrip("@").lower()


class Erro(Exception):
    pass


def token():
    t = (os.environ.get("FB_TOKEN") or os.environ.get("IG_TOKEN") or "").strip()
    if not t:
        raise Erro("Falta o segredo FB_TOKEN (ou IG_TOKEN).")
    return t


def esconder(txt):
    for k in ("FB_TOKEN", "IG_TOKEN"):
        v = os.environ.get(k, "").strip()
        if v:
            txt = txt.replace(v, "***")
    return txt


def chamar(metodo, url, dados=None, cab=None):
    req = urllib.request.Request(url, data=dados, method=metodo, headers=cab or {})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return json.loads(r.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        raise Erro(esconder(f"HTTP {e.code}: {e.read().decode(errors='replace')[:500]}")) from None


def get(caminho, tok=None, **p):
    p["access_token"] = tok or token()
    return chamar("GET", f"{GRAPH}{caminho}?{urllib.parse.urlencode(p)}")


def post(caminho, tok=None, **p):
    p["access_token"] = tok or token()
    return chamar("POST", f"{GRAPH}{caminho}", urllib.parse.urlencode(p).encode())


def pagina():
    """Devolve (page_id, nome, page_token)."""
    fixo = os.environ.get("FB_PAGE_ID", "").strip()
    try:
        r = get("/me/accounts", fields="id,name,access_token,tasks,instagram_business_account{username}")
        for p in r.get("data", []):
            ig = (p.get("instagram_business_account") or {}).get("username", "").lower()
            if (fixo and p["id"] == fixo) or (not fixo and ig == CONTA_IG):
                return p["id"], p.get("name", ""), p["access_token"]
    except Erro:
        pass  # token de página não tem /me/accounts
    eu = get("/me", fields="id,name")
    if fixo and eu["id"] != fixo:
        raise Erro(f"O token é da página '{eu.get('name')}', não da FB_PAGE_ID configurada.")
    return eu["id"], eu.get("name", ""), token()


def diagnostico():
    try:
        eu = get("/me", fields="id,name")
        print(f"Token pertence a: {eu.get('name')} (id {eu.get('id')})")
    except Erro as e:
        print("Falhou /me:", e)
    try:
        perms = get("/me/permissions").get("data", [])
        print("Permissões:", ", ".join(f"{p['permission']}={p['status']}" for p in perms) or "(token de página: sem lista)")
    except Erro as e:
        print("Permissões: não deu pra ler (normal em token de página).", str(e)[:120])
    try:
        r = get("/me/accounts", fields="id,name,tasks,instagram_business_account{username}")
        for p in r.get("data", []):
            ig = (p.get("instagram_business_account") or {}).get("username")
            print(f"Página: {p.get('name')} (id {p['id']}) · Instagram: @{ig} · tarefas: {','.join(p.get('tasks', []))}")
    except Erro as e:
        print("Páginas (/me/accounts): não deu pra ler —", str(e)[:160])
    try:
        pid, nome, ptok = pagina()
        print(f"Página escolhida: {nome} (id {pid})")
        ig = get(f"/{pid}", tok=ptok, fields="instagram_business_account{username},fan_count,link")
        print("Detalhes:", json.dumps({k: v for k, v in ig.items() if k != 'id'}, ensure_ascii=False))
    except Erro as e:
        print("Não achei a página:", e)


def ler(caminho, padrao):
    try:
        with open(caminho, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return padrao


def publicar(item_id=None):
    estado = ler(os.path.join(RAIZ, "estado.json"), {"publicados": []})
    fila = ler(os.path.join(RAIZ, "fila", "fila.json"), {"itens": {}})["itens"]
    feitos = ler(ARQ, {})
    if item_id:
        alvo = item_id
    else:
        janela = float(os.environ.get("FB_JANELA_H", "0") or 0)  # 0 = sem limite; no robô só posta o que saiu nas últimas horas
        limite = time.time() - janela * 3600

        def recente(p):
            if not janela:
                return True
            try:
                from datetime import datetime
                return datetime.fromisoformat(p["publicado_em"]).timestamp() >= limite
            except (KeyError, ValueError):
                return False

        cand = [p["id"] for p in sorted(estado["publicados"], key=lambda p: p.get("publicado_em", ""))
                if p["id"].startswith("biel") and p["id"] not in feitos and p["id"] in fila and recente(p)]
        if not cand:
            print("Nada novo para o Facebook.")
            return
        alvo = cand[-1]
    item = fila[alvo]
    pid, nome, ptok = pagina()
    video = os.path.join(RAIZ, item["video"])
    tam = os.path.getsize(video)
    ini = post(f"/{pid}/video_reels", tok=ptok, upload_phase="start")
    vid = ini["video_id"]
    with open(video, "rb") as f:
        dados = f.read()
    chamar("POST", ini.get("upload_url") or f"https://rupload.facebook.com/video-upload/{VERSAO}/{vid}", dados,
           {"Authorization": f"OAuth {ptok}", "offset": "0", "file_size": str(tam)})
    legenda = item["legenda"].replace("@ocorredobiel", "a página O Corre do Biel")
    post(f"/{pid}/video_reels", tok=ptok, upload_phase="finish", video_id=vid, video_state="PUBLISHED", description=legenda)
    for _ in range(40):
        time.sleep(15)
        st = get(f"/{vid}", tok=ptok, fields="status").get("status", {})
        fase = st.get("video_status")
        if fase in ("ready", "published") or st.get("publishing_phase", {}).get("status") == "complete":
            break
        if fase == "error":
            raise Erro(f"Facebook recusou o vídeo: {json.dumps(st)[:300]}")
    feitos[alvo] = {"video_id": vid, "pagina": nome, "em": time.strftime("%Y-%m-%dT%H:%M:%S%z")}
    os.makedirs(os.path.dirname(ARQ), exist_ok=True)
    with open(ARQ, "w", encoding="utf-8") as f:
        json.dump(feitos, f, ensure_ascii=False, indent=1)
    print(f"Publicado no Facebook ({nome}): {alvo} -> https://www.facebook.com/reel/{vid}")


if __name__ == "__main__":
    acao = sys.argv[1] if len(sys.argv) > 1 else "diagnostico"
    try:
        if acao == "diagnostico":
            diagnostico()
        elif acao == "postar" and len(sys.argv) > 2 and sys.argv[2] == "todos":
            # posta, do mais antigo pro mais novo, todos os episódios já publicados no Instagram que faltam no Facebook
            pular = set(os.environ.get("FB_PULAR", "").split(","))
            estado = ler(os.path.join(RAIZ, "estado.json"), {"publicados": []})
            fila = ler(os.path.join(RAIZ, "fila", "fila.json"), {"itens": {}})["itens"]
            for p in sorted(estado["publicados"], key=lambda p: p.get("publicado_em", "")):
                i = p["id"]
                if i.startswith("biel") and i in fila and i not in pular and i not in ler(ARQ, {}):
                    try:
                        publicar(i)
                    except Erro as e:
                        print(f"Falhou {i}:", esconder(str(e)))
                    time.sleep(20)
        elif acao == "postar":
            publicar(sys.argv[2] if len(sys.argv) > 2 else None)
        else:
            print("Use: diagnostico | postar [id]")
            sys.exit(2)
    except Erro as e:
        print("ERRO:", esconder(str(e)))
        sys.exit(1)
