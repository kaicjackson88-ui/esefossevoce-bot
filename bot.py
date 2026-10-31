#!/usr/bin/env python3
"""Robô do perfil "E Se Fosse Você?".

Publica os Reels da fila, conta os votos nos comentários e coloca a
continuação vencedora no topo da fila.

Uso:
    python bot.py descobrir   # confere o token e mostra qual conta do Instagram ele acessa
    python bot.py postar      # publica o próximo vídeo da fila
    python bot.py votos       # atualiza a contagem e encerra votações vencidas
    python bot.py ciclo       # votos + postar (usado nos horários de postagem)

Precisa da variável IG_TOKEN (segredo do GitHub). O token nunca é impresso.
IG_USER_ID é opcional: sem ela, o robô descobre a conta pela página do Facebook.
Só usa a biblioteca padrão do Python.
"""
import json
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

VERSAO = os.environ.get("GRAPH_VERSION", "v24.0")
GRAPH = f"https://graph.facebook.com/{VERSAO}"
RUPLOAD = f"https://rupload.facebook.com/ig-api-upload/{VERSAO}"
RAIZ = os.path.dirname(os.path.abspath(__file__))
ARQ_FILA = os.path.join(RAIZ, "fila", "fila.json")
ARQ_ESTADO = os.path.join(RAIZ, "estado.json")
ARQ_STATUS = os.path.join(RAIZ, "status.md")
BRT = timezone(timedelta(hours=-3))
ACOES = ("descobrir", "postar", "votos", "ciclo")

avisos = []


class ErroAPI(Exception):
    pass


# ---------------- utilidades ----------------
def agora():
    return datetime.now(timezone.utc)


def br(dt):
    return dt.astimezone(BRT).strftime("%d/%m %H:%M")


def token():
    t = os.environ.get("IG_TOKEN", "").strip()
    if not t:
        raise ErroAPI("Falta o segredo IG_TOKEN (GitHub > Settings > Secrets and variables > Actions).")
    return t


def esconder(texto):
    t = os.environ.get("IG_TOKEN", "")
    return texto.replace(t, "***") if t else texto


def ler_json(caminho, padrao):
    if not os.path.exists(caminho):
        return padrao
    with open(caminho, encoding="utf-8") as f:
        return json.load(f)


def gravar_json(caminho, dados):
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)
        f.write("\n")


def normal(texto):
    t = unicodedata.normalize("NFKD", texto or "")
    t = "".join(c for c in t if not unicodedata.combining(c))
    return t.upper()


# ---------------- chamadas à API ----------------
def http(metodo, url, corpo=None, cabecalhos=None):
    req = urllib.request.Request(url, data=corpo, method=metodo, headers=cabecalhos or {})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            bruto = r.read().decode("utf-8") or "{}"
            return json.loads(bruto)
    except urllib.error.HTTPError as e:
        detalhe = e.read().decode("utf-8", errors="replace")
        raise ErroAPI(esconder(f"HTTP {e.code} em {url.split('?')[0]}: {detalhe[:500]}"))
    except urllib.error.URLError as e:
        raise ErroAPI(f"Falha de rede em {url.split('?')[0]}: {e.reason}")


def get(caminho, **params):
    params["access_token"] = token()
    return http("GET", f"{GRAPH}{caminho}?{urllib.parse.urlencode(params)}")


def get_url(url):
    return http("GET", url)


def post(caminho, **params):
    params["access_token"] = token()
    return http("POST", f"{GRAPH}{caminho}", corpo=urllib.parse.urlencode(params).encode())


def enviar_video(container_id, dados):
    cab = {"Authorization": f"OAuth {token()}", "offset": "0", "file_size": str(len(dados))}
    tentativas = [f"{RUPLOAD}/{container_id}", f"https://rupload.facebook.com/ig-api-upload/{container_id}"]
    ultimo = None
    for url in tentativas:
        try:
            r = http("POST", url, corpo=dados, cabecalhos=cab)
            print(f"Envio do vídeo aceito em {url.split('/ig-api-upload/')[1].split('/')[0]}")
            return r
        except ErroAPI as e:
            ultimo = e
            print(f"Envio recusado: {e}")
    raise ultimo


# ---------------- conta ----------------
# Este robô só posta nesta conta. Outra conta no mesmo token (ex.: @meu_cao_obedece) é ignorada.
CONTA_PADRAO = "seriavoce.historias"
def conta():
    """Devolve (id, @usuario) da conta do Instagram que o token acessa."""
    alvo = (os.environ.get("IG_USERNAME", "").strip() or CONTA_PADRAO).lstrip("@").lower()
    fixo = os.environ.get("IG_USER_ID", "").strip()
    if fixo:
        r = get(f"/{fixo}", fields="id,username")
        if r.get("username", "").lower() != alvo:
            raise ErroAPI(f"IG_USER_ID aponta para @{r.get('username')}, não para @{alvo}. Nada foi postado.")
        return r["id"], r.get("username", "")
    diagnostico = [f"Conta procurada: @{alvo}"]
    try:
        r = get("/me/accounts", fields="name,instagram_business_account{id,username}")
        paginas = r.get("data", [])
        diagnostico.append(f"Páginas que o token enxerga: {len(paginas)}")
        for pagina in paginas:
            ig = pagina.get("instagram_business_account")
            diagnostico.append(f"- {pagina.get('name')}: " + (f"Instagram @{ig.get('username')}" if ig else "sem Instagram ligado"))
            if ig and ig.get("username", "").lower() == alvo:
                return ig["id"], ig.get("username", "")
    except ErroAPI as e:
        diagnostico.append(f"/me/accounts falhou: {e}")
    try:  # token de página: /me já é a página
        r = get("/me", fields="id,name,instagram_business_account{id,username}")
        ig = r.get("instagram_business_account")
        if ig and ig.get("username", "").lower() == alvo:
            return ig["id"], ig.get("username", "")
        if ig:
            diagnostico.append(f"O token é da página de @{ig.get('username')}, que não é a conta deste robô.")
    except ErroAPI as e:
        if "expired" in str(e).lower() or '"code":190' in str(e):
            raise ErroAPI("O token venceu. Gere um token de página que não expira (veja o README) e atualize o segredo IG_TOKEN.\n" + str(e))
    try:
        perms = get("/me/permissions").get("data", [])
        ok = [p["permission"] for p in perms if p.get("status") == "granted"]
        nao = [p["permission"] for p in perms if p.get("status") != "granted"]
        diagnostico.append("Permissões concedidas: " + (", ".join(ok) or "nenhuma"))
        if nao:
            diagnostico.append("Permissões negadas: " + ", ".join(nao))
    except ErroAPI as e:
        diagnostico.append(f"Diagnóstico extra falhou: {e}")
    raise ErroAPI(f"O token não dá acesso à conta @{alvo}. Nada foi postado.\n" + "\n".join(diagnostico))


# ---------------- postar ----------------
def esperar_processamento(container_id, tentativas=60, pausa=10):
    for _ in range(tentativas):
        r = get(f"/{container_id}", fields="status_code,status")
        codigo = r.get("status_code")
        if codigo == "FINISHED":
            return
        if codigo in ("ERROR", "EXPIRED"):
            raise ErroAPI(f"O Instagram recusou o vídeo ({codigo}): {r.get('status', '')}")
        time.sleep(pausa)
    raise ErroAPI("O vídeo demorou demais para ser processado pelo Instagram.")


def postar(fila, estado):
    if not fila["proximos"]:
        avisos.append("Fila vazia: nada foi postado. Peça novos vídeos ao Claude.")
        return None
    item_id = fila["proximos"][0]
    item = fila["itens"].get(item_id)
    if not item:
        fila["proximos"].pop(0)
        raise ErroAPI(f"O item '{item_id}' está em 'proximos' mas não existe em 'itens'. Removido da fila.")
    caminho = os.path.join(RAIZ, item["video"])
    with open(caminho, "rb") as f:
        dados = f.read()

    ig_id, usuario = conta()
    extra = {"cover_url": item["capa_url"]} if item.get("capa_url") else {}
    c = post(f"/{ig_id}/media", media_type="REELS", upload_type="resumable",
             caption=item["legenda"], share_to_feed="true", **extra)
    container = c["id"]
    try:
        enviar_video(container, dados)
    except ErroAPI as e:
        # Plano B: o Instagram baixa o vídeo do próprio GitHub (só funciona com o repositório público).
        repo = os.environ.get("GITHUB_REPOSITORY", "")
        if not repo:
            raise
        url = f"https://raw.githubusercontent.com/{repo}/{os.environ.get('GITHUB_REF_NAME', 'main')}/{item['video']}"
        print(f"Envio direto falhou ({e}). Tentando pelo link do GitHub: {url}")
        c = post(f"/{ig_id}/media", media_type="REELS", video_url=url,
                 caption=item["legenda"], share_to_feed="true", **extra)
        container = c["id"]
        try:
            esperar_processamento(container)
        except ErroAPI as e2:
            raise ErroAPI(f"{e2}\nSe o repositório estiver privado, o Instagram não consegue baixar o vídeo pelo link: deixe o repositório público.")
    else:
        esperar_processamento(container)
    publicado = post(f"/{ig_id}/media_publish", creation_id=container)
    media_id = publicado["id"]
    try:
        link = get(f"/{media_id}", fields="permalink").get("permalink", "")
    except ErroAPI:
        link = ""

    registro = {"id": item_id, "media_id": media_id, "permalink": link,
                "publicado_em": agora().isoformat(timespec="seconds")}
    v = item.get("votacao")
    if v:
        registro["votacao"] = {
            "aberta": True,
            "opcoes": v["opcoes"],
            "ate": (agora() + timedelta(hours=v.get("horas", 24))).isoformat(timespec="seconds"),
            "votos": {o: 0 for o in v["opcoes"]},
            "continuacao": item.get("continuacao", {}),
        }
    estado["publicados"].append(registro)
    fila["proximos"].pop(0)
    print(f"Publicado '{item_id}' em @{usuario}: {link or media_id}")
    return registro


# ---------------- votos ----------------
def todos_comentarios(media_id):
    r = get(f"/{media_id}/comments", fields="id,text,username,timestamp", limit=50)
    lista = list(r.get("data", []))
    paginas = 0
    while r.get("paging", {}).get("next") and paginas < 40:
        r = get_url(r["paging"]["next"])
        lista += r.get("data", [])
        paginas += 1
    return lista


def contar(comentarios, opcoes, ignorar=()):
    """Um voto por pessoa: vale o primeiro comentário dela que cita exatamente uma opção."""
    votos = {o: 0 for o in opcoes}
    ja_votou = set()
    alvo = {normal(o): o for o in opcoes}
    for c in sorted(comentarios, key=lambda x: x.get("timestamp", "")):
        quem = c.get("username") or c.get("id")
        if quem in ja_votou or quem in ignorar:
            continue
        palavras = set(re.findall(r"[A-Z0-9]+", normal(c.get("text", ""))))
        escolhas = {alvo[p] for p in palavras if p in alvo}
        if len(escolhas) == 1:
            votos[escolhas.pop()] += 1
            ja_votou.add(quem)
    return votos


def vencedor(votos, opcoes):
    """Mais votos vence; empate ou zero votos fica com a primeira opção."""
    melhor = max(votos.values()) if votos else 0
    for o in opcoes:
        if votos.get(o, 0) == melhor:
            return o
    return opcoes[0]


def atualizar_votos(fila, estado):
    abertas = [p for p in estado["publicados"] if p.get("votacao", {}).get("aberta")]
    if not abertas:
        return
    ig_id, usuario = conta()
    for p in abertas:
        v = p["votacao"]
        if not p.get("media_id"):  # post registrado à mão: acha o id pelo link
            r = get(f"/{ig_id}/media", fields="id,permalink", limit=50)
            achado = [m["id"] for m in r.get("data", []) if m.get("permalink", "").rstrip("/") == p.get("permalink", "").rstrip("/")]
            if not achado:
                avisos.append(f"Não achei o post de '{p['id']}' ({p.get('permalink')}) para contar votos.")
                continue
            p["media_id"] = achado[0]
        v["votos"] = contar(todos_comentarios(p["media_id"]), v["opcoes"], ignorar={usuario})
        v["atualizado_em"] = agora().isoformat(timespec="seconds")
        if agora() >= datetime.fromisoformat(v["ate"]):
            encerrar(p, fila)


def encerrar(publicacao, fila):
    v = publicacao["votacao"]
    ganhou = vencedor(v["votos"], v["opcoes"])
    total = sum(v["votos"].values())
    v["aberta"] = False
    v["vencedor"] = ganhou
    texto = (f"Votação encerrada! {ganhou} venceu com {v['votos'][ganhou]} de {total} votos. "
             f"A continuação sai no próximo post.")
    try:
        post(f"/{publicacao['media_id']}/comments", message=texto)
    except ErroAPI as e:
        avisos.append(f"Não consegui comentar o resultado: {e}")
    proxima = v.get("continuacao", {}).get(ganhou)
    if not proxima:
        return
    if proxima in fila["itens"]:
        if proxima not in fila["proximos"]:
            fila["proximos"].insert(0, proxima)
    else:
        avisos.append(f"A continuação '{proxima}' ({ganhou}) ainda não está na fila. Peça ao Claude para produzir.")


# ---------------- status ----------------
def escrever_status(fila, estado, acao, erro=None):
    linhas = ["# Status do robô", "",
              f"Última execução: {br(agora())} (Brasília) — ação `{acao}`" + (" — **FALHOU**" if erro else ""), ""]
    if erro:
        linhas += ["## Erro", "", f"```\n{esconder(str(erro))}\n```", ""]
    if avisos:
        linhas += ["## Avisos", ""] + [f"- {a}" for a in avisos] + [""]
    linhas += ["## Fila", ""]
    linhas += [f"{i + 1}. {x}" for i, x in enumerate(fila["proximos"])] or ["(vazia)"]
    linhas += ["", "## Votações", ""]
    com_voto = [p for p in estado["publicados"] if p.get("votacao")]
    if not com_voto:
        linhas.append("(nenhuma)")
    for p in reversed(com_voto[-10:]):
        v = p["votacao"]
        placar = " · ".join(f"{o}: {v['votos'].get(o, 0)}" for o in v["opcoes"])
        fim = datetime.fromisoformat(v["ate"])
        situacao = f"aberta até {br(fim)}" if v["aberta"] else f"encerrada — venceu {v.get('vencedor')}"
        linhas.append(f"- **{p['id']}** ({situacao}): {placar} {p.get('permalink', '')}".rstrip())
    with open(ARQ_STATUS, "w", encoding="utf-8") as f:
        f.write("\n".join(linhas) + "\n")


# ---------------- principal ----------------
def main(argv):
    acao = argv[1] if len(argv) > 1 else ""
    if acao not in ACOES:
        print(f"Ação inválida: {acao!r}. Use uma destas: {', '.join(ACOES)}")
        return 2
    fila = ler_json(ARQ_FILA, {"proximos": [], "itens": {}})
    estado = ler_json(ARQ_ESTADO, {"publicados": []})
    erro = None
    try:
        if acao == "descobrir":
            ig_id, usuario = conta()
            print(f"Token OK. Conta do Instagram: @{usuario} (id {ig_id}).")
            avisos.append(f"Token OK: conta @{usuario}.")
        if acao in ("votos", "ciclo"):
            atualizar_votos(fila, estado)
        if acao in ("postar", "ciclo"):
            postar(fila, estado)
    except (ErroAPI, OSError) as e:
        erro = e
        print(f"ERRO: {esconder(str(e))}")
    gravar_json(ARQ_FILA, fila)
    gravar_json(ARQ_ESTADO, estado)
    escrever_status(fila, estado, acao, erro)
    for a in avisos:
        print(f"Aviso: {a}")
    return 1 if erro else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
