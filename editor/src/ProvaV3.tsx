import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing} from 'remotion';
import TT from './campanha_tempos.json';

// Criativo "Prova 3 milhões" v3 — pôster editorial com camadas, tipografia mista e vendas reais
const T = (TT as Record<string, {ini: number[]; total: number}>).Prova6;
export const PROVA3_DUR = T.total;
const SANS = 'Inter, sans-serif', SERIF = 'InstrumentSerif, serif';
const VR = '#e5321f', PAPEL = '#e9e6df', TI = '#0e0e0e';
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lin = (f: number, a: number, b: number, x: number, y: number, e = ease) => interpolate(f, [a, b], [x, y], {...cl, easing: e});
const sp = (f: number, d = 12, s = 120) => spring({frame: f, fps: 30, config: {damping: d, stiffness: s}});
const S = staticFile;

const Fontes = () => (
  <style>{`
  @font-face{font-family:Inter;font-weight:600;src:url(${S('fonts/inter-600.woff2')})}
  @font-face{font-family:Inter;font-weight:800;src:url(${S('fonts/inter-800.woff2')})}
  @font-face{font-family:Inter;font-weight:900;src:url(${S('fonts/inter-900.woff2')})}
  @font-face{font-family:InstrumentSerif;font-style:italic;src:url(${S('fonts/serif-it.woff2')})}
  @font-face{font-family:InstrumentSerif;font-style:normal;src:url(${S('fonts/serif.woff2')})}`}</style>
);

type Pal = {t: string; serif?: boolean; cor?: string; bloco?: string};
const Frase: React.FC<{p: Pal[]; f0: number; size: number; passo?: number; cor?: string}> = ({p, f0, size, passo = 4, cor = TI}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', gap: `0 ${size * 0.22}px`, maxWidth: 980}}>
      {p.map((w, i) => {
        const q = lin(f, f0 + i * passo, f0 + i * passo + 14, 0, 1);
        const st: React.CSSProperties = w.serif
          ? {fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: size * 1.12, letterSpacing: '-0.02em'}
          : {fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: '-0.055em'};
        return <span key={i} style={{...st, color: w.cor ?? cor, lineHeight: 1.04, display: 'inline-block', whiteSpace: 'nowrap', opacity: q, filter: `blur(${(1 - q) * 14}px)`, transform: `translateY(${(1 - q) * 46}px) scale(${0.9 + q * 0.1})`, background: w.bloco, padding: w.bloco ? '0 18px' : 0}}>{w.t}</span>;
      })}
    </div>
  );
};

const Centro: React.FC<{top: number; children: React.ReactNode; z?: number}> = ({top, children, z}) => (
  <div style={{position: 'absolute', top, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: z}}>{children}</div>
);

const Papel: React.FC<{escuro?: boolean}> = ({escuro}) => {
  const c = escuro ? 'rgba(255,255,255,' : 'rgba(14,14,14,';
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{backgroundImage: `linear-gradient(${c}.05) 1px, transparent 1px), linear-gradient(90deg, ${c}.05) 1px, transparent 1px)`, backgroundSize: '90px 90px'}} />
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: escuro ? 0.1 : 0.16, mixBlendMode: escuro ? 'screen' : 'multiply'}}>
        <filter id="grao"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" /></filter>
        <rect width={1080} height={1920} filter="url(#grao)" />
      </svg>
      {[[40, 40], [1040, 40], [40, 1880], [1040, 1880]].map(([x, y], i) => (
        <svg key={i} width={60} height={60} style={{position: 'absolute', left: x - 30, top: y - 30}}><path d="M30 0V60M0 30H60" stroke={escuro ? '#fff' : TI} strokeWidth={2} opacity={0.4} /></svg>
      ))}
    </AbsoluteFill>
  );
};

const Cantos: React.FC<{f: number; tag: string; num: string; escuro?: boolean}> = ({f, tag, num, escuro}) => {
  const cor = escuro ? '#fff' : TI;
  const barras = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 4, 1, 2, 1, 3];
  return (
    <AbsoluteFill style={{opacity: lin(f, 0, 14, 0, 1), fontFamily: SANS, fontWeight: 600, color: cor, fontSize: 22, letterSpacing: '0.1em', zIndex: 8}}>
      <div style={{position: 'absolute', top: 110, left: 70, lineHeight: 1.45}}>ANIMADOR DE BOLSO<br /><span style={{opacity: .5}}>{tag}</span></div>
      <div style={{position: 'absolute', top: 100, right: 70, textAlign: 'right', lineHeight: 1.2}}><span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 44, letterSpacing: 0}}>{num}</span><br /><span style={{opacity: .5}}>PERFIS REAIS</span></div>
      <div style={{position: 'absolute', top: 205, left: 70, right: 70, height: 2, background: cor, opacity: .3, transform: `scaleX(${lin(f, 2, 26, 0, 1)})`, transformOrigin: 'left'}} />
      <div style={{position: 'absolute', bottom: 290, left: 70, display: 'flex', gap: 3, height: 56}}>{barras.map((w, i) => <div key={i} style={{width: w * 3, background: cor}} />)}</div>
      <div style={{position: 'absolute', bottom: 290, right: 70, textAlign: 'right', lineHeight: 1.45, opacity: .6}}>FEITO COM IA<br />NO CELULAR</div>
    </AbsoluteFill>
  );
};

const Letreiro: React.FC<{f: number; t: string; top: number; cor: string; vel?: number; serif?: boolean}> = ({f, t, top, cor, vel = 8, serif}) => (
  <div style={{position: 'absolute', top, left: 0, whiteSpace: 'nowrap', fontFamily: serif ? SERIF : SANS, fontStyle: serif ? 'italic' : 'normal', fontWeight: serif ? 400 : 900, fontSize: serif ? 470 : 420, letterSpacing: serif ? '-0.02em' : '-0.06em', color: cor, transform: `translateX(${160 - f * vel}px)`}}>{`${t} ${t} ${t} ${t}`}</div>
);

const Celular: React.FC<{children: React.ReactNode; rx: number; ry: number; rz?: number; s: number; y?: number}> = ({children, rx, ry, rz = 0, s, y = 0}) => (
  <div style={{position: 'absolute', left: '50%', top: '50%', width: 640, height: 1380, marginLeft: -320, marginTop: -690, perspective: 2400}}>
    <div style={{width: '100%', height: '100%', transform: `translateY(${y}px) scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`, transformStyle: 'preserve-3d'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 100, background: 'linear-gradient(135deg,#4a4a4a,#0b0b0b 40%,#2c2c2c)', boxShadow: '0 80px 140px rgba(0,0,0,.45), 0 0 0 3px #6a6a6a inset'}} />
      <div style={{position: 'absolute', inset: 18, borderRadius: 84, overflow: 'hidden', background: '#000'}}>
        {children}
        <AbsoluteFill style={{background: `linear-gradient(${110 + ry * 2}deg, rgba(255,255,255,.18), transparent 32%, transparent 76%, rgba(255,255,255,.06))`}} />
      </div>
    </div>
  </div>
);

const Obj: React.FC<{src: string; f: number; size: number; x: number; y: number; rot?: number}> = ({src, f, size, x, y, rot = 0}) => {
  const s = sp(f, 11, 130);
  return <Img src={S(src)} style={{position: 'absolute', left: x - size / 2, top: y - size / 2 + Math.sin(f / 15) * 12, width: size, height: size, objectFit: 'contain', filter: 'drop-shadow(0 40px 40px rgba(0,0,0,.35))', transform: `scale(${s}) rotate(${rot + (1 - s) * -28 + Math.sin(f / 22) * 2}deg)`}} />;
};

const Circulo: React.FC<{f: number; size: number; x: number; y: number; cor?: string; anel?: boolean}> = ({f, size, x, y, cor = VR, anel}) => {
  const s = sp(f, 15, 80);
  return (
    <>
      <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%', background: cor, transform: `scale(${s})`}} />
      {anel && <div style={{position: 'absolute', left: x - size * 0.62, top: y - size * 0.62, width: size * 1.24, height: size * 1.24, borderRadius: '50%', border: `2px dashed ${TI}`, opacity: .35 * s, transform: `rotate(${f * 0.6}deg)`}} />}
    </>
  );
};

const Chip: React.FC<{f: number; t: string; x: number; y: number; lx: number; ly: number}> = ({f, t, x, y, lx, ly}) => {
  const p = lin(f, 0, 12, 0, 1);
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={lx} y1={ly} x2={lx + (x - lx) * p} y2={ly + (y - ly) * p} stroke={TI} strokeWidth={2.5} />
        <circle cx={lx} cy={ly} r={9 * p} fill={TI} />
      </svg>
      <div style={{position: 'absolute', left: x, top: y + Math.sin(f / 13) * 6, transform: `translate(-50%,-50%) scale(${sp(f - 8, 10, 180)})`, fontFamily: SANS, fontWeight: 900, fontSize: 46, background: '#fff', color: TI, padding: '14px 28px', borderRadius: 50, boxShadow: '0 18px 40px rgba(0,0,0,.18)', whiteSpace: 'nowrap'}}>{t}</div>
    </>
  );
};

type Venda = {tipo: 'kiwify' | 'pix'; valor: string; ha: string; obs?: string};
const Notif: React.FC<{f: number; v: Venda; style?: React.CSSProperties}> = ({f, v, style}) => {
  const s = sp(f, 13, 170); const q = Math.min(1, Math.max(0, s));
  return (
    <div style={{...style, opacity: Math.min(1, q * 1.6)}}>
      <div style={{transform: `translateY(${(1 - s) * -220}px) scale(${0.86 + 0.14 * s}) rotateX(${(1 - s) * 55}deg)`, filter: `blur(${(1 - q) * 10}px)`, display: 'flex', alignItems: 'center', gap: 24, padding: '24px 28px', borderRadius: 42, background: 'rgba(48,44,40,.9)', boxShadow: '0 24px 50px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.12)', fontFamily: SANS, color: '#fff'}}>
        {v.tipo === 'kiwify'
          ? <Img src={S('ad/kiwi_icon.png')} style={{width: 88, height: 88, borderRadius: 22}} />
          : <div style={{width: 88, height: 88, borderRadius: 22, background: 'linear-gradient(135deg,#2fd6a3,#0e9f74)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 50}}>$</div>}
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
const VENDAS: Venda[] = [
  {tipo: 'pix', valor: '47,00', ha: 'agora', obs: 'mentoria'},
  {tipo: 'kiwify', valor: '17,41', ha: 'há 3m'},
  {tipo: 'pix', valor: '19,90', ha: 'há 8m', obs: 'curso'},
  {tipo: 'kiwify', valor: '17,41', ha: 'há 14m'},
  {tipo: 'pix', valor: '47,00', ha: 'há 21m', obs: 'mentoria'},
  {tipo: 'pix', valor: '19,90', ha: 'há 33m', obs: 'curso'},
];

const Cena: React.FC<{f: number; de: number; ate: number; children: React.ReactNode; fundo?: string}> = ({f, de, ate, children, fundo}) => {
  if (f < de - 1 || f >= ate + 6) return null;
  const ent = lin(f, de - 1, de + 8, 0, 1);
  const sai = lin(f, ate - 2, ate + 6, 0, 1, Easing.in(Easing.cubic));
  return <AbsoluteFill style={{background: fundo, opacity: 1 - sai, filter: `blur(${(1 - ent) * 24 + sai * 30}px)`, transform: `scale(${0.88 + 0.12 * ent + sai * 0.3}) rotate(${(1 - ent) * -2 + sai * 2}deg)`}}>{children}</AbsoluteFill>;
};

export const ProvaV3: React.FC = () => {
  const f = useCurrentFrame();
  const [a, b, c, d, e] = T.ini; const fim = T.total;
  const plims = VENDAS.map((_, i) => b + 14 + i * 8);
  const plimsCta = [e + 40, e + 52, e + 64];
  const contador = Math.round(lin(f, 80, 140, 0, 3000000, Easing.out(Easing.cubic)));
  const vira = c + 57;

  return (
    <AbsoluteFill style={{background: PAPEL}}>
      <Fontes />
      <Audio src={S('ad/beat.wav')} volume={0.2} />
      <Audio src={S('ad/voz_Prova6.wav')} />
      {[b, c, d, e].map((x) => <Sequence key={x} from={x - 7}><Audio src={S('biel/sfx_whoosh.wav')} volume={0.42} /></Sequence>)}
      {[...plims, ...plimsCta].map((x) => <Sequence key={x} from={x}><Audio src={S('ad/plim.wav')} volume={0.5} /></Sequence>)}
      {[a + 140, c + 30, d + 108].map((x) => <Sequence key={x} from={x}><Audio src={S('ad/hit.wav')} volume={0.42} /></Sequence>)}
      {[d + 4, d + 28, d + 52, d + 72].map((x) => <Sequence key={x} from={x}><Audio src={S('biel/pop.wav')} volume={0.4} /></Sequence>)}
      <Sequence from={fim - 40}><Audio src={S('biel/pop.wav')} volume={0.7} /></Sequence>

      <Cena f={f} de={a} ate={b}>
        <Papel />
        <Letreiro f={f} t="3.000.000" top={600} cor="rgba(14,14,14,.07)" vel={7} />
        <Circulo f={f - 2} size={780} x={540} y={930} anel />
        <Cantos f={f} tag="VIRAL DE VERDADE" num="nº 01" />
        <Centro top={250}>{f < a + 78 ? <Frase f0={a + 2} size={84} p={[{t: 'você já viu', serif: true}, {t: 'esses perfis?'}]} /> : <Frase f0={a + 80} size={84} p={[{t: 'esse desenho', serif: true}, {t: 'passou de'}]} />}</Centro>
        <Celular rx={lin(f, 0, 34, 34, 6) + Math.sin(f / 26) * 2} ry={lin(f, 0, 34, -42, -15) + Math.sin(f / 34) * 4} rz={3} s={lin(f, 0, 34, 0.46, 0.55)} y={lin(f, 0, 34, 520, -10)}>
          <OffthreadVideo src={S('ad/rec_predio.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </Celular>
        <Chip f={f - 30} t="♥ 1 mi" x={880} y={640} lx={700} ly={760} />
        <Chip f={f - 40} t="↗ 89 mil" x={190} y={880} lx={390} ly={960} />
        <Chip f={f - 50} t="💬 3.422" x={870} y={1160} lx={690} ly={1100} />
        <Centro top={1390}>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 150, color: TI, letterSpacing: '-0.065em', lineHeight: 1, transform: `scale(${1 + 0.08 * (1 - sp(f - 140, 8, 220))})`}}>
            {contador >= 3000000 ? <>3 <span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.02em'}}>milhões</span></> : contador.toLocaleString('pt-BR')}
          </div>
          <div style={{marginTop: 10, fontFamily: SANS, fontWeight: 800, fontSize: 38, letterSpacing: '0.12em', color: '#fff', background: TI, padding: '8px 22px'}}>DE VISUALIZAÇÕES</div>
        </Centro>
        {f > a + 142 && <div style={{position: 'absolute', left: 720, top: 1320, fontFamily: SANS, fontWeight: 900, fontSize: 40, color: VR, border: `5px solid ${VR}`, padding: '6px 18px', borderRadius: 12, transform: `rotate(-12deg) scale(${lin(f, a + 142, a + 148, 2, 1, Easing.out(Easing.back(2)))})`}}>VIRAL ✓</div>}
      </Cena>

      <Cena f={f} de={b} ate={c} fundo={TI}>
        <Papel escuro />
        <Letreiro f={f - b} t="faturando" top={1250} cor="rgba(229,50,31,.4)" vel={-11} serif />
        <Cantos f={f - b} tag="PERFIS QUE VIRARAM RENDA" num="nº 02" escuro />
        {[{src: 'ad/rec_predio.mp4', x: -300, r: -9, k: 0, z: 1}, {src: 'ad/rec_cara.mp4', x: 0, r: 0, k: 5, z: 3}, {src: 'ad/rec_amigos.mp4', x: 300, r: 9, k: 10, z: 2}].map((o) => {
          const s = sp(f - b - o.k, 14, 110);
          return (
            <div key={o.src} style={{position: 'absolute', top: 330, left: 540 - 180 + o.x, width: 360, height: 780, borderRadius: 44, overflow: 'hidden', border: '7px solid #1b1b1b', boxShadow: '0 40px 80px rgba(0,0,0,.7)', transform: `translateY(${(1 - s) * 1300 + Math.sin((f + o.k * 9) / 20) * 10}px) rotate(${o.r}deg) scale(${o.x === 0 ? 1.1 : 0.94})`, zIndex: o.z, filter: o.x === 0 ? 'none' : 'brightness(.55)'}}>
              <Sequence from={b}><OffthreadVideo src={S(o.src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
            </div>
          );
        })}
        <div style={{position: 'absolute', top: 230, left: 0, right: 0, perspective: 1500, zIndex: 5}}>
          {VENDAS.map((v, i) => <Notif key={i} f={f - plims[i]} v={v} style={{position: 'absolute', left: 60 + (i % 2) * 40, right: 100 - (i % 2) * 40, top: (VENDAS.length - 1 - i) * 128}} />)}
        </div>
        <Centro top={1350} z={6}><Frase f0={b + 4} size={104} cor="#fff" p={[{t: 'e eles estão', serif: true}, {t: 'FATURANDO', bloco: VR}]} /></Centro>
      </Cena>

      <Cena f={f} de={c} ate={d}>
        <Papel />
        <Cantos f={f - c} tag="O ATALHO" num="nº 03" />
        <Letreiro f={f - c} t={f < vira ? 'computador' : 'celular'} top={1330} cor="rgba(14,14,14,.07)" vel={9} serif />
        {f < vira + 12 && (
          <div style={{position: 'absolute', left: lin(f, vira - 4, vira + 10, 540, -500, Easing.in(Easing.cubic)) - 330, top: 480, transform: `scale(${sp(f - c, 12, 140)})`}}>
            <svg width={660} height={560} viewBox="0 0 660 560">
              <circle cx={330} cy={250} r={250} fill="#d6d2ca" />
              <rect x={60} y={60} width={540} height={340} rx={26} fill={TI} /><rect x={86} y={86} width={488} height={288} rx={10} fill="#2f2f2f" />
              <rect x={110} y={110} width={180} height={18} rx={9} fill="#555" /><rect x={110} y={145} width={300} height={12} rx={6} fill="#444" />
              <rect x={280} y={400} width={100} height={70} fill={TI} /><rect x={180} y={470} width={300} height={28} rx={12} fill={TI} />
              <line x1={30} y1={30} x2={30 + 600 * lin(f, c + 28, c + 38, 0, 1)} y2={30 + 500 * lin(f, c + 28, c + 38, 0, 1)} stroke={VR} strokeWidth={42} strokeLinecap="round" />
            </svg>
          </div>
        )}
        {f < vira && (
          <Centro top={1140}>
            <Frase f0={c + 4} size={100} p={[{t: 'eles fazem', serif: true}, {t: 'no PC.'}]} />
            <div style={{height: 30}} />
            <div style={{display: 'flex', gap: 18}}>{['PC gamer', 'After Effects', 'horas'].map((t, i) => <div key={t} style={{fontFamily: SANS, fontWeight: 800, fontSize: 38, padding: '12px 28px', borderRadius: 40, border: `3px solid ${TI}`, transform: `scale(${sp(f - c - 30 - i * 4, 11, 170)})`, textDecoration: 'line-through'}}>{t}</div>)}</div>
          </Centro>
        )}
        {f >= vira - 2 && (
          <>
            <Circulo f={f - vira} size={640} x={540} y={790} anel />
            <Obj src="ad/ad_celular_t.png" f={f - vira} size={860} x={540} y={800} rot={-14} />
            <Centro top={1240}><Frase f0={vira + 2} size={92} p={[{t: 'você vai fazer', serif: true}, {t: 'IGUAL', bloco: VR, cor: '#fff'}]} /><div style={{height: 8}} /><Frase f0={vira + 30} size={118} p={[{t: 'só com o'}, {t: 'celular.', cor: VR}]} /></Centro>
          </>
        )}
      </Cena>

      <Cena f={f} de={d} ate={e}>
        <Papel />
        <Cantos f={f - d} tag="O MÉTODO" num="nº 04" />
        {(() => {
          const R = 330, cx = 540, cy = 860;
          const giro = (f - d) * 0.35;
          const prog = lin(f - d, 4, 104, 0.001, 0.9999);
          const ang2 = prog * Math.PI * 2;
          const itens = [{src: 'ad/ad_lapis_t.png', t: 'roteiro', k: 2, ang: -90, st: false}, {src: 'biel/avatar_biel.jpg', t: 'personagem', k: 26, ang: 0, st: true}, {src: 'ad/ad_microfone_t.png', t: 'voz', k: 50, ang: 90, st: false}, {src: 'ad/ad_claquete_t.png', t: 'animação', k: 70, ang: 180, st: false}];
          return (
            <>
              <svg width={1080} height={1920} style={{position: 'absolute'}}>
                <circle cx={cx} cy={cy} r={R} fill="none" stroke={TI} strokeWidth={2} strokeDasharray="8 12" opacity={lin(f - d, 0, 20, 0, .5)} />
                {Array.from({length: 60}, (_, i) => {
                  const an = (i / 60) * Math.PI * 2; const L = i % 5 === 0 ? 26 : 12; const r2 = R + 60;
                  return <line key={i} x1={cx + Math.cos(an) * r2} y1={cy + Math.sin(an) * r2} x2={cx + Math.cos(an) * (r2 + L)} y2={cy + Math.sin(an) * (r2 + L)} stroke={TI} strokeWidth={i % 5 === 0 ? 4 : 2} opacity={lin(f - d, i * 0.4, i * 0.4 + 6, 0, .55)} />;
                })}
                <path d={`M ${cx} ${cy - R} A ${R} ${R} 0 ${prog > 0.5 ? 1 : 0} 1 ${cx + Math.sin(ang2) * R} ${cy - Math.cos(ang2) * R}`} fill="none" stroke={VR} strokeWidth={10} strokeLinecap="round" />
              </svg>
              {itens.map((o) => {
                const an = ((o.ang + giro) * Math.PI) / 180;
                const x = cx + Math.cos(an) * R, y = cy + Math.sin(an) * R;
                const s = sp(f - d - o.k, 11, 150);
                return (
                  <React.Fragment key={o.t}>
                    <div style={{position: 'absolute', left: x - 140, top: y - 140, width: 280, height: 280, borderRadius: '50%', background: o.st ? VR : '#fff', boxShadow: '0 20px 50px rgba(0,0,0,.18)', transform: `scale(${s})`}} />
                    {o.st
                      ? <Img src={S(o.src)} style={{position: 'absolute', left: x - 115, top: y - 115, width: 230, height: 230, borderRadius: '50%', border: '8px solid #fff', objectFit: 'cover', transform: `scale(${s})`}} />
                      : <Img src={S(o.src)} style={{position: 'absolute', left: x - 120, top: y - 120, width: 240, height: 240, objectFit: 'contain', transform: `scale(${s}) rotate(-10deg)`}} />}
                    <div style={{position: 'absolute', left: x - 160, width: 320, top: y + 145, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: TI, opacity: Math.min(1, s)}}>{o.t}</div>
                  </React.Fragment>
                );
              })}
              <div style={{position: 'absolute', left: cx - 220, top: cy - 90, width: 440, textAlign: 'center'}}>
                {f >= d + 108
                  ? <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 160, letterSpacing: '-0.06em', color: TI, transform: `scale(${lin(f, d + 108, d + 114, 2.2, 1, Easing.out(Easing.back(2)))})`}}>IA</div>
                  : <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 90, color: TI, opacity: lin(f - d, 6, 16, 0, 1), marginTop: 30}}>tudo com</div>}
              </div>
              <Centro top={1430}><Frase f0={d + 50} size={66} p={[{t: 'do zero,', serif: true}, {t: 'no seu celular'}]} /></Centro>
            </>
          );
        })()}
      </Cena>

      <Cena f={f} de={e} ate={fim + 20}>
        <Papel />
        <Letreiro f={f - e} t="renda extra" top={1400} cor="rgba(14,14,14,.07)" vel={8} serif />
        <Circulo f={f - e} size={700} x={540} y={680} anel />
        <Obj src="ad/ad_rolo_t.png" f={f - e - 6} size={560} x={540} y={690} rot={12} />
        <div style={{position: 'absolute', top: 250, left: 0, right: 0, perspective: 1500}}>
          {[VENDAS[0], VENDAS[2], VENDAS[1]].map((v, i) => <Notif key={i} f={f - plimsCta[i]} v={v} style={{position: 'absolute', left: i % 2 ? 330 : 40, width: 700, top: [0, 330, 620][i], transform: `rotate(${[-4, 3, -2][i]}deg)`}} />)}
        </div>
        <Cantos f={f - e} tag="PASSO A PASSO" num="nº 05" />
        <Centro top={1090}>
          <Frase f0={e + 4} size={150} p={[{t: 'Animador', serif: true}]} />
          <div style={{marginTop: -10}}><Frase f0={e + 12} size={160} p={[{t: 'DE BOLSO', cor: VR}]} /></div>
          <div style={{marginTop: 46, position: 'relative', transform: `scale(${sp(f - e - 28, 11) * (f > fim - 40 && f < fim - 34 ? 0.93 : 1)})`}}>
            <div style={{padding: '30px 72px', borderRadius: 80, background: TI, fontFamily: SANS, fontWeight: 900, fontSize: 56, color: '#fff', boxShadow: '0 24px 60px rgba(0,0,0,.3)'}}>Quero por R$ 19,90</div>
            <div style={{position: 'absolute', right: -30, bottom: -110, fontSize: 120, opacity: lin(f, fim - 55, fim - 42, 0, 1), transform: `translate(${lin(f, fim - 55, fim - 40, 120, 0)}px,${lin(f, fim - 55, fim - 40, 160, 0)}px)`}}>👆</div>
          </div>
        </Centro>
      </Cena>
    </AbsoluteFill>
  );
};
