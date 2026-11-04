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
MODELOS_IA = ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash", "gemini-2.0-flash"]

CTA = "Quer aparecer na próxima parte? Compartilha com seus amigos e já segue a gente pra não perder! 👀"
REACOES = {
    "voto": ["{o} anotado! 🔥", "Voto em {o} contado ✅", "{o}, hein? 😳", "Boa, {o} tá na disputa! 🗳️", "{o} registrado 👊"],
    "encerrada": ["Essa votação já fechou ({g} venceu), mas tem episódio novo esperando seu voto! 🔥", "{g} levou essa! Já tem episódio novo no perfil 👀"],
    "geral": ["Valeu demais por assistir! 🙌", "Tamo junto! 🔥", "Boa! E você, faria o quê no lugar do Biel? 🤔", "Essa história ainda vai longe 😬"],
}


def gemini(prompt):
    chave = os.environ.get("GEMINI_API_KEY", "").strip()
    if not chave:
        return None
    corpo = json.dumps({"contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {"temperature": 0.9, "maxOutputTokens": 200}}).encode()
    for m in list(MODELOS_IA):
        req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={chave}",
                                     data=corpo, method="POST", headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                d = json.loads(r.read().decode())
            partes = d["candidates"][0]["content"]["parts"]
            txt = " ".join(x.get("text", "") for x in partes if not x.get("thought")).strip()
            if txt:
                MODELOS_IA[:] = [m] + [x for x in MODELOS_IA if x != m]  # guarda o que funcionou
                return txt
        except urllib.error.HTTPError as e:
            if e.code == 404:
                MODELOS_IA.remove(m)
                continue
            if not getattr(gemini, "avisou", False):
                gemini.avisou = True
                print(f"Gemini indisponível em {m} ({e.code}): {e.read().decode(errors='replace')[:160]}")
            return None
        except (urllib.error.URLError, KeyError, IndexError, TimeoutError, ValueError) as e:
            if not getattr(gemini, "avisou", False):
                gemini.avisou = True
                print(f"Gemini sem resposta: {str(e)[:160]}")
            return None
    if not getattr(gemini, "avisou", False):
        gemini.avisou = True
        print("Gemini: nenhum modelo disponível, usando modelos prontos")
    return None


def limpo(txt, usuario):
    """Garante resposta curta, sem link e começando pelo @ da pessoa."""
    txt = re.sub(r"https?://\S+", "", txt).replace("\n", " ").strip().strip('"')
    txt = re.sub(r"\s+", " ", txt)
    if len(txt) > 280:
        txt = txt[:277].rsplit(" ", 1)[0] + "…"
    if not txt.lower().startswith("@" + usuario.lower()):
        txt = f"@{usuario} {txt}"
    return txt


def escrever(comentario, usuario, voto, resumo, opcoes, vencedor=None):
    prompt = (
        "Você administra o Instagram @ocorredobiel, uma série animada brasileira em que o público decide o que o personagem Biel faz. "
        f"Episódio: {resumo}\nOpções da votação: {' ou '.join(opcoes)}.\n"
        f"Um seguidor (@{usuario}) comentou: \"{comentario}\"\n"
        + (f"Ele votou em {voto}.\n" if voto else "")
        + (f"ATENÇÃO: essa votação já terminou e {vencedor} venceu; não diga que o voto foi contado, convide para o episódio mais novo da página.\n" if vencedor else "")
        + "Escreva UMA resposta curta (1 frase curta), em português do Brasil informal e simpático, "
          "reagindo ao que ele disse de forma específica. NÃO peça pra seguir nem compartilhar (isso é adicionado depois). "
          "No máximo 1 emoji, até 90 caracteres. Sem link, sem hashtag, sem prometer prêmio, sem inventar fatos da história além do que está no episódio. "
          "Se o comentário for ofensivo ou spam, responda só com: PULAR. Responda apenas com o texto."
    )
    txt = gemini(prompt)
    if txt and txt.strip().upper().startswith("PULAR"):
        return None
    if not txt or len(txt) > 120:
        tipo = "encerrada" if vencedor else ("voto" if voto else "geral")
        txt = random.choice(REACOES[tipo]).format(o=voto or "", g=vencedor or "")
    txt = txt.strip().rstrip(".") + ". " + CTA if not txt.strip().endswith(("!", "?", "👀", "🔥", "✅", "😳", "🗳️", "👊", "🙌", "🤔", "😬")) else txt.strip() + " " + CTA
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
            vencedor = None if v.get("aberta") else v.get("vencedor")
            texto = escrever(c.get("text", ""), u, voto_de(c.get("text"), opcoes), resumo, opcoes, vencedor)
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
