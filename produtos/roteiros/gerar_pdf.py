"""Gera o PDF do Pack 30 Roteiros Virais (A5, pronto para a Kiwify).
python3 produtos/roteiros/gerar_pdf.py  -> produtos/roteiros/Pack_30_Roteiros_Virais.pdf"""
import html, pathlib, subprocess, sys
AQUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
from roteiros import R  # noqa: E402

FONTES = AQUI.parents[1] / 'editor' / 'public' / 'fonts'
e = html.escape

css = f"""
@font-face{{font-family:Inter;font-weight:600;src:url('file://{FONTES}/inter-600.woff2')}}
@font-face{{font-family:Inter;font-weight:800;src:url('file://{FONTES}/inter-800.woff2')}}
@font-face{{font-family:Inter;font-weight:900;src:url('file://{FONTES}/inter-900.woff2')}}
@font-face{{font-family:Serif;font-style:italic;src:url('file://{FONTES}/serif-it.woff2')}}
@font-face{{font-family:Anton;src:url('file://{FONTES}/anton.woff2')}}
@page{{size:A5;margin:0}}
*{{box-sizing:border-box}}
body{{margin:0;font-family:Inter,sans-serif;color:#1a1714;font-size:10.5pt;line-height:1.45}}
.pg{{width:148mm;height:210mm;padding:14mm 13mm 12mm;position:relative;page-break-after:always;overflow:hidden;background:#fbf8f1}}
.esc{{background:#0d0c0b;color:#f4efe6}}
.it{{font-family:Serif,serif;font-style:italic;font-weight:400}}
.acc{{color:#ff7a3d}}
.rot{{font-size:7.5pt;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#ff7a3d}}
.rodape{{position:absolute;left:13mm;right:13mm;bottom:7mm;display:flex;justify-content:space-between;font-size:7pt;color:#8a8378}}
.esc .rodape{{color:#7d776e}}
h1{{font-weight:900;letter-spacing:-.04em;line-height:1;margin:0}}
h2{{font-weight:900;letter-spacing:-.03em;line-height:1.05;margin:0}}
.capa h1{{font-size:40pt}}
.capa .num{{font-weight:900;font-size:120pt;line-height:.85;letter-spacing:-.06em;color:#ff7a3d}}
.fichas{{position:absolute;right:2mm;top:132mm;width:90mm;height:90mm}}
.ficha{{position:absolute;width:62mm;height:78mm;background:#fbf8f1;border-radius:5mm;padding:6mm;color:#1a1714;box-shadow:0 6mm 12mm rgba(0,0,0,.5)}}
.box{{background:#fff;border-radius:4mm;padding:4mm 5mm;margin-top:4mm;border:.3mm solid #e8e2d6}}
.gancho{{background:#0d0c0b;color:#f4efe6;border-radius:4mm;padding:4.5mm 5mm;margin-top:4mm}}
.gancho .fala{{font-weight:800;font-size:12.5pt;line-height:1.25;letter-spacing:-.02em;margin-top:1.5mm}}
.tela{{display:inline-block;margin-top:2.5mm;font-family:Anton,sans-serif;font-size:13pt;background:#ff7a3d;color:#1a0d05;padding:.6mm 3mm;letter-spacing:.02em}}
.falas{{margin-top:3mm}}
.f{{display:grid;grid-template-columns:7mm 1fr;gap:2mm;padding:2mm 0;border-bottom:.3mm dashed #e2dbcd}}
.f .n{{font-family:Serif,serif;font-style:italic;font-size:15pt;color:#ff7a3d;line-height:1}}
.f b{{display:block;font-weight:800;font-size:10pt;line-height:1.3}}
.f small{{display:block;color:#7d776e;font-size:8pt;margin-top:.6mm}}
.voto{{display:flex;gap:3mm;align-items:center;margin-top:3.5mm}}
.voto span{{font-weight:900;font-size:10pt;padding:1.8mm 4mm;border-radius:10mm;border:.5mm solid #1a1714}}
.voto span.a{{background:#1a1714;color:#fbf8f1}}
.leg{{margin-top:3mm;font-size:8.5pt;color:#4b463f;background:#f1ebdf;border-radius:3mm;padding:3mm 4mm}}
.cat{{position:absolute;top:14mm;right:13mm;font-size:7.5pt;font-weight:800;letter-spacing:.12em;text-transform:uppercase;background:#1a1714;color:#fbf8f1;padding:1mm 3mm;border-radius:10mm}}
ol.ind{{columns:2;column-gap:6mm;padding-left:6mm;margin:5mm 0 0;font-size:9.5pt}}
ol.ind li{{margin:1.4mm 0}}
.passo{{display:grid;grid-template-columns:9mm 1fr;gap:2mm;margin-top:4mm}}
.passo .n{{font-family:Serif,serif;font-style:italic;font-size:20pt;color:#ff7a3d;line-height:1}}
.passo b{{font-weight:800}}
"""


def rodape(n):
    return f'<div class="rodape"><span>Pack 30 Roteiros Virais · Animador de Bolso</span><span>{n}</span></div>'


pags = []
pags.append('''<section class="pg esc capa">
<div class="rot">Animador de Bolso</div>
<div class="num" style="margin-top:12mm">30</div>
<h1 style="margin-top:3mm">roteiros <span class="it acc" style="font-size:1.1em">virais</span><br>prontos pra animar</h1>
<p style="margin-top:5mm;color:#a8a196;max-width:78mm">Histórias do dia a dia com gancho, falas, cenas, votação e legenda. É só escolher, gerar as imagens e montar.</p>
<div class="fichas">
 <div class="ficha" style="left:26mm;top:0;transform:rotate(9deg)"><div class="rot">roteiro pronto</div><div class="it" style="font-size:18pt;line-height:1;margin-top:2mm">O Pix Errado</div></div>
 <div class="ficha" style="left:0;top:8mm;transform:rotate(-6deg)"><div class="rot">roteiro pronto</div><div class="it" style="font-size:18pt;line-height:1;margin-top:2mm">O Áudio Errado</div><div style="margin-top:3mm;font-weight:800;font-size:8.5pt">Você mandou um áudio falando mal da tia… no grupo da família.</div></div>
</div>
</section>''')
pags.append(f'''<section class="pg">
<div class="rot">Antes de começar</div>
<h2 style="font-size:24pt;margin-top:3mm">Como usar <span class="it acc">cada roteiro</span></h2>
<p style="color:#5d5a54;margin-top:3mm">Todos seguem a mesma fórmula testada no perfil @ocorredobiel, onde o episódio mais visto passou de 22 mil visualizações e mil comentários.</p>
<div class="passo"><span class="n">1</span><div><b>O gancho vem primeiro.</b> A primeira frase já mostra o problema. O texto de tela (em laranja) aparece no primeiro segundo, porque muita gente assiste sem som.</div></div>
<div class="passo"><span class="n">2</span><div><b>Uma imagem por fala.</b> Cada fala tem a descrição da cena. Use essa descrição no prompt de imagem, sempre com o mesmo personagem.</div></div>
<div class="passo"><span class="n">3</span><div><b>Termine na decisão.</b> Corte seco na pergunta e peça o voto nos comentários com uma palavra só.</div></div>
<div class="passo"><span class="n">4</span><div><b>Faça a parte 2 com a opção que ganhou.</b> Abra mostrando o resultado da votação e quem votou.</div></div>
<div class="passo"><span class="n">5</span><div><b>Adapte.</b> Troque nomes, valores e cidade. Quanto mais parecido com a vida do seu público, mais comentário.</div></div>
<div class="box" style="margin-top:6mm"><b>Duração ideal:</b> 35 a 45 segundos. Frases de até 12 palavras. Uma mudança na tela a cada 2 ou 3 segundos.</div>
{rodape(2)}</section>''')
itens = ''.join(f'<li>{e(r["t"])}</li>' for r in R)
pags.append(f'<section class="pg"><div class="rot">Índice</div><h2 style="font-size:24pt;margin-top:3mm">Os 30 <span class="it acc">roteiros</span></h2><ol class="ind">{itens}</ol>{rodape(3)}</section>')
for i, r in enumerate(R, 1):
    falas = ''.join(f'<div class="f"><span class="n">{k}</span><div><b>{e(fa)}</b><small>Cena: {e(ce)}</small></div></div>' for k, (fa, ce) in enumerate(r['f'], 1))
    pags.append(f'''<section class="pg">
<div class="cat">{e(r["cat"])}</div>
<div class="rot">Roteiro {i:02d}</div>
<h2 style="font-size:22pt;margin-top:2mm" class="it">{e(r["t"])}</h2>
<div class="gancho"><div class="rot">Gancho · 0 a 3 s</div><div class="fala">“{e(r["g"])}”</div><div class="tela">{e(r["tela"])}</div></div>
<div class="falas">{falas}</div>
<div class="voto"><b style="font-size:9pt">Votação:</b><span class="a">{e(r["a"])}</span><span>{e(r["b"])}</span></div>
<div class="leg"><b>Legenda pronta:</b> {e(r["leg"])}</div>
{rodape(i + 3)}</section>''')
pags.append(f'''<section class="pg esc">
<div class="rot">Próximo passo</div>
<h2 style="font-size:28pt;margin-top:4mm">Agora é <span class="it acc">animar.</span></h2>
<p style="color:#a8a196;margin-top:4mm">No Animador de Bolso você aprende, pelo celular, a transformar cada roteiro deste pack em vídeo: personagem fixo, voz, animação e edição.</p>
<div class="passo"><span class="n">→</span><div>Escolha 3 roteiros e poste um por dia.</div></div>
<div class="passo"><span class="n">→</span><div>Faça a parte 2 do que tiver mais comentários.</div></div>
<div class="passo"><span class="n">→</span><div>Repita o formato que funcionou e varie o tema.</div></div>
{rodape(len(R) + 4)}</section>''')

doc = f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{css}</style></head><body>{"".join(pags)}</body></html>'
(AQUI / 'pack.html').write_text(doc, encoding='utf-8')
js = f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://{AQUI}/pack.html');await p.waitForTimeout(800);
await p.pdf({{path:'{AQUI}/Pack_30_Roteiros_Virais.pdf',format:'A5',printBackground:true,preferCSSPageSize:true}});await b.close();}})();"""
subprocess.run(['node', '-e', js], check=True)
print('ok', AQUI / 'Pack_30_Roteiros_Virais.pdf')
