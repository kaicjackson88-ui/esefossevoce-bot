"""Responde sozinho os comentários dos episódios do Biel, com uma resposta curta e personalizada
que puxa a pessoa pra seguir a página / ver a próxima parte.

- Uma resposta por comentário; nunca responde a própria página nem quem já foi respondido.
- Não responde dentro do comentário da enquete (lá fica só o placar).
- No máximo MAX_POR_RODADA respostas por rodada, pra não parecer spam.
- Texto escrito pelo Gemini (GEMINI_API_KEY); sem chave ou sem cota, usa modelos prontos variados.
Chamado pelo bot.py nas ações "votos" e "ciclo".
"""
import json
import os
import random
import re
import urllib.error
import urllib.request
from datetime import datetime, timedelta

import bot

MAX_POR_RODADA = int(os.environ.get("RESPOSTAS_POR_RODADA", "15"))
DIAS = 7
MODELO = "gemini-2.5-flash"

MODELOS = {
    "voto": [
        "@{u} {o} na veia! 🔥 Segue a página pra ver se o Biel aguenta as consequências na próxima parte 👀",
        "@{u} anotado: {o} ✅ Ativa o seguir que a Parte 2 vai depender de você 😬",
        "@{u} voto contado! {o} tá na disputa 👀 Segue pra não perder o que acontece com o Biel",
        "@{u} {o}?! Corajoso(a) 😳 Segue a página que amanhã você descobre se valeu a pena",
        "@{u} {o} registrado 🗳️ Se seguir a página, você vê primeiro o que acontece",
    ],
    "geral": [
        "@{u} valeu demais por assistir! 🙌 E você, faria o quê no lugar do Biel? Segue pra ver a próxima parte 👀",
        "@{u} 👀 Comenta qual é o seu voto e segue a página, a Parte 2 vai depender dos comentários!",
        "@{u} tamo junto! A história só tá começando 😬 Segue pra não perder",
        "@{u} 🔥 Fica de olho que a próxima parte vem pesada. Segue a página pra acompanhar!",
    ],
}


def gemini(prompt):
    chave = os.environ.get("GEMINI_API_KEY", "").strip()
    if not chave:
        return None
    corpo = {"contents": [{"parts": [{"text": prompt}]}],
             "generationConfig": {"temperature": 0.9, "maxOutputTokens": 120, "thinkingConfig": {"thinkingBudget": 0}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODELO}:generateContent?key={chave}",
                                 data=json.dumps(corpo).encode(), method="POST", headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            d = json.loads(r.read().decode())
        return d["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (urllib.error.HTTPError, urllib.error.URLError, KeyError, IndexError, TimeoutError, ValueError):
        return None


def limpo(txt, usuario):
    """Garante resposta curta, sem link e começando pelo @ da pessoa."""
    txt = re.sub(r"https?://\S+", "", txt).replace("\n", " ").strip().strip('"')
    txt = re.sub(r"\s+", " ", txt)
    if len(txt) > 220:
        txt = txt[:217].rsplit(" ", 1)[0] + "…"
    if not txt.lower().startswith("@" + usuario.lower()):
        txt = f"@{usuario} {txt}"
    return txt


def escrever(comentario, usuario, voto, resumo, opcoes):
    prompt = (
        "Você administra o Instagram @ocorredobiel, uma série animada brasileira em que o público decide o que o personagem Biel faz. "
        f"Episódio: {resumo}\nOpções da votação: {' ou '.join(opcoes)}.\n"
        f"Um seguidor (@{usuario}) comentou: \"{comentario}\"\n"
        + (f"Ele votou em {voto}.\n" if voto else "")
        + "Escreva UMA resposta curta (no máximo 2 frases, até 180 caracteres), em português do Brasil informal e simpático, "
          "reagindo ao que ele disse de forma específica, e puxando ele a seguir a página para ver a próxima parte (sem implorar). "
          "No máximo 1 ou 2 emojis. Sem link, sem hashtag, sem prometer prêmio, sem inventar fatos da história além do que está no episódio. "
          "Se o comentário for ofensivo ou spam, responda só com: PULAR. Responda apenas com o texto."
    )
    txt = gemini(prompt)
    if txt and txt.strip().upper().startswith("PULAR"):
        return None
    if not txt:
        txt = random.choice(MODELOS["voto" if voto else "geral"]).format(u=usuario, o=voto or "")
    return limpo(txt, usuario)


def voto_de(texto, opcoes):
    alvo = {bot.normal(o): o for o in opcoes}
    palavras = set(re.findall(r"[A-Z0-9]+", bot.normal(texto or "")))
    achou = {alvo[p] for p in palavras if p in alvo}
    return achou.pop() if len(achou) == 1 else None


def responder_comentarios(estado):
    feitos = set(estado.get("respondidos", []))
    _, minha_conta = bot.conta()
    limite = bot.agora() - timedelta(days=DIAS)
    respondidas = 0
    for p in reversed(estado["publicados"]):
        if respondidas >= MAX_POR_RODADA:
            break
        if not p["id"].startswith("biel") or not p.get("media_id"):
            continue
        try:
            if datetime.fromisoformat(p["publicado_em"]) < limite:
                continue
        except (KeyError, ValueError):
            continue
        v = p.get("votacao") or {}
        opcoes = v.get("opcoes", [])
        enquete = v.get("comentario_id")
        try:
            r = bot.get(f"/{p['media_id']}/comments", fields="id,text,username,timestamp,replies{username}", limit=50)
            m = bot.get(f"/{p['media_id']}", fields="caption")
        except bot.ErroAPI as e:
            bot.avisos.append(f"Respostas: não consegui ler os comentários de {p['id']}: {e}")
            continue
        resumo = " ".join((m.get("caption") or "").split("\n")[:4])[:400]
        ja_respondi_usuario = set()
        for c in sorted(r.get("data", []), key=lambda x: x.get("timestamp", "")):
            if respondidas >= MAX_POR_RODADA:
                break
            u = c.get("username") or ""
            if not u or u == minha_conta or c["id"] in feitos or c["id"] == enquete or u in ja_respondi_usuario:
                continue
            if any(x.get("username") == minha_conta for x in (c.get("replies") or {}).get("data", [])):
                feitos.add(c["id"])
                continue
            texto = escrever(c.get("text", ""), u, voto_de(c.get("text"), opcoes), resumo, opcoes)
            feitos.add(c["id"])
            if not texto:
                continue
            try:
                bot.post(f"/{c['id']}/replies", message=texto)
                respondidas += 1
                ja_respondi_usuario.add(u)
                print(f"Respondi @{u} em {p['id']}: {texto}")
            except bot.ErroAPI as e:
                bot.avisos.append(f"Respostas: falhou em @{u}: {e}")
    estado["respondidos"] = list(feitos)[-3000:]
    if respondidas:
        bot.avisos.append(f"Respondi {respondidas} comentário(s).")
