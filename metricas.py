"""Puxa as métricas dos Reels publicados (Instagram Graph API) e da conta.
Grava dados/metricas.json e um resumo legível em dados/metricas.md. python metricas.py"""
import json, os, sys
from datetime import datetime, timedelta, timezone
import bot

RAIZ = os.path.dirname(os.path.abspath(__file__))
METRICAS = ['views', 'reach', 'likes', 'comments', 'shares', 'saved', 'total_interactions',
            'ig_reels_avg_watch_time', 'ig_reels_video_view_total_time', 'follows', 'profile_visits']
DURACAO = {'biel-p1': 46.1, 'biel-p1b': 69.5, 'biel-p2-esconde': 80.5, 'biel-p3-paga': 68.4}  # segundos de cada vídeo


def uma(media_id, m):
    try:
        r = bot.get(f"/{media_id}/insights", metric=m)
        v = r['data'][0]
        return v.get('values', [{}])[0].get('value', v.get('total_value', {}).get('value'))
    except Exception as e:  # noqa: BLE001
        return f"indisponível ({str(e)[:80]})"


def main():
    estado = bot.ler_json(os.path.join(RAIZ, 'estado.json'), {'publicados': []})
    saida = {}
    for p in estado['publicados']:
        if not p['id'].startswith('biel') or not p.get('media_id'):
            continue
        d = {m: uma(p['media_id'], m) for m in METRICAS}
        d['permalink'] = p.get('permalink')
        d['publicado_em'] = p.get('publicado_em')
        saida[p['id']] = d
        print(p['id'], d, flush=True)
    ig_id, usuario = bot.conta()
    conta = {}
    try:
        conta['perfil'] = bot.get(f"/{ig_id}", fields='username,followers_count,media_count')
    except Exception as e:  # noqa: BLE001
        conta['perfil'] = str(e)[:120]
    fim = datetime.now(timezone.utc); ini = fim - timedelta(days=6)
    for m in ('reach', 'profile_views', 'follows_and_unfollows', 'accounts_engaged', 'views'):
        try:
            r = bot.get(f"/{ig_id}/insights", metric=m, period='day', metric_type='total_value',
                        since=int(ini.timestamp()), until=int(fim.timestamp()))
            conta[m] = r['data'][0].get('total_value', r['data'][0].get('values'))
        except Exception as e:  # noqa: BLE001
            conta[m] = f"indisponível ({str(e)[:80]})"
    try:
        r = bot.get(f"/{ig_id}/insights", metric='follower_demographics', period='lifetime', metric_type='total_value', breakdown='country')
        conta['seguidores_por_pais'] = r['data'][0].get('total_value')
    except Exception as e:  # noqa: BLE001
        conta['seguidores_por_pais'] = f"indisponível ({str(e)[:80]})"
    saida['_conta'] = conta
    os.makedirs(os.path.join(RAIZ, 'dados'), exist_ok=True)
    with open(os.path.join(RAIZ, 'dados', 'metricas.json'), 'w', encoding='utf-8') as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)
    linhas = ['# Métricas dos episódios', '']
    for k, d in saida.items():
        if k.startswith('_'):
            continue
        media = d.get('ig_reels_avg_watch_time')
        pct = f" ({round(media / 1000 / DURACAO[k] * 100)}% do vídeo)" if isinstance(media, (int, float)) and k in DURACAO else ''
        linhas.append(f"## {k}  {d.get('permalink')}")
        linhas += [f"- {m}: {d.get(m)}" + (pct if m == 'ig_reels_avg_watch_time' else '') for m in METRICAS] + ['']
    linhas += ['## Conta', '```', json.dumps(conta, ensure_ascii=False, indent=1)[:3000], '```']
    with open(os.path.join(RAIZ, 'dados', 'metricas.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(linhas))
    print('ok')


if __name__ == '__main__':
    sys.exit(main())
