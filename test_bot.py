"""Testes do robô com respostas simuladas da Meta (não usa token nem internet).
Rodar: python -m unittest test_bot
"""
import json
import os
import shutil
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from unittest import mock

import bot


class MetaFalsa:
    """Imita as rotas da Graph API usadas pelo robô."""

    def __init__(self, comentarios=None):
        self.chamadas = []
        self.comentarios = comentarios or []
        self.comentarios_postados = []

    def __call__(self, metodo, url, corpo=None, cabecalhos=None):
        self.chamadas.append((metodo, url.split("?")[0]))
        caminho = url.split("?")[0]
        if "rupload" in caminho:
            assert cabecalhos["file_size"] == str(len(corpo))
            assert cabecalhos["Authorization"].startswith("OAuth ")
            return {"success": True}
        if caminho.endswith("/me/accounts"):
            return {"data": [{"name": "Página", "instagram_business_account": {"id": "1784", "username": "esefossevoce"}}]}
        if caminho.endswith("/1784/media") and metodo == "POST":
            return {"id": "C1"}
        if caminho.endswith("/C1"):
            return {"status_code": "FINISHED"}
        if caminho.endswith("/1784/media_publish"):
            return {"id": "M1"}
        if caminho.endswith("/M1") and metodo == "GET":
            return {"permalink": "https://www.instagram.com/reel/abc/"}
        if caminho.endswith("/M1/comments") and metodo == "GET":
            return {"data": self.comentarios}
        if caminho.endswith("/M1/comments") and metodo == "POST":
            self.comentarios_postados.append(corpo.decode())
            return {"id": "R1"}
        raise AssertionError(f"rota inesperada: {metodo} {caminho}")


class TesteRobo(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        os.makedirs(os.path.join(self.dir, "fila"))
        with open(os.path.join(self.dir, "fila", "v.mp4"), "wb") as f:
            f.write(b"x" * 1234)
        self.fila = {"proximos": ["p1"], "itens": {
            "p1": {"video": "fila/v.mp4", "legenda": "Teste", "votacao": {"opcoes": ["SOZINHO", "PAI"], "horas": 24},
                   "continuacao": {"SOZINHO": "p2a", "PAI": "p2b"}},
            "p2b": {"video": "fila/v.mp4", "legenda": "Parte 2 PAI"}}}
        self.patches = [
            mock.patch.object(bot, "RAIZ", self.dir),
            mock.patch.object(bot, "ARQ_FILA", os.path.join(self.dir, "fila", "fila.json")),
            mock.patch.object(bot, "ARQ_ESTADO", os.path.join(self.dir, "estado.json")),
            mock.patch.object(bot, "ARQ_STATUS", os.path.join(self.dir, "status.md")),
            mock.patch.dict(os.environ, {"IG_TOKEN": "TOKEN-SECRETO", "IG_USER_ID": "", "IG_USERNAME": "esefossevoce"}),
            mock.patch.object(bot.time, "sleep", lambda s: None),
        ]
        for p in self.patches:
            p.start()
        bot.avisos.clear()
        bot.gravar_json(bot.ARQ_FILA, self.fila)

    def tearDown(self):
        for p in self.patches:
            p.stop()
        shutil.rmtree(self.dir)

    def ler(self, nome):
        with open(os.path.join(self.dir, nome), encoding="utf-8") as f:
            return f.read()

    def test_postar_publica_e_abre_votacao(self):
        meta = MetaFalsa()
        with mock.patch.object(bot, "http", meta):
            self.assertEqual(bot.main(["bot.py", "postar"]), 0)
        estado = json.loads(self.ler("estado.json"))
        pub = estado["publicados"][0]
        self.assertEqual(pub["media_id"], "M1")
        self.assertTrue(pub["votacao"]["aberta"])
        self.assertEqual(json.loads(self.ler("fila/fila.json"))["proximos"], [])
        self.assertIn(("POST", "https://rupload.facebook.com/ig-api-upload/v24.0/C1"), meta.chamadas)
        self.assertNotIn("TOKEN-SECRETO", self.ler("status.md"))

    def test_contagem_um_voto_por_pessoa(self):
        comentarios = [
            {"id": "1", "username": "ana", "text": "sozinho!!", "timestamp": "2026-10-29T10:00:00+0000"},
            {"id": "2", "username": "ana", "text": "PAI", "timestamp": "2026-10-29T11:00:00+0000"},
            {"id": "3", "username": "bia", "text": "Pai com certeza", "timestamp": "2026-10-29T10:05:00+0000"},
            {"id": "4", "username": "caio", "text": "pai ou sozinho? sei la", "timestamp": "2026-10-29T10:06:00+0000"},
            {"id": "5", "username": "duda", "text": "conta pro PAÍ", "timestamp": "2026-10-29T10:07:00+0000"},
            {"id": "6", "username": "esefossevoce", "text": "PAI", "timestamp": "2026-10-29T10:08:00+0000"},
            {"id": "7", "username": "edu", "text": "papai", "timestamp": "2026-10-29T10:09:00+0000"},
        ]
        votos = bot.contar(comentarios, ["SOZINHO", "PAI"], ignorar={"esefossevoce"})
        self.assertEqual(votos, {"SOZINHO": 1, "PAI": 2})

    def test_encerra_e_enfileira_vencedor(self):
        comentarios = [{"id": str(i), "username": f"u{i}", "text": "PAI", "timestamp": f"2026-10-29T10:0{i}:00+0000"}
                       for i in range(3)]
        meta = MetaFalsa(comentarios)
        with mock.patch.object(bot, "http", meta):
            bot.main(["bot.py", "postar"])
            estado = json.loads(self.ler("estado.json"))
            estado["publicados"][0]["votacao"]["ate"] = (
                datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat(timespec="seconds")
            bot.gravar_json(bot.ARQ_ESTADO, estado)
            self.assertEqual(bot.main(["bot.py", "votos"]), 0)
        estado = json.loads(self.ler("estado.json"))
        v = estado["publicados"][0]["votacao"]
        self.assertFalse(v["aberta"])
        self.assertEqual(v["vencedor"], "PAI")
        self.assertEqual(json.loads(self.ler("fila/fila.json"))["proximos"], ["p2b"])
        self.assertEqual(len(meta.comentarios_postados), 1)

    def test_continuacao_faltando_vira_aviso(self):
        meta = MetaFalsa([{"id": "1", "username": "ana", "text": "SOZINHO", "timestamp": "2026-10-29T10:00:00+0000"}])
        with mock.patch.object(bot, "http", meta):
            bot.main(["bot.py", "postar"])
            estado = json.loads(self.ler("estado.json"))
            estado["publicados"][0]["votacao"]["ate"] = "2000-01-01T00:00:00+00:00"
            bot.gravar_json(bot.ARQ_ESTADO, estado)
            bot.main(["bot.py", "votos"])
        self.assertIn("p2a", self.ler("status.md"))
        self.assertEqual(json.loads(self.ler("fila/fila.json"))["proximos"], [])

    def test_sem_token_falha_com_mensagem(self):
        with mock.patch.dict(os.environ, {"IG_TOKEN": ""}):
            self.assertEqual(bot.main(["bot.py", "descobrir"]), 1)
        self.assertIn("IG_TOKEN", self.ler("status.md"))

    def test_token_de_pagina(self):
        def meta(metodo, url, corpo=None, cabecalhos=None):
            if url.split("?")[0].endswith("/me/accounts"):
                raise bot.ErroAPI("HTTP 400: (#100) Tried accessing nonexisting field (accounts)")
            if url.split("?")[0].endswith("/me"):
                return {"id": "P1", "name": "Página", "instagram_business_account": {"id": "1784", "username": "seriavoce"}}
            raise AssertionError(url)
        with mock.patch.object(bot, "http", meta), mock.patch.dict(os.environ, {"IG_USERNAME": "seriavoce"}):
            self.assertEqual(bot.conta(), ("1784", "seriavoce"))

    def test_ignora_conta_de_outro_perfil(self):
        """Token com as duas páginas: o robô escolhe só a conta dele, nunca a primeira da lista."""
        def meta(metodo, url, corpo=None, cabecalhos=None):
            if url.split("?")[0].endswith("/me/accounts"):
                return {"data": [{"name": "Meu cão obedece", "instagram_business_account": {"id": "999", "username": "meu_cao_obedece"}},
                                 {"name": "E Se Fosse Você", "instagram_business_account": {"id": "1784", "username": "esefossevoce"}}]}
            raise AssertionError(url)
        with mock.patch.object(bot, "http", meta):
            self.assertEqual(bot.conta(), ("1784", "esefossevoce"))

    def test_recusa_quando_so_tem_outro_perfil(self):
        def meta(metodo, url, corpo=None, cabecalhos=None):
            caminho = url.split("?")[0]
            if caminho.endswith("/me/accounts"):
                return {"data": [{"name": "Meu cão obedece", "instagram_business_account": {"id": "999", "username": "meu_cao_obedece"}}]}
            if caminho.endswith("/me"):
                return {"id": "P2", "name": "Meu cão obedece"}
            if caminho.endswith("/me/permissions"):
                return {"data": []}
            raise AssertionError(url)
        with mock.patch.object(bot, "http", meta):
            with self.assertRaises(bot.ErroAPI) as cm:
                bot.conta()
        self.assertIn("Nada foi postado", str(cm.exception))

    def test_token_vencido_explica(self):
        def meta(metodo, url, corpo=None, cabecalhos=None):
            raise bot.ErroAPI('HTTP 400: {"error":{"message":"Session has expired","code":190}}')
        with mock.patch.object(bot, "http", meta):
            with self.assertRaises(bot.ErroAPI) as cm:
                bot.conta()
        self.assertIn("token venceu", str(cm.exception))

    def test_acao_invalida(self):
        self.assertEqual(bot.main(["bot.py", "apagar-tudo"]), 2)


if __name__ == "__main__":
    unittest.main()
