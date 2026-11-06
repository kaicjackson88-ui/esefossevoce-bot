import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import FAS from './biel_fas.json';
import {EPS} from './eps';

// Modelo único das histórias do Biel: legenda gigante, placar no topo, telas em motion, votação e "segue".
// Cada história = um JSON de cenas (áudio cortado + palavras) + uma configuração em eps.ts.
export const FPS = 30;
export const ANTON = 'Anton, Impact, sans-serif';
export const F = 'Poppins, sans-serif';
import {AM, VERM, VERDE, AZUL} from './cores';
export {AM, VERM, VERDE, AZUL};

if (typeof document !== 'undefined' && !(window as unknown as {antonOk?: boolean}).antonOk) {
  (window as unknown as {antonOk?: boolean}).antonOk = true;
  const h = delayRender('fonte Anton');
  const ff = new FontFace('Anton', `url(${staticFile('fonts/anton.woff2')}) format('woff2')`);
  const fe = new FontFace('Anton', `url(${staticFile('fonts/anton-ext.woff2')}) format('woff2')`, {unicodeRange: 'U+0100-024F'});
  Promise.all([ff.load(), fe.load().catch(() => null)])
    .then((fs) => {fs.forEach((x) => x && (document.fonts as unknown as {add: (f: FontFace) => void}).add(x)); continueRender(h);})
    .catch(() => continueRender(h));
}

export type Pal = {palavra: string; inicio: number; fim: number};
export type Fala = {quem: string; texto: string; palavras: Pal[]};
export type Cena = {img: string; dur: number; falas: Fala[]};
export type Marca = [number, string]; // [cena, começo da palavra]
export type Box = {rot: string; de: number | string; para?: number; em?: Marca; cor?: string; corDepois?: string; num?: boolean};
export type Ov =
  | {t: 'grande'; num: number; sub: string; cor?: string; subEm?: Marca}
  | {t: 'etiqueta' | 'selo'; txt: string; em: Marca; ate: number; cor?: string; top?: number; rot?: number}
  | {t: 'card'; rot: string; big: string; sub?: string; em: Marca; ate: number; cor?: string; top?: number}
  | {t: 'notif'; de: string; txt: string; em: Marca; ate: number; cor?: string; icone?: string}
  | {t: 'relogio'; de: string; ate_h?: string; cena: number}
  | {t: 'gancho'; l1: string; l2: string; cor?: string; ate?: Marca; top?: number}
  | {t: 'decidiram'; venc: string; de: string; cor?: string}
  | {t: 'ranking'; cena: number};
export type Cfg = {cenas: Cena[]; parte: number; nomes: Record<string, string>; cores: Record<string, string>; placar: Box[]; perigo: Marca[];
  ovs: Ov[]; voto: [string, string, string][]; votoCena: number; votoAtraso: number; trilha: string; sons: [Marca, string, number][];
  conta?: string; avatar?: string; rodape?: string};

const norm = (w: string) => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const sp = (f: number, ini: number, d = 12, st = 180) => spring({frame: f - ini, fps: FPS, config: {damping: d, stiffness: st}});
const dentro = (f: number, a: number, b: number) => f >= a && f < b;
const saida = (f: number, b: number) => interpolate(f, [b - 8, b], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const brl = (v: number) => 'R$ ' + Math.round(v).toLocaleString('pt-BR');

const tempos = (cenas: Cena[]) => {
  const INI: number[] = [];
  cenas.reduce((t, c, i) => {INI[i] = t; return t + Math.round(c.dur * FPS);}, 0);
  const FIM = INI[cenas.length - 1] + Math.round(cenas[cenas.length - 1].dur * FPS);
  const q = ([ci, p]: Marca) => {
    for (const fa of cenas[ci].falas) {
      const w = fa.palavras.find((x) => norm(x.palavra).startsWith(p));
      if (w) return INI[ci] + Math.round(w.inicio * FPS);
    }
    return INI[ci] + 10;
  };
  return {INI, FIM, q};
};
const SEGUE = Math.round(2.6 * FPS);
export const totalHist = (ep: string) => tempos(EPS[ep].cenas).FIM + SEGUE;

// ---------- base ----------
const Cenario: React.FC<{c: Cena; i: number; dur: number; voto: boolean}> = ({c, i, dur, voto}) => {
  const f = useCurrentFrame();
  const p = f / dur;
  const s = i % 2 === 0 ? 1.04 + p * 0.09 : 1.13 - p * 0.09;
  const ent = i === 0 ? 1 : interpolate(f, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: ent, overflow: 'hidden'}}>
      <Img src={staticFile(`biel/${c.img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s})`,
        filter: voto && f > 60 ? `blur(${Math.min(6, (f - 60) / 3)}px) brightness(${Math.max(0.5, 1 - (f - 60) / 40)})` : undefined}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.6) 0%, transparent 20%, transparent 50%, rgba(0,0,0,.75) 100%)'}} />
    </AbsoluteFill>
  );
};

const Legenda: React.FC<{c: Cena; cores: Record<string, string>; nomes: Record<string, string>}> = ({c, cores, nomes}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const fala = [...c.falas].reverse().find((x) => x.palavras.length && t >= x.palavras[0].inicio - 0.1);
  if (!fala) return null;
  const orig = fala.texto.split(/\s+/);
  const grupos: Pal[][] = [];
  fala.palavras.forEach((w, k) => {
    const g = grupos[grupos.length - 1];
    if (!g || g.length >= 3 || /[.,?!:…]$/.test(orig[k - 1] || '')) grupos.push([w]); else g.push(w);
  });
  const g = [...grupos].reverse().find((x) => t >= x[0].inicio - 0.06);
  if (!g) return null;
  const cor = cores[fala.quem] || AM;
  const ent = sp(f, Math.round(g[0].inicio * FPS), 11, 260);
  return (
    <div style={{position: 'absolute', top: 1170, left: 30, right: 30, textAlign: 'center', transform: `scale(${interpolate(ent, [0, 1], [0.75, 1])})`}}>
      {nomes[fala.quem] && <div style={{display: 'inline-block', marginBottom: 8, fontFamily: F, fontWeight: 900, fontSize: 32, letterSpacing: 4, color: '#111',
        background: cor, padding: '4px 18px', borderRadius: 10}}>{nomes[fala.quem]}</div>}
      <div>
        {g.map((w, k) => {
          const on = t >= w.inicio && t < (g[k + 1]?.inicio ?? 99);
          return <span key={k} style={{fontFamily: ANTON, fontSize: 112, lineHeight: 1.05, margin: '0 14px', display: 'inline-block', textTransform: 'uppercase',
            color: on ? cor : '#fff', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', textShadow: '0 10px 0 rgba(0,0,0,.55)'}}>{w.palavra}</span>;
        })}
      </div>
    </div>
  );
};

const Flash: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 5], [0.22, 0], {extrapolateRight: 'clamp'})}} />;
};

// ---------- motion ----------
const Placar: React.FC<{cfg: Cfg}> = ({cfg}) => {
  const f = useCurrentFrame();
  const {INI, FIM, q} = tempos(cfg.cenas);
  if (f < INI[1] || f >= FIM) return null;
  const ps = cfg.perigo.map(q);
  const n = ps.filter((x) => f >= x).length;
  const ult = ps[n - 1] ?? -99;
  const pul = n > 0 ? 1 + 0.35 * Math.max(0, 1 - (f - ult) / 12) : 1;
  const box = (rot: string, val: React.ReactNode, cor: string, sc = 1, k = rot) => (
    <div key={k} style={{flex: 1, textAlign: 'center', transform: `scale(${sc})`}}>
      <div style={{fontFamily: F, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: '#bbb'}}>{rot}</div>
      <div style={{fontFamily: ANTON, fontSize: 46, color: cor, lineHeight: 1.1, whiteSpace: 'nowrap'}}>{val}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', top: 60, left: 30, right: 30, display: 'flex', gap: 8, background: 'rgba(8,8,12,.8)', borderRadius: 20, padding: '10px 10px 12px',
      border: '2px solid rgba(255,255,255,.15)', opacity: sp(f, INI[1], 14)}}>
      {cfg.placar.map((b) => {
        if (typeof b.de === 'string') return box(b.rot, b.de, b.cor || '#fff');
        const t0 = b.em ? q(b.em) : 0;
        const v = interpolate(f, [t0, t0 + 45], [b.de, b.para ?? b.de], cl);
        const depois = f >= t0;
        return box(b.rot, b.num ? '❤️ ' + Math.round(v) : brl(v), depois ? b.corDepois || '#fff' : b.cor || '#fff', depois && f < t0 + 55 ? 1.08 : 1);
      })}
      {box('PERIGO', <span style={{fontFamily: ANTON}}>{'★'.repeat(n)}<span style={{color: '#555', fontFamily: ANTON}}>{'★'.repeat(Math.max(0, 5 - n))}</span></span>, AM, pul)}
    </div>
  );
};

const Overlay: React.FC<{o: Ov; cfg: Cfg}> = ({o, cfg}) => {
  const f = useCurrentFrame();
  const {INI, q} = tempos(cfg.cenas);
  if (o.t === 'grande') {
    if (f >= INI[1]) return null;
    const v = interpolate(f, [4, 40], [0, o.num], cl);
    const s = sp(f, 0, 10, 200);
    const t2 = o.subEm ? q(o.subEm) - 4 : 45;
    const s2 = sp(f, t2, 11, 200);
    return (
      <div style={{position: 'absolute', top: 380, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: ANTON, fontSize: o.num >= 1000000 ? 150 : 190, color: o.cor || VERDE, WebkitTextStroke: '9px #000', paintOrder: 'stroke fill',
          textShadow: '0 12px 0 rgba(0,0,0,.6)', transform: `scale(${interpolate(s, [0, 1], [1.6, 1]) * (f > 40 && f < 50 ? 1.07 : 1)})`, lineHeight: 1}}>{brl(v)}</div>
        {f >= t2 && <div style={{fontFamily: ANTON, fontSize: 110, color: '#fff', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill',
          textShadow: '0 10px 0 rgba(0,0,0,.6)', transform: `scale(${interpolate(s2, [0, 1], [1.5, 1])})`, opacity: s2, lineHeight: 1.05}}>{o.sub}</div>}
      </div>
    );
  }
  if (o.t === 'gancho') {
    const fim = o.ate ? q(o.ate) : INI[1];
    if (f >= fim) return null;
    const s = sp(f, 0, 9, 260);
    const s2 = sp(f, 5, 9, 260);
    const treme = f < 10 ? Math.sin(f * 2.7) * 9 : 0;
    const st = (cor: string, tam: number) => ({fontFamily: ANTON, fontSize: tam, color: cor, WebkitTextStroke: '9px #000', paintOrder: 'stroke fill' as const,
      textShadow: '0 12px 0 rgba(0,0,0,.6)', lineHeight: 1.02, display: 'block'});
    return <div style={{position: 'absolute', top: o.top ?? 330, left: 40, right: 40, textAlign: 'center', transform: `translateX(${treme}px)`, opacity: saida(f, fim)}}>
      <span style={{...st(o.cor || AM, Math.min(112, Math.round(1900 / o.l1.length))), transform: `scale(${interpolate(s, [0, 1], [1.12, 1])})`}}>{o.l1}</span>
      <span style={{...st('#fff', Math.min(92, Math.round(1700 / o.l2.length))), marginTop: 14, transform: `scale(${interpolate(s2, [0, 1], [1.12, 1])})`, opacity: Math.min(1, 0.35 + s2)}}>{o.l2}</span>
    </div>;
  }
  if (o.t === 'decidiram') {
    if (f >= INI[1]) return null;
    const fas = Object.keys((FAS as Record<string, Record<string, number>>)[o.de] || {}).slice(0, 12);
    const s = sp(f, 0, 9, 240);
    return <div style={{position: 'absolute', top: 720, left: 60, right: 60, textAlign: 'center', transform: `scale(${interpolate(s, [0, 1], [1.25, 1])})`, opacity: saida(f, INI[1])}}>
      <div style={{fontFamily: ANTON, fontSize: 92, color: '#fff', WebkitTextStroke: '7px #000', paintOrder: 'stroke fill', lineHeight: 1}}>VOCÊS DECIDIRAM:</div>
      <div style={{display: 'inline-block', marginTop: 16, fontFamily: ANTON, fontSize: 130, color: '#fff', background: o.cor || VERDE, border: '7px solid #fff', borderRadius: 26,
        padding: '0 40px 10px', boxShadow: '0 14px 40px rgba(0,0,0,.6)'}}>{o.venc} ✔</div>
      {fas.length > 0 && <div style={{marginTop: 18, fontFamily: F, fontWeight: 800, fontSize: 32, color: '#fff', textShadow: '0 3px 8px #000', opacity: sp(f, 10)}}>QUEM VOTOU 👇</div>}
      {fas.length > 0 && <div style={{marginTop: 22, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12}}>
        {fas.map((u, k) => <span key={u} style={{fontFamily: F, fontWeight: 800, fontSize: 34, color: '#111', background: '#fff', borderRadius: 40, padding: '6px 20px',
          opacity: sp(f, 14 + k * 4), transform: `scale(${sp(f, 14 + k * 4, 10, 240)})`}}>@{u}</span>)}
      </div>}
    </div>;
  }
  if (o.t === 'ranking') {
    const a = INI[o.cena], b = INI[o.cena + 1];
    if (!dentro(f, a, b)) return null;
    const todos: Record<string, number> = {};
    Object.values(FAS as Record<string, Record<string, number>>).forEach((ep) => Object.entries(ep).forEach(([u, n]) => {todos[u] = (todos[u] || 0) + n;}));
    const top = Object.entries(todos).sort((x, y) => y[1] - x[1]).slice(0, 3);
    if (!top.length) return null;
    const med = ['🥇', '🥈', '🥉'];
    return <div style={{position: 'absolute', top: 750, left: 90, right: 90, transform: `scale(${sp(f, a + 2, 11, 220)})`, opacity: saida(f, b)}}>
      <div style={{background: 'rgba(14,14,20,.95)', borderRadius: 30, padding: '20px 30px 24px', border: `4px solid ${AM}`, boxShadow: '0 20px 50px rgba(0,0,0,.7)'}}>
        <div style={{fontFamily: ANTON, fontSize: 64, color: AM, textAlign: 'center'}}>🏆 TOP DO CORRE</div>
        {top.map(([u, n], k) => <div key={u} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, opacity: sp(f, a + 10 + k * 6),
          transform: `translateX(${interpolate(sp(f, a + 10 + k * 6, 12, 200), [0, 1], [-80, 0])}px)`}}>
          <span style={{fontFamily: F, fontWeight: 800, fontSize: 44, color: '#fff'}}>{med[k]} @{u}</span>
          <span style={{fontFamily: F, fontWeight: 700, fontSize: 32, color: '#bbb'}}>{n} coment.</span></div>)}
      </div></div>;
  }
  if (o.t === 'relogio') {
    const a = INI[o.cena], b = INI[o.cena + 1];
    if (!dentro(f, a, b)) return null;
    const [h1, m1] = o.de.split(':').map(Number);
    const [h2, m2] = (o.ate_h || o.de).split(':').map(Number);
    const x = h1 * 60 + m1, y = (h2 < h1 ? h2 + 24 : h2) * 60 + m2;
    const m = Math.round(interpolate(f, [a + 8, b - 10], [x, y], cl)) % 1440;
    return <div style={{position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center', transform: `scale(${sp(f, a + 2, 12, 200)})`, opacity: saida(f, b)}}>
      <span style={{fontFamily: ANTON, fontSize: 190, color: '#fff', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', textShadow: '0 12px 0 rgba(0,0,0,.55)'}}>
        {`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`}</span></div>;
  }
  const ini = q(o.em) - 4, fim = INI[o.ate];
  if (!dentro(f, ini, fim)) return null;
  const s = sp(f, ini, 10, 220);
  if (o.t === 'etiqueta' || o.t === 'selo') {
    const selo = o.t === 'selo';
    return <div style={{position: 'absolute', top: o.top ?? (selo ? 420 : 330), left: 0, right: 0, textAlign: 'center',
      transform: `scale(${interpolate(s, [0, 1], [selo ? 2.2 : 1.8, 1])}) rotate(${o.rot ?? (selo ? -5 : -4)}deg)`, opacity: Math.min(1, s * 1.5) * saida(f, fim)}}>
      {selo
        ? <span style={{fontFamily: ANTON, fontSize: 96, color: o.cor || VERM, border: `9px solid ${o.cor || VERM}`, borderRadius: 16, padding: '0 26px 6px', background: 'rgba(0,0,0,.78)', whiteSpace: 'nowrap'}}>{o.txt}</span>
        : <span style={{fontFamily: ANTON, fontSize: 70, color: '#fff', background: o.cor || '#333', borderRadius: 14, padding: '2px 26px 8px', boxShadow: '0 12px 30px rgba(0,0,0,.6)'}}>{o.txt}</span>}
    </div>;
  }
  if (o.t === 'card') {
    return <div style={{position: 'absolute', top: o.top ?? 330, left: 100, right: 100, transform: `scale(${s})`, opacity: saida(f, fim)}}>
      <div style={{background: 'rgba(20,20,26,.95)', borderRadius: 28, padding: '22px 30px', border: `3px solid ${o.cor || '#444'}`, boxShadow: '0 20px 50px rgba(0,0,0,.7)'}}>
        <div style={{fontFamily: F, fontWeight: 700, fontSize: 30, color: '#999', letterSpacing: 2}}>{o.rot}</div>
        <div style={{fontFamily: ANTON, fontSize: 120, color: o.cor || '#fff', lineHeight: 1.05}}>{o.big}</div>
        {o.sub && <div style={{fontFamily: F, fontWeight: 700, fontSize: 30, color: '#ddd'}}>{o.sub}</div>}
      </div></div>;
  }
  if (o.t === 'notif') {
    const treme = f - ini < 22 ? Math.sin(f * 3) * 7 : 0;
    return <div style={{position: 'absolute', top: 330, left: 50, right: 50, transform: `translateY(${interpolate(s, [0, 1], [-260, 0])}px) translateX(${treme}px)`, opacity: saida(f, fim)}}>
      <div style={{background: 'rgba(245,245,247,.96)', borderRadius: 34, padding: '22px 28px', display: 'flex', gap: 22, alignItems: 'center', boxShadow: '0 20px 50px rgba(0,0,0,.6)'}}>
        <div style={{width: 96, height: 96, borderRadius: '50%', background: o.cor || AZUL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, flexShrink: 0}}>{o.icone || '💬'}</div>
        <div style={{flex: 1}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F, fontWeight: 800, fontSize: 34, color: '#111'}}><span>{o.de}</span><span style={{fontSize: 26, color: '#888', fontWeight: 600}}>agora</span></div>
          <div style={{fontFamily: F, fontWeight: 600, fontSize: 34, color: '#222'}}>{o.txt}</div>
        </div></div></div>;
  }
  return null;
};

const Votacao: React.FC<{cfg: Cfg}> = ({cfg}) => {
  const f = useCurrentFrame();
  const {INI, FIM} = tempos(cfg.cenas);
  const t = f - INI[cfg.votoCena];
  if (t < 0 || f >= FIM) return null;
  const a = cfg.votoAtraso;
  const bt = (k: number) => sp(f, INI[cfg.votoCena] + a + k * 8, 9, 200);
  const pulsa = 1 + Math.sin(t / 4) * 0.03;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-start', paddingTop: 290, flexDirection: 'column', gap: 30}}>
      <div style={{fontFamily: ANTON, fontSize: 96, color: '#fff', textAlign: 'center', lineHeight: 1.02, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill', opacity: sp(f, INI[cfg.votoCena] + a - 10)}}>
        O QUE VOCÊ<br /><span style={{color: AM, fontFamily: ANTON}}>FARIA</span></div>
      {cfg.voto.map(([o, cor, d], k) => (
        <div key={o} style={{transform: `scale(${bt(k) * pulsa})`, background: cor, color: '#fff', fontFamily: ANTON, fontSize: 92, width: 840, lineHeight: 1.1,
          padding: '10px 30px 16px', borderRadius: 28, border: '6px solid #fff', boxShadow: '0 14px 40px rgba(0,0,0,.6)', textAlign: 'center'}}>
          {o}<div style={{fontFamily: F, fontSize: 32, fontWeight: 700}}>{d}</div></div>
      ))}
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 46, color: AM, opacity: interpolate(t, [a + 25, a + 35], [0, 1], cl)}}>👇 COMENTA {cfg.voto[0][0]} OU {cfg.voto[1][0]}</div>
    </AbsoluteFill>
  );
};

const Segue: React.FC<{fim: number; parte: number; conta?: string; avatar?: string; rodape?: string}> = ({fim, parte, conta, avatar, rodape}) => {
  const f = useCurrentFrame();
  const t = f - fim;
  if (t < 0) return null;
  const s = sp(f, fim, 12, 170);
  const seguindo = t >= 30;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1b1b22 0%, #050507 75%)', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26}}>
      <div style={{width: 280, height: 280, borderRadius: '50%', overflow: 'hidden', border: `8px solid ${AM}`, transform: `scale(${s})`}}>
        <Img src={staticFile(avatar || 'biel/avatar_biel.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>
      <div style={{fontFamily: ANTON, fontSize: 80, color: '#fff', opacity: s}}>{conta || '@ocorredobiel'}</div>
      <div style={{fontFamily: F, fontWeight: 900, fontSize: 60, color: '#fff', background: seguindo ? '#333' : '#1f8bff', padding: '16px 80px 20px', borderRadius: 24,
        transform: `scale(${(t > 24 && t < 32 ? 0.92 : 1) * sp(f, fim + 4)})`}}>{seguindo ? 'Seguindo ✔' : 'Seguir'}</div>
      <div style={{fontFamily: ANTON, fontSize: 64, color: AM, opacity: sp(f, fim + 34)}}>A PARTE {parte + 1} SAI AMANHÃ</div>
      {rodape && <div style={{fontFamily: F, fontWeight: 800, fontSize: 40, color: '#fff', opacity: sp(f, fim + 44), textAlign: 'center', padding: '0 80px'}}>{rodape}</div>}
    </AbsoluteFill>
  );
};

const Som: React.FC<{em: number; src: string; vol: number; dur?: number}> = ({em, src, vol, dur = 60}) => (
  <Sequence from={Math.max(0, em)} durationInFrames={Math.max(1, dur)}><Audio src={staticFile(`biel/${src}`)} volume={vol} /></Sequence>
);

export const BielHist: React.FC<{ep: string}> = ({ep}) => {
  const cfg = EPS[ep];
  const {INI, FIM, q} = tempos(cfg.cenas);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {cfg.cenas.map((c, i) => {
        const dur = (i < cfg.cenas.length - 1 ? INI[i + 1] : FIM) - INI[i];
        return (
          <Sequence key={i} from={INI[i]} durationInFrames={dur}>
            <Cenario c={c} i={i} dur={dur} voto={i === cfg.votoCena} />
            {i > 0 && <Flash />}
            {i !== 0 && <Legenda c={c} cores={cfg.cores} nomes={cfg.nomes} />}
            <Audio src={staticFile(`biel/${ep}/c${String(i + 1).padStart(2, '0')}.mp3`)} />
            {i > 0 && <Audio src={staticFile('biel/sfx_whoosh.wav')} volume={0.15} />}
          </Sequence>
        );
      })}
      {cfg.ovs.map((o, k) => <Overlay key={k} o={o} cfg={cfg} />)}
      <Votacao cfg={cfg} /><Placar cfg={cfg} /><Segue fim={FIM} parte={cfg.parte} conta={cfg.conta} avatar={cfg.avatar} rodape={cfg.rodape} />
      <Som em={0} src="boom.wav" vol={0.7} />
      {cfg.sons.map(([m, src, v], k) => <Som key={k} em={q(m) - 2} src={src} vol={v} />)}
      {cfg.perigo.map((m, k) => <Som key={'p' + k} em={q(m)} src="pop.wav" vol={0.35} dur={20} />)}
      <Som em={INI[cfg.votoCena] + cfg.votoAtraso} src="pop.wav" vol={0.5} /><Som em={FIM + 26} src="pop.wav" vol={0.6} />
      <Audio src={staticFile(`biel/${cfg.trilha}`)} volume={0.22} />
    </AbsoluteFill>
  );
};

export const CAPA: Record<string, {img: string; l1: string; l2: string; topo: [string, string]; v: [string, string]; parte?: number}> = {
  em2: {img: 'em2_c3a', l1: 'O', l2: 'EMPRÉSTIMO', topo: ['VOCÊ COBROU', 'E ELE RESPONDEU 😤'], v: ['PERDOA', 'COBRA'], parte: 2},
  au2: {img: 'au2_c4a', l1: 'O ÁUDIO', l2: 'ERRADO', topo: ['VOCÊ APAGOU', 'MAS O PRIMO TEM O ÁUDIO'], v: ['IMPLORA', 'CONTA'], parte: 2},
};
export const BielHistCapa: React.FC<{ep: string}> = ({ep}) => {
  const c = CAPA[ep];
  const st = (cor: string, tam: number) => ({fontFamily: ANTON, fontSize: tam, color: cor, WebkitTextStroke: '10px #000', paintOrder: 'stroke fill' as const, textShadow: '0 14px 0 rgba(0,0,0,.6)', lineHeight: 1});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Img src={staticFile(`biel/${c.img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.05) 35%, rgba(0,0,0,.2) 55%, rgba(0,0,0,.8) 100%)'}} />
      <div style={{position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center'}}>
        <div style={st(VERDE, 150)}>{c.topo[0]}</div>
        <div style={{...st('#fff', 70), marginTop: 10}}>{c.topo[1]}</div>
      </div>
      <div style={{position: 'absolute', top: 1050, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{display: 'inline-block', fontFamily: F, fontWeight: 900, fontSize: 52, letterSpacing: 8, color: '#111', background: AM, padding: '6px 32px 8px', borderRadius: 14, marginBottom: 14}}>PARTE {c.parte || 1}</div>
        <div style={st('#fff', 190)}>{c.l1}</div>
        <div style={st(AM, 190)}>{c.l2}</div>
      </div>
      <div style={{position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center', fontFamily: ANTON, fontSize: 70, color: '#fff', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>
        VOCÊ <span style={{color: VERDE, fontFamily: ANTON}}>{c.v[0]}</span> OU <span style={{color: VERM, fontFamily: ANTON}}>{c.v[1]}</span>?</div>
    </AbsoluteFill>
  );
};
