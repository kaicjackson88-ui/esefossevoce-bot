import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, Easing} from 'remotion';

// Peças compartilhadas pelos criativos v3 (cada criativo define seu próprio estilo por cima)
export const SANS = 'Inter, sans-serif', SERIF = 'InstrumentSerif, serif', COND = 'Anton, sans-serif', MONO = 'PlexMono, monospace';
export const ease = Easing.bezier(0.16, 1, 0.3, 1);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const lin = (f: number, a: number, b: number, x: number, y: number, e = ease) => interpolate(f, [a, b], [x, y], {...cl, easing: e});
export const sp = (f: number, d = 12, s = 120) => spring({frame: f, fps: 30, config: {damping: d, stiffness: s}});
export const S = staticFile;

export const Fontes = () => (
  <style>{`
  @font-face{font-family:Inter;font-weight:600;src:url(${S('fonts/inter-600.woff2')})}
  @font-face{font-family:Inter;font-weight:800;src:url(${S('fonts/inter-800.woff2')})}
  @font-face{font-family:Inter;font-weight:900;src:url(${S('fonts/inter-900.woff2')})}
  @font-face{font-family:InstrumentSerif;font-style:italic;src:url(${S('fonts/serif-it.woff2')})}
  @font-face{font-family:InstrumentSerif;font-style:normal;src:url(${S('fonts/serif.woff2')})}
  @font-face{font-family:Anton;src:url(${S('fonts/anton.woff2')})}
  @font-face{font-family:PlexMono;font-weight:600;src:url(${S('fonts/mono-600.woff2')})}`}</style>
);

export type Pal = {t: string; serif?: boolean; cond?: boolean; cor?: string; bloco?: string; rot?: number};
export const Frase: React.FC<{p: Pal[]; f0: number; size: number; passo?: number; cor?: string; largura?: number}> = ({p, f0, size, passo = 4, cor = '#111', largura = 980}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', gap: `0 ${size * 0.22}px`, maxWidth: largura}}>
      {p.map((w, i) => {
        const q = lin(f, f0 + i * passo, f0 + i * passo + 14, 0, 1);
        const st: React.CSSProperties = w.serif
          ? {fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: size * 1.12, letterSpacing: '-0.02em'}
          : w.cond ? {fontFamily: COND, fontSize: size * 1.05, textTransform: 'uppercase'}
          : {fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: '-0.055em'};
        return <span key={i} style={{...st, color: w.cor ?? cor, lineHeight: 1.04, display: 'inline-block', whiteSpace: 'nowrap', opacity: q, filter: `blur(${(1 - q) * 14}px)`, transform: `translateY(${(1 - q) * 46}px) scale(${0.9 + q * 0.1}) rotate(${w.rot ?? 0}deg)`, background: w.bloco, padding: w.bloco ? '0 18px' : 0}}>{w.t}</span>;
      })}
    </div>
  );
};

export const Centro: React.FC<{top: number; children: React.ReactNode; z?: number}> = ({top, children, z}) => (
  <div style={{position: 'absolute', top, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: z}}>{children}</div>
);

export const Grao: React.FC<{op?: number; modo?: 'multiply' | 'screen'}> = ({op = 0.15, modo = 'multiply'}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: op, mixBlendMode: modo, pointerEvents: 'none'}}>
    <filter id="grao"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" /></filter>
    <rect width={1080} height={1920} filter="url(#grao)" />
  </svg>
);

export const Celular: React.FC<{children: React.ReactNode; rx: number; ry: number; rz?: number; s: number; y?: number; x?: number; brilho?: string}> = ({children, rx, ry, rz = 0, s, y = 0, x = 0, brilho = 'rgba(0,0,0,0)'}) => (
  <div style={{position: 'absolute', left: '50%', top: '50%', width: 640, height: 1380, marginLeft: -320, marginTop: -690, perspective: 2400}}>
    <div style={{width: '100%', height: '100%', transform: `translate(${x}px,${y}px) scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`, transformStyle: 'preserve-3d'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 100, background: 'linear-gradient(135deg,#4a4a4a,#0b0b0b 40%,#2c2c2c)', boxShadow: `0 80px 140px rgba(0,0,0,.45), 0 0 0 3px #6a6a6a inset, 0 0 140px ${brilho}`}} />
      <div style={{position: 'absolute', inset: 18, borderRadius: 84, overflow: 'hidden', background: '#000'}}>
        {children}
        <AbsoluteFill style={{background: `linear-gradient(${110 + ry * 2}deg, rgba(255,255,255,.18), transparent 32%, transparent 76%, rgba(255,255,255,.06))`}} />
      </div>
    </div>
  </div>
);

export const Obj: React.FC<{src: string; f: number; size: number; x: number; y: number; rot?: number; sombra?: string}> = ({src, f, size, x, y, rot = 0, sombra = 'drop-shadow(0 40px 40px rgba(0,0,0,.35))'}) => {
  const s = sp(f, 11, 130);
  return <Img src={S(src)} style={{position: 'absolute', left: x - size / 2, top: y - size / 2 + Math.sin(f / 15) * 12, width: size, height: size, objectFit: 'contain', filter: sombra, transform: `scale(${s}) rotate(${rot + (1 - s) * -28 + Math.sin(f / 22) * 2}deg)`}} />;
};

export type Venda = {tipo: 'kiwify' | 'pix'; valor: string; ha: string; obs?: string};
export const VENDAS: Venda[] = [
  {tipo: 'pix', valor: '47,00', ha: 'agora', obs: 'mentoria'},
  {tipo: 'kiwify', valor: '17,41', ha: 'há 3m'},
  {tipo: 'pix', valor: '19,90', ha: 'há 8m', obs: 'curso'},
  {tipo: 'kiwify', valor: '17,41', ha: 'há 14m'},
  {tipo: 'pix', valor: '47,00', ha: 'há 21m', obs: 'mentoria'},
  {tipo: 'pix', valor: '19,90', ha: 'há 33m', obs: 'curso'},
];
export const Notif: React.FC<{f: number; v: Venda; style?: React.CSSProperties; claro?: boolean}> = ({f, v, style, claro}) => {
  const s = sp(f, 13, 170); const q = Math.min(1, Math.max(0, s));
  return (
    <div style={{...style, opacity: Math.min(1, q * 1.6)}}>
      <div style={{transform: `translateY(${(1 - s) * -220}px) scale(${0.86 + 0.14 * s}) rotateX(${(1 - s) * 55}deg)`, filter: `blur(${(1 - q) * 10}px)`, display: 'flex', alignItems: 'center', gap: 24, padding: '24px 28px', borderRadius: 42, background: claro ? 'rgba(255,255,255,.95)' : 'rgba(48,44,40,.9)', boxShadow: '0 24px 50px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.12)', fontFamily: SANS, color: claro ? '#111' : '#fff'}}>
        {v.tipo === 'kiwify'
          ? <Img src={S('ad/kiwi_icon.png')} style={{width: 88, height: 88, borderRadius: 22}} />
          : <div style={{width: 88, height: 88, borderRadius: 22, background: 'linear-gradient(135deg,#2fd6a3,#0e9f74)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 50, color: '#fff'}}>$</div>}
        <div style={{flex: 1}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span style={{fontWeight: 800, fontSize: 35}}>{v.tipo === 'kiwify' ? 'Venda aprovada no Pix!' : 'Pix recebido'}</span>
            <span style={{fontWeight: 600, fontSize: 28, opacity: .55}}>{v.ha}</span>
          </div>
          <div style={{fontWeight: 600, fontSize: 33, opacity: .9, marginTop: 2}}>{v.tipo === 'kiwify' ? `Sua comissão: R$ ${v.valor}` : `R$ ${v.valor} · ${v.obs}`}</div>
        </div>
      </div>
    </div>
  );
};

export const Cena: React.FC<{f: number; de: number; ate: number; children: React.ReactNode; fundo?: string; giro?: number}> = ({f, de, ate, children, fundo, giro = 2}) => {
  if (f < de - 1 || f >= ate + 6) return null;
  const ent = lin(f, de - 1, de + 8, 0, 1);
  const sai = lin(f, ate - 2, ate + 6, 0, 1, Easing.in(Easing.cubic));
  return <AbsoluteFill style={{background: fundo, opacity: 1 - sai, filter: `blur(${(1 - ent) * 24 + sai * 30}px)`, transform: `scale(${0.88 + 0.12 * ent + sai * 0.3}) rotate(${(1 - ent) * -giro + sai * giro}deg)`}}>{children}</AbsoluteFill>;
};

export const Mao: React.FC<{f: number; fim: number}> = ({f, fim}) => (
  <div style={{position: 'absolute', right: -30, bottom: -110, fontSize: 120, opacity: lin(f, fim - 55, fim - 42, 0, 1), transform: `translate(${lin(f, fim - 55, fim - 40, 120, 0)}px,${lin(f, fim - 55, fim - 40, 160, 0)}px)`}}>👆</div>
);
