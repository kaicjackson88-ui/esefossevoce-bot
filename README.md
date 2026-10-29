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
