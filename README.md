# Robô do perfil E Se Fosse Você?

Publica os Reels da fila, conta os votos nos comentários e coloca a continuação vencedora no topo da fila.

## Agenda

| Quando (Brasília) | O que faz |
| --- | --- |
| 12h e 19h | conta votos, encerra votações vencidas e posta o próximo vídeo |
| toda hora (minuto 20) | só conta votos |

Também dá para rodar na mão: aba **Actions** > **Robô E Se Fosse Você** > **Run workflow** e escolher a ação.

## Primeiro uso

1. Salve o token em **Settings > Secrets and variables > Actions** com o nome `IG_TOKEN`.
2. Rode a ação **descobrir**. O arquivo `status.md` deve mostrar "Token OK: conta @...".
3. Rode a ação **postar** para publicar o primeiro vídeo da fila, ou espere o próximo horário.

## Token que não expira (token de página)

1. No [Explorador da Graph API](https://developers.facebook.com/tools/explorer/), gere um token de usuário com `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`, `pages_show_list`, `pages_read_engagement` e `business_management`.
2. No [Depurador de token](https://developers.facebook.com/tools/debug/accesstoken/), toque em **Estender token de acesso** e copie o token longo.
3. De volta ao Explorador, cole o token longo no campo de token e envie a consulta `me/accounts?fields=name,access_token`.
4. Copie o `access_token` da página **E Se Fosse Você?**. Confira no Depurador: em "Expira" deve aparecer **Nunca**.
5. Salve esse token no segredo `IG_TOKEN`.

## Arquivos

- `fila/fila.json` — ordem dos próximos posts (`proximos`) e os dados de cada vídeo (`itens`): arquivo, legenda, opções de voto e qual continuação corresponde a cada opção.
- `estado.json` — o que já foi publicado e o placar das votações.
- `status.md` — resumo da última execução, avisos e erros. Abra este arquivo para ver como está.

## Regras da votação

- Um voto por pessoa: vale o primeiro comentário que cita exatamente uma das opções (maiúsculas, minúsculas e acentos não importam).
- Comentários da própria conta não contam.
- Depois do prazo, o robô comenta o resultado no post e coloca a continuação vencedora no topo da fila. Empate ou nenhum voto fica com a primeira opção.

## Testes

```
python -m unittest test_bot
```
