"""Gera index.html (Vercel) e preview.html (prévia com imagens e vídeos embutidos) a partir de conteudo.html."""
import base64, re, pathlib
R = pathlib.Path(__file__).parent
c = (R / 'conteudo.html').read_text(encoding='utf-8')
head = ('<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<meta name="theme-color" content="#0d0c0b">\n<meta property="og:title" content="Animador de Bolso">\n'
        '<meta property="og:description" content="Crie desenhos animados que viralizam, só com o celular. R$ 19,90.">\n'
        '<meta property="og:image" content="v/prova.jpg">\n'
        '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}</style>\n')
i = c.index('</style>') + len('</style>')
(R / 'index.html').write_text(head + c[:i] + '\n</head>\n<body>\n' + c[i:] + '\n</body>\n</html>\n', encoding='utf-8')
tipos = {'.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4'}
def emb(m):
    arq = R / m.group(2)
    if not arq.exists():
        return m.group(0)
    dado = base64.b64encode(arq.read_bytes()).decode()
    return f'{m.group(1)}"data:{tipos[arq.suffix]};base64,{dado}"'
prev = re.sub(r'((?:src|poster)=)"((?:img|v)/[^"]+)"', emb, c)
prev = re.sub(r"src=\"img/kiwi\.webp\"", 'src="img/kiwi.webp"', prev)
kiwi = base64.b64encode((R / 'img/kiwi.webp').read_bytes()).decode()
prev = prev.replace("'<img class=\"ic\" src=\"img/kiwi.webp\"", "'<img class=\"ic\" src=\"data:image/webp;base64," + kiwi + "\"")
(R / 'preview.html').write_text(prev, encoding='utf-8')
print('ok', len(prev) // 1024, 'KB')
