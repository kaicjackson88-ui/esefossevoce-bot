// Aulas do Animador de Bolso: gravações de tela limpas + motion explicando cada passo.
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, useCurrentFrame, interpolate} from 'remotion';
import {Fontes, Frase, Pal, SANS, SERIF, COND, lin, sp, S, Cena} from './Kit';
import CL from './aulas_clipes.json';

const CLIPES = CL as Record<string, {dur: number; w: number; h: number}>;
const ACC = '#ff7a3d', ACC2 = '#ffb35c', TXT = '#f4efe6', BG = '#0d0c0b';
type App = 'gemini' | 'capcut' | 'instagram' | 'chatgpt';
type Vis = 'lista' | 'cenas' | 'tts' | 'zoom' | 'efeitos' | 'post';
export type Item =
  | {k: 'abre'}
  | {k: 'clip'; id: string; passo: number; txt: string; rapido?: boolean}
  | {k: 'card'; titulo: Pal[]; passos: string[]; vis: Vis}
  | {k: 'resultado'}
  | {k: 'fim'};
export type Aula = {mod: number; titulo: string; serif: string; app: App; prox: string; itens: Item[]};

const durItem = (a: Aula, it: Item) =>
  it.k === 'abre' ? 75 : it.k === 'fim' ? 66 : it.k === 'resultado' ? 291 : it.k === 'card' ? 70 + 34 * it.passos.length : Math.round(CLIPES[it.id].dur * 30);
export const durAula = (a: Aula) => a.itens.reduce((s, it) => s + durItem(a, it), 0);

const Logo: React.FC<{app: App; size: number; f: number; style?: React.CSSProperties}> = ({app, size, f, style}) => {
  const q = sp(f, 11, 140);
  return <Img src={S(`aula/logo_${app}.png`)} style={{width: size, height: size, borderRadius: size * 0.23, boxShadow: '0 20px 50px rgba(0,0,0,.5)', transform: `scale(${q}) rotate(${(1 - q) * -18}deg)`, ...style}} />;
};

const Fundo: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: -300 + Math.sin(f / 90) * 60, top: -350, width: 1200, height: 1200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,61,.22), transparent 65%)'}} />
      <div style={{position: 'absolute', right: -400, bottom: -450 + Math.cos(f / 80) * 50, width: 1300, height: 1300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,92,.14), transparent 65%)'}} />
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(244,239,230,.05) 1.5px, transparent 1.6px)', backgroundSize: '40px 40px'}} />
    </AbsoluteFill>
  );
};

const Topo: React.FC<{a: Aula}> = ({a}) => (
  <div style={{position: 'absolute', left: 60, top: 70, display: 'flex', alignItems: 'center', gap: 22, fontFamily: SANS}}>
    <Img src={S(`aula/logo_${a.app}.png`)} style={{width: 84, height: 84, borderRadius: 20}} />
    <div>
      <div style={{fontSize: 22, fontWeight: 800, letterSpacing: '0.16em', color: ACC}}>MÓDULO {a.mod}</div>
      <div style={{fontSize: 38, fontWeight: 800, color: TXT, letterSpacing: '-0.03em'}}>{a.titulo} <span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: ACC2}}>{a.serif}</span></div>
    </div>
  </div>
);

const Abre: React.FC<{a: Aula}> = ({a}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40}}>
      <Logo app={a.app} size={300} f={f} />
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, letterSpacing: '0.2em', color: ACC, opacity: lin(f, 8, 20, 0, 1)}}>MÓDULO {a.mod}</div>
      <Frase f0={12} size={96} cor={TXT} p={[...a.titulo.split(' ').map((t) => ({t})), ...a.serif.split(' ').map((t) => ({t, serif: true, cor: ACC2}))]} />
    </AbsoluteFill>
  );
};

const Fim: React.FC<{a: Aula}> = ({a}) => {
  const f = useCurrentFrame();
  const ws = a.prox.split(' ');
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30, fontFamily: SANS}}>
      <div style={{fontSize: 30, fontWeight: 800, letterSpacing: '0.18em', color: ACC, opacity: lin(f, 0, 12, 0, 1)}}>PRÓXIMA AULA</div>
      <Frase f0={6} size={84} cor={TXT} p={ws.map((t, i) => ({t, serif: i === ws.length - 1, cor: i === ws.length - 1 ? ACC2 : TXT}))} />
      <div style={{fontSize: 90, color: ACC, transform: `translateX(${Math.sin(f / 6) * 14}px)`, opacity: lin(f, 18, 28, 0, 1)}}>→</div>
    </AbsoluteFill>
  );
};

const Legenda: React.FC<{passo?: number; txt: string; f: number; top: number}> = ({passo, txt, f, top}) => (
  <div style={{position: 'absolute', left: 70, right: 70, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, fontFamily: SANS}}>
    {passo !== undefined && <div style={{background: ACC, color: '#1a0d05', fontWeight: 900, fontSize: 26, letterSpacing: '0.14em', padding: '8px 22px', borderRadius: 99, transform: `scale(${sp(f - 4)})`}}>PASSO {passo}</div>}
    <div style={{textAlign: 'center', color: TXT, fontWeight: 800, fontSize: 48, lineHeight: 1.18, letterSpacing: '-0.03em', opacity: lin(f, 8, 20, 0, 1), transform: `translateY(${lin(f, 8, 22, 30, 0)}px)`, filter: `blur(${lin(f, 8, 20, 10, 0)}px)`}}>{txt}</div>
  </div>
);

const Clip: React.FC<{id: string; passo: number; txt: string; rapido?: boolean}> = ({id, passo, txt, rapido}) => {
  const f = useCurrentFrame();
  const c = CLIPES[id];
  const BW = 880, BH = 1180, TOP = 220;
  const s = Math.min(BW / c.w, BH / c.h);
  const w = c.w * s, h = c.h * s;
  const q = sp(f, 14, 110);
  const top = TOP + (BH - h) / 2;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: (1080 - w) / 2, top, width: w, height: h, borderRadius: 38, overflow: 'hidden', border: '2px solid rgba(244,239,230,.14)', boxShadow: `0 40px 90px rgba(0,0,0,.6), 0 0 ${60 + Math.sin(f / 15) * 20}px rgba(255,122,61,.18)`, transform: `translateY(${(1 - q) * 120}px) scale(${0.92 + q * 0.08})`, opacity: q}}>
        <OffthreadVideo src={S(`aula/${id}.mp4`)} muted style={{width: w, height: h}} />
      </div>
      {rapido && <div style={{position: 'absolute', right: (1080 - w) / 2 + 20, top: top + 20, background: 'rgba(13,12,11,.85)', color: ACC2, fontFamily: SANS, fontWeight: 800, fontSize: 24, padding: '8px 16px', borderRadius: 99, border: `1px solid ${ACC2}`, opacity: lin(f, 10, 18, 0, 1)}}>⏩ acelerado</div>}
      <Legenda passo={passo} txt={txt} f={f} top={TOP + BH + 70} />
    </AbsoluteFill>
  );
};

// Ilustrações animadas dos cards (passos que não foram gravados)
const Visual: React.FC<{vis: Vis; f: number}> = ({vis, f}) => {
  const card = (img: string, extra: React.CSSProperties = {}, inner: React.CSSProperties = {}) => (
    <div style={{width: 420, height: 746, borderRadius: 34, overflow: 'hidden', border: '2px solid rgba(244,239,230,.16)', boxShadow: '0 40px 80px rgba(0,0,0,.55)', ...extra}}>
      <Img src={S(`aula/${img}`)} style={{width: '100%', height: '100%', objectFit: 'cover', ...inner}} />
    </div>
  );
  if (vis === 'cenas') {
    return (
      <div style={{position: 'relative', width: 1080, height: 800}}>
        {[1, 2, 3].map((n, i) => {
          const q = sp(f - 6 - i * 8, 13, 120);
          return <div key={n} style={{position: 'absolute', left: 350 + (i - 1) * 270 * q, top: 50, transform: `rotate(${(i - 1) * 8 * q}deg) scale(${0.8 + 0.2 * q})`, opacity: q, zIndex: i === 1 ? 2 : 1}}>{card(`cena${n}.jpg`, {width: 380, height: 675})}</div>;
        })}
      </div>
    );
  }
  if (vis === 'zoom') {
    const z = interpolate(f % 90, [0, 90], [1, 1.35]);
    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
        {card('cena1.jpg', {height: 600, width: 338}, {transform: `scale(${z})`})}
        <div style={{position: 'relative', width: 760, height: 90, background: 'rgba(244,239,230,.08)', borderRadius: 18, border: '1px solid rgba(244,239,230,.15)'}}>
          <div style={{position: 'absolute', left: 30, right: 30, top: 18, height: 54, borderRadius: 10, backgroundImage: `url(${S('aula/cena1.jpg')})`, backgroundSize: '60px 54px', opacity: 0.6}} />
          {[40, 690].map((x, i) => <div key={x} style={{position: 'absolute', left: x, top: 28, width: 34, height: 34, background: ACC, transform: `rotate(45deg) scale(${sp(f - 10 - i * 20)})`, borderRadius: 4, boxShadow: '0 0 20px rgba(255,122,61,.8)'}} />)}
          <div style={{position: 'absolute', left: 40 + ((f % 90) / 90) * 680, top: -10, width: 4, height: 110, background: '#fff', borderRadius: 2}} />
        </div>
        <div style={{fontFamily: COND, fontSize: 40, color: ACC2}}>◆ INÍCIO → ◆ FIM = ZOOM SUAVE</div>
      </div>
    );
  }
  if (vis === 'efeitos') {
    const at = Math.floor(f / 25) % 4;
    const sh = at === 0 ? Math.sin(f * 2.1) * 9 : 0;
    const zz = at === 1 ? 1 + ((f % 25) / 25) * 0.15 : 1;
    const bl = at === 2 ? Math.sin(((f % 25) / 25) * Math.PI) * 14 : 0;
    const rot = at === 3 ? Math.sin(f / 4) * 3 : 0;
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: 50}}>
        {card('cena3.jpg', {height: 640, width: 360, transform: `translate(${sh}px,${sh * 0.6}px) rotate(${rot}deg)`}, {transform: `scale(${zz})`, filter: `blur(${bl}px)`})}
        <div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
          {['Tremor', 'Zoom', 'Blur', 'Balanço'].map((t, i) => <div key={t} style={{fontFamily: SANS, fontWeight: 800, fontSize: 38, color: i === at ? '#1a0d05' : TXT, background: i === at ? ACC : 'rgba(244,239,230,.08)', padding: '16px 34px', borderRadius: 20, transform: `scale(${sp(f - 6 - i * 6)})`}}>{t}</div>)}
        </div>
      </div>
    );
  }
  if (vis === 'tts') {
    const txt = 'Caiu um Pix de três mil reais na sua conta…';
    const n = Math.floor(lin(f, 6, 50, 0, txt.length));
    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, fontFamily: SANS}}>
        <div style={{width: 820, background: 'rgba(244,239,230,.08)', border: '1px solid rgba(244,239,230,.16)', borderRadius: 28, padding: '34px 40px', color: TXT, fontSize: 44, fontWeight: 700, minHeight: 170}}>{txt.slice(0, n)}<span style={{opacity: f % 20 < 10 ? 1 : 0}}>|</span></div>
        <div style={{fontSize: 70, color: ACC, opacity: lin(f, 50, 58, 0, 1)}}>↓</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, height: 190, opacity: lin(f, 56, 66, 0, 1)}}>
          {Array.from({length: 26}).map((_, i) => <div key={i} style={{width: 18, borderRadius: 9, background: i % 3 ? ACC : ACC2, height: 30 + Math.abs(Math.sin(f / 4 + i * 0.7)) * 140}} />)}
        </div>
        <div style={{background: ACC, color: '#1a0d05', fontWeight: 900, fontSize: 34, padding: '14px 30px', borderRadius: 99, opacity: lin(f, 60, 70, 0, 1)}}>🎙 Texto para fala</div>
      </div>
    );
  }
  if (vis === 'post') {
    const coms = ['DEVOLVE', 'BANCO', 'DEVOLVE', 'DEVOLVE', 'BANCO'];
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 18, width: 820, fontFamily: SANS}}>
        {coms.map((v, i) => {
          const q = sp(f - 4 - i * 9);
          return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(244,239,230,.07)', borderRadius: 24, padding: '20px 28px', transform: `translateX(${(1 - q) * 200}px)`, opacity: q}}>
            <div style={{width: 60, height: 60, borderRadius: '50%', background: `linear-gradient(135deg,${ACC},${ACC2})`}} />
            <div style={{width: 160, height: 22, borderRadius: 11, background: 'rgba(244,239,230,.18)'}} />
            <div style={{marginLeft: 'auto', fontWeight: 900, fontSize: 40, color: v === 'DEVOLVE' ? ACC2 : TXT}}>{v}</div>
          </div>;
        })}
        <div style={{display: 'flex', gap: 20, justifyContent: 'center', marginTop: 20, opacity: lin(f, 55, 65, 0, 1)}}>
          <div style={{fontFamily: COND, fontSize: 64, color: ACC2}}>DEVOLVE 3</div><div style={{fontFamily: COND, fontSize: 64, color: '#8a8378'}}>×</div><div style={{fontFamily: COND, fontSize: 64, color: TXT}}>2 BANCO</div>
        </div>
      </div>
    );
  }
  return null;
};

const Card: React.FC<{titulo: Pal[]; passos: string[]; vis: Vis}> = ({titulo, passos, vis}) => {
  const f = useCurrentFrame();
  const temVis = vis !== 'lista';
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: temVis ? 230 : 420, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}><Frase f0={2} size={86} cor={TXT} p={titulo} largura={960} /></div>
      {temVis && <div style={{position: 'absolute', top: 470, left: 0, right: 0, height: 820, display: 'flex', justifyContent: 'center', alignItems: 'center'}}><Visual vis={vis} f={f} /></div>}
      <div style={{position: 'absolute', top: temVis ? 1330 : 700, left: 90, right: 90, display: 'flex', flexDirection: 'column', gap: temVis ? 18 : 30, fontFamily: SANS}}>
        {passos.map((p, i) => {
          const q = lin(f, 20 + i * 18, 34 + i * 18, 0, 1);
          return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 24, opacity: q, transform: `translateX(${(1 - q) * 60}px)`, filter: `blur(${(1 - q) * 8}px)`}}>
            <div style={{flex: 'none', width: 64, height: 64, borderRadius: '50%', background: ACC, color: '#1a0d05', fontWeight: 900, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
            <div style={{color: TXT, fontWeight: 700, fontSize: temVis ? 40 : 50, lineHeight: 1.2, letterSpacing: '-0.02em'}}>{p}</div>
          </div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

const Resultado: React.FC = () => {
  const f = useCurrentFrame();
  const q = sp(f, 13, 110);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.2em', color: ACC}}>O RESULTADO</div>
      <div style={{position: 'absolute', left: (1080 - 680) / 2, top: 280, width: 680, height: 1218, borderRadius: 44, overflow: 'hidden', border: '3px solid rgba(244,239,230,.2)', boxShadow: '0 50px 100px rgba(0,0,0,.6), 0 0 90px rgba(255,122,61,.25)', transform: `scale(${0.85 + 0.15 * q}) rotate(${(1 - q) * -4}deg)`, opacity: q}}>
        <OffthreadVideo src={S('aula/resultado.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <Legenda txt="Feito 100% no celular" f={f - 20} top={1560} />
    </AbsoluteFill>
  );
};

export const AulaVideo: React.FC<{a: Aula}> = ({a}) => {
  const f = useCurrentFrame();
  let t = 0;
  const seqs = a.itens.map((it, i) => {
    const d = durItem(a, it);
    const de = t;
    t += d;
    const corpo = it.k === 'abre' ? <Abre a={a} /> : it.k === 'fim' ? <Fim a={a} /> : it.k === 'resultado' ? <Resultado /> : it.k === 'card' ? <Card titulo={it.titulo} passos={it.passos} vis={it.vis} /> : <Clip id={it.id} passo={it.passo} txt={it.txt} rapido={it.rapido} />;
    return {it, de, d, el: (
      <Sequence key={i} from={de} durationInFrames={d + 6}>
        <Cena f={f - de} de={0} ate={d} giro={1.5}>{corpo}</Cena>
        <Audio src={S('ad/hit.wav')} volume={0.18} />
      </Sequence>
    )};
  });
  const res = seqs.find((s) => s.it.k === 'resultado');
  const topo = seqs.some((s) => (s.it.k === 'clip' || s.it.k === 'card') && f >= s.de && f < s.de + s.d);
  return (
    <AbsoluteFill style={{background: BG}}>
      <Fontes />
      <Fundo />
      {seqs.map((s) => s.el)}
      <div style={{opacity: topo ? 1 : 0}}><Topo a={a} /></div>
      <Audio src={S('ad/beat.wav')} loop volume={(fr) => (res && fr >= res.de && fr < res.de + res.d ? 0.02 : 0.1)} />
    </AbsoluteFill>
  );
};

export const AULAS: Record<string, Aula> = {
  A2: {mod: 2, titulo: 'Roteiro com', serif: 'IA', app: 'gemini', prox: 'Módulo 3 · Personagem fixo', itens: [
    {k: 'abre'},
    {k: 'clip', id: 'rot_prompt', passo: 1, txt: 'Abra o Gemini e cole o prompt do roteiro'},
    {k: 'clip', id: 'rot_resp', passo: 2, txt: 'A IA entrega as falas, as cenas e até a legenda', rapido: true},
    {k: 'card', vis: 'lista', titulo: [{t: 'O'}, {t: 'segredo', serif: true, cor: ACC2}, {t: 'do roteiro'}], passos: ['A primeira frase já mostra o problema', 'Frases curtas, de até 12 palavras', 'Termine com uma votação de 2 opções']},
    {k: 'fim'},
  ]},
  A3: {mod: 3, titulo: 'Personagem', serif: 'fixo', app: 'gemini', prox: 'Módulo 4 · Montagem e voz', itens: [
    {k: 'abre'},
    {k: 'clip', id: 'per_menu', passo: 1, txt: 'Toque no + → Criar imagem e cole o prompt do personagem'},
    {k: 'clip', id: 'per_gera', passo: 2, txt: 'Espere a IA desenhar', rapido: true},
    {k: 'clip', id: 'per_img', passo: 3, txt: 'Pronto: esse é o seu personagem'},
    {k: 'clip', id: 'per_ajuste', passo: 4, txt: 'Quer mudar algo? Peça: “mantenha tudo igual, só…”'},
    {k: 'clip', id: 'per_gera2', passo: 5, txt: 'A IA ajusta sem trocar o rosto', rapido: true},
    {k: 'clip', id: 'per_img2', passo: 6, txt: 'Mesmo personagem, agora com a chave na mão'},
    {k: 'card', vis: 'lista', titulo: [{t: 'Agora,'}, {t: 'as cenas', serif: true, cor: ACC2}], passos: ['Anexe a imagem do personagem', 'Cole o prompt da cena', 'Repita para cada cena do roteiro']},
    {k: 'clip', id: 'cenas', passo: 7, txt: 'Baixe cada cena no tamanho original', rapido: true},
    {k: 'card', vis: 'cenas', titulo: [{t: '3 cenas,'}, {t: 'o mesmo', serif: true, cor: ACC2}, {t: 'Biel'}], passos: ['Mesmo rosto, mesma roupa', 'Cada cena = uma fala do roteiro']},
    {k: 'fim'},
  ]},
  A4: {mod: 4, titulo: 'Montagem e', serif: 'voz', app: 'capcut', prox: 'Módulo 5 · Movimento', itens: [
    {k: 'abre'},
    {k: 'clip', id: 'cc_home', passo: 1, txt: 'Abra o CapCut e toque em Novo vídeo', rapido: true},
    {k: 'clip', id: 'cc_galeria', passo: 2, txt: 'Selecione as cenas em ordem e toque em Adicionar'},
    {k: 'clip', id: 'cc_editor', passo: 3, txt: 'As cenas entram na linha do tempo. Agora, a voz'},
    {k: 'card', vis: 'tts', titulo: [{t: 'A'}, {t: 'narração', serif: true, cor: ACC2}, {t: 'sem gravar'}], passos: ['Texto → Adicionar texto → cole a fala', 'Selecione o texto → Texto para fala', 'Escolha a voz e repita em cada fala', 'Apague as caixas: o áudio continua']},
    {k: 'fim'},
  ]},
  A5: {mod: 5, titulo: 'Movimento nas', serif: 'imagens', app: 'capcut', prox: 'Módulo 6 · Legendas', itens: [
    {k: 'abre'},
    {k: 'card', vis: 'zoom', titulo: [{t: 'Zoom'}, {t: 'de cinema', serif: true, cor: ACC2}], passos: ['Barra no começo da cena → toque no ◆', 'Vá pro fim e aumente com dois dedos', 'O CapCut cria o movimento sozinho']},
    {k: 'card', vis: 'efeitos', titulo: [{t: 'Tensão'}, {t: 'e ritmo', serif: true, cor: ACC2}], passos: ['Efeitos → procure “tremor”', 'Animação → Combo → balanço', 'Entre as cenas: transição zoom ou blur']},
    {k: 'resultado'},
    {k: 'fim'},
  ]},
  A6: {mod: 6, titulo: 'Legendas e', serif: 'exportação', app: 'capcut', prox: 'Módulo 7 · Postar a série', itens: [
    {k: 'abre'},
    {k: 'clip', id: 'cc_legenda', passo: 1, txt: 'Texto → Legendas automáticas, depois ajuste estilo e cor das palavras', rapido: true},
    {k: 'clip', id: 'cc_export', passo: 2, txt: 'Exportar em 1080p e 30 fps', rapido: true},
    {k: 'clip', id: 'cc_salvo', passo: 3, txt: 'Salvo na galeria'},
    {k: 'resultado'},
    {k: 'fim'},
  ]},
  A7: {mod: 7, titulo: 'Postar a', serif: 'série', app: 'instagram', prox: 'Bônus · Banco de prompts', itens: [
    {k: 'abre'},
    {k: 'clip', id: 'ig_reel', passo: 1, txt: 'Instagram → + → Reel → escolha o vídeo', rapido: true},
    {k: 'clip', id: 'ig_legenda', passo: 2, txt: 'Cole a legenda com a votação e compartilhe'},
    {k: 'card', vis: 'post', titulo: [{t: 'Os comentários'}, {t: 'decidem', serif: true, cor: ACC2}], passos: ['Conte os votos de cada opção', 'Faça a parte 2 com a que ganhou', 'Mostre o placar no começo do vídeo']},
    {k: 'fim'},
  ]},
};
