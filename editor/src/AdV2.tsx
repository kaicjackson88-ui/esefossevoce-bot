import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing} from 'remotion';
import T from './ad1_tempos.json';

// Anúncio v2 "Animador de Bolso" — estilo pôster minimalista (cinza, vermelho, preto) + provas reais
const F = 'Inter, sans-serif';
const VERM = '#e5321f', PAPEL = '#e8e6e1', TINTA = '#0e0e0e', OURO = '#f5b94a';
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lin = (f: number, a: number, b: number, x: number, y: number, e = ease) => interpolate(f, [a, b], [x, y], {...cl, easing: e});
const sp = (f: number, d = 12, s = 120) => spring({frame: f, fps: 30, config: {damping: d, stiffness: s}});
export const ini: number[] = T.ini;
export const AD2_DUR: number = T.total;

const Fontes = () => (
  <style>{`
  @font-face{font-family:Inter;font-weight:600;src:url(${staticFile('fonts/inter-600.woff2')})}
  @font-face{font-family:Inter;font-weight:800;src:url(${staticFile('fonts/inter-800.woff2')})}
  @font-face{font-family:Inter;font-weight:900;src:url(${staticFile('fonts/inter-900.woff2')})}`}</style>
);

const BlurTxt: React.FC<{t: string; f0: number; size: number; cor?: string; peso?: number; passo?: number; it?: boolean}> = ({t, f0, size, cor = TINTA, peso = 800, passo = 1.2, it}) => {
  const f = useCurrentFrame();
  return (
    <div style={{fontFamily: F, fontWeight: peso, fontSize: size, color: cor, letterSpacing: '-0.05em', whiteSpace: 'nowrap', lineHeight: 0.95, fontStyle: it ? 'italic' : 'normal'}}>
      {t.split('').map((c, i) => {
        const p = lin(f, f0 + i * passo, f0 + i * passo + 12, 0, 1);
        return <span key={i} style={{display: 'inline-block', opacity: p, filter: `blur(${(1 - p) * 16}px)`, transform: `translateY(${(1 - p) * 50}px)`}}>{c === ' ' ? ' ' : c}</span>;
      })}
    </div>
  );
};

const Detalhes: React.FC<{f: number; cor?: string; tag: string}> = ({f, cor = TINTA, tag}) => {
  const o = lin(f, 0, 12, 0, 1);
  const barras = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 4, 1, 2];
  return (
    <AbsoluteFill style={{opacity: o, fontFamily: F, fontWeight: 600, color: cor, fontSize: 22, letterSpacing: '0.08em'}}>
      <div style={{position: 'absolute', top: 120, left: 60, lineHeight: 1.4}}>ANIMADOR DE BOLSO<br /><span style={{opacity: .55}}>{tag}</span></div>
      <div style={{position: 'absolute', top: 120, right: 60, textAlign: 'right', lineHeight: 1.4, opacity: .7}}>FEITO NO<br />CELULAR</div>
      <div style={{position: 'absolute', bottom: 300, left: 60, display: 'flex', gap: 3, height: 60}}>
        {barras.map((w, i) => <div key={i} style={{width: w * 3, background: cor}} />)}
      </div>
      <div style={{position: 'absolute', bottom: 300, right: 60, opacity: .6}}>@OCORREDOBIEL</div>
      <div style={{position: 'absolute', top: 210, left: 60, right: 60, height: 2, background: cor, opacity: .25, transform: `scaleX(${lin(f, 0, 20, 0, 1)})`, transformOrigin: 'left'}} />
    </AbsoluteFill>
  );
};

const Circulo: React.FC<{f: number; size: number; x: number; y: number; cor?: string}> = ({f, size, x, y, cor = VERM}) => {
  const s = sp(f, 14, 90);
  return <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%', background: cor, transform: `scale(${s})`}} />;
};

const Letreiro: React.FC<{f: number; t: string; top: number; cor?: string; vel?: number}> = ({f, t, top, cor = 'rgba(14,14,14,.09)', vel = 9}) => (
  <div style={{position: 'absolute', top, left: 0, whiteSpace: 'nowrap', fontFamily: F, fontWeight: 900, fontSize: 420, letterSpacing: '-0.06em', color: cor, transform: `translateX(${200 - f * vel}px)`}}>{`${t} ${t} ${t}`}</div>
);

const Celular: React.FC<{children: React.ReactNode; rx: number; ry: number; rz?: number; s: number; x?: number; y?: number}> = ({children, rx, ry, rz = 0, s, x = 0, y = 0}) => (
  <div style={{position: 'absolute', left: '50%', top: '50%', width: 640, height: 1380, marginLeft: -320, marginTop: -690, perspective: 2400}}>
    <div style={{width: '100%', height: '100%', transform: `translate(${x}px,${y}px) scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`, transformStyle: 'preserve-3d'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 100, background: 'linear-gradient(135deg,#444,#0b0b0b 40%,#2c2c2c)', boxShadow: '0 70px 140px rgba(0,0,0,.45), 0 0 0 3px #666 inset'}} />
      <div style={{position: 'absolute', inset: 18, borderRadius: 84, overflow: 'hidden', background: '#000'}}>
        {children}
        <AbsoluteFill style={{background: `linear-gradient(${110 + ry * 2}deg, rgba(255,255,255,.16), transparent 35%, transparent 75%, rgba(255,255,255,.05))`}} />
      </div>
    </div>
  </div>
);

const Obj: React.FC<{src: string; f: number; size: number; x: number; y: number; rot?: number}> = ({src, f, size, x, y, rot = 0}) => {
  const s = sp(f, 11, 140);
  const flut = Math.sin(f / 14) * 10;
  return (
    <Img src={staticFile(src)} style={{position: 'absolute', left: x - size / 2, top: y - size / 2 + flut, width: size, height: size, objectFit: 'contain', mixBlendMode: 'multiply', filter: 'contrast(1.15) grayscale(1)', transform: `scale(${s}) rotate(${rot + (1 - s) * -25}deg)`}} />
  );
};

const Notif: React.FC<{f: number; y: number; ha: string}> = ({f, y, ha}) => {
  const s = sp(f, 13, 170);
  const v = Math.min(1, Math.max(0, s));
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: y, transform: `translateY(${(1 - s) * -260}px) scale(${0.85 + 0.15 * s}) rotateX(${(1 - s) * 50}deg)`, opacity: Math.min(1, v * 1.5), filter: `blur(${(1 - v) * 10}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 26, padding: '28px 30px', borderRadius: 44, background: 'rgba(58,52,46,.82)', boxShadow: '0 20px 50px rgba(0,0,0,.35)', fontFamily: F, color: '#fff'}}>
        <Img src={staticFile('ad/kiwi_icon.png')} style={{width: 96, height: 96, borderRadius: 24}} />
        <div style={{flex: 1}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span style={{fontWeight: 800, fontSize: 38}}>Venda aprovada no Pix!</span>
            <span style={{fontWeight: 600, fontSize: 30, opacity: .6}}>{ha}</span>
          </div>
          <div style={{fontWeight: 600, fontSize: 36, opacity: .9, marginTop: 4}}>Sua comissão: R$ 17,41</div>
        </div>
      </div>
    </div>
  );
};

export const AdV2: React.FC = () => {
  const f = useCurrentFrame();
  const [a, b, c, d, e, g] = ini;
  const fim = AD2_DUR;
  const corte = (x: number) => lin(f, x - 4, x + 2, 0, 1) * (1 - lin(f, x + 2, x + 8, 0, 1));
  const c1 = f - a;
  const v1 = Math.round(lin(c1, 8, 50, 0, 16900, Easing.out(Easing.cubic)));
  const hs = ['há 36m', 'há 27m', 'há 19m', 'há 11m', 'há 6m', 'há 2m', 'agora'];
  const plims = hs.map((_, i) => e + 6 + i * 7);

  return (
    <AbsoluteFill style={{background: PAPEL}}>
      <Fontes />
      <Audio src={staticFile('ad/beat.wav')} volume={0.22} />
      <Audio src={staticFile('ad/narracao.wav')} volume={1} />
      {[b, c, d, e, g].map((x) => <Sequence key={x} from={x - 6}><Audio src={staticFile('biel/sfx_whoosh.wav')} volume={0.4} /></Sequence>)}
      {plims.map((x) => <Sequence key={x} from={x}><Audio src={staticFile('ad/plim.wav')} volume={0.5} /></Sequence>)}
      {[c + 4, c + 20, c + 40, c + 56].map((x) => <Sequence key={x} from={x}><Audio src={staticFile('biel/pop.wav')} volume={0.45} /></Sequence>)}
      <Sequence from={g + 4}><Audio src={staticFile('ad/hit.wav')} volume={0.5} /></Sequence>
      <Sequence from={e + 77}><Audio src={staticFile('ad/hit.wav')} volume={0.4} /></Sequence>
      <Sequence from={fim - 40}><Audio src={staticFile('biel/pop.wav')} volume={0.7} /></Sequence>

      {f < b && (
        <AbsoluteFill>
          <Letreiro f={c1} t="16,9 MIL" top={560} cor="rgba(14,14,14,.1)" vel={7} />
          <Circulo f={c1 - 2} size={820} x={540} y={900} />
          <Detalhes f={c1} tag="EP. 01 — O ÁUDIO ERRADO" />
          <Celular rx={lin(c1, 0, 30, 30, 6) + Math.sin(f / 25) * 2} ry={lin(c1, 0, 30, -40, -16) + Math.sin(f / 33) * 4} rz={2} s={lin(c1, 0, 30, 0.5, 0.6)} y={lin(c1, 0, 30, 500, -60)}>
            <OffthreadVideo src={staticFile('ad/rec_audio.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </Celular>
          <div style={{position: 'absolute', bottom: 380, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${1 + 0.06 * (1 - sp(c1 - 50, 8, 200))})`}}>
            <div style={{fontFamily: F, fontWeight: 900, fontSize: 170, color: TINTA, letterSpacing: '-0.06em'}}>{v1.toLocaleString('pt-BR')}</div>
            <div style={{fontFamily: F, fontWeight: 800, fontSize: 44, color: '#fff', background: TINTA, padding: '8px 22px', marginTop: 6}}>VISUALIZAÇÕES</div>
          </div>
        </AbsoluteFill>
      )}

      {f >= b && f < c && (
        <AbsoluteFill>
          <Letreiro f={f - b} t="CELULAR" top={1250} cor="rgba(229,50,31,.14)" vel={11} />
          <Circulo f={f - b} size={620} x={540} y={830} cor="#cfccc5" />
          <Obj src="ad/ad_celular.png" f={f - b - 4} size={900} x={540} y={850} rot={-12} />
          <Detalhes f={f - b} tag="SEM COMPUTADOR" />
          <div style={{position: 'absolute', top: 300, width: '100%', display: 'flex', justifyContent: 'center'}}>
            <BlurTxt t="feito inteiro" f0={b + 2} size={74} peso={600} it />
          </div>
          <div style={{position: 'absolute', bottom: 420, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <BlurTxt t="no celular." f0={b + 18} size={180} peso={900} />
            <div style={{marginTop: 26, fontFamily: F, fontWeight: 800, fontSize: 40, color: '#fff', background: VERM, padding: '10px 26px', borderRadius: 40, transform: `scale(${sp(f - b - 32)})`}}>
              <span style={{textDecoration: 'line-through', textDecorationThickness: 5}}>computador</span> ✕
            </div>
          </div>
        </AbsoluteFill>
      )}

      {f >= c && f < d && (
        <AbsoluteFill>
          <Detalhes f={f - c} tag="O MÉTODO" />
          <svg width={1080} height={1920} style={{position: 'absolute'}}>
            {[[300, 600, 780, 600], [300, 600, 300, 1140], [780, 600, 780, 1140], [300, 1140, 780, 1140]].map(([x1, y1, x2, y2], i) => {
              const p = lin(f - c, 8 + i * 8, 28 + i * 8, 0, 1);
              return <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={TINTA} strokeWidth={3} strokeDasharray="10 10" opacity={.5} />;
            })}
          </svg>
          {[
            {src: 'ad/ad_lapis.png', t: 'Roteiro', x: 300, y: 600, k: 4},
            {src: 'biel/avatar_biel.jpg', t: 'Personagem', x: 780, y: 600, k: 20, sticker: true},
            {src: 'ad/ad_microfone.png', t: 'Voz', x: 300, y: 1140, k: 40},
            {src: 'ad/ad_claquete.png', t: 'Edição', x: 780, y: 1140, k: 56},
          ].map((o) => {
            const s = sp(f - c - o.k, 11, 150);
            return (
              <React.Fragment key={o.t}>
                <Circulo f={f - c - o.k + 2} size={300} x={o.x} y={o.y} cor={o.t === 'Personagem' ? VERM : '#d3d0c9'} />
                {o.sticker
                  ? <Img src={staticFile(o.src)} style={{position: 'absolute', left: o.x - 125, top: o.y - 125, width: 250, height: 250, borderRadius: '50%', border: '10px solid #fff', objectFit: 'cover', transform: `scale(${s}) rotate(${(1 - s) * 30 - 6}deg)`, boxShadow: '0 20px 40px rgba(0,0,0,.25)'}} />
                  : <Obj src={o.src} f={f - c - o.k} size={380} x={o.x} y={o.y} rot={-8} />}
                <div style={{position: 'absolute', left: o.x - 220, width: 440, top: o.y + 180, textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: 64, letterSpacing: '-0.04em', color: TINTA, opacity: Math.min(1, s), transform: `translateY(${(1 - s) * 30}px)`}}>{o.t}</div>
              </React.Fragment>
            );
          })}
          <div style={{position: 'absolute', bottom: 360, width: '100%', display: 'flex', justifyContent: 'center'}}>
            {f >= c + 98 && <div style={{fontFamily: F, fontWeight: 900, fontSize: 110, color: '#fff', background: TINTA, padding: '6px 40px', letterSpacing: '-0.05em', transform: `scale(${sp(f - c - 98, 9, 200)}) rotate(-2deg)`}}>TUDO COM IA</div>}
          </div>
        </AbsoluteFill>
      )}

      {f >= d && f < e && (
        <AbsoluteFill style={{background: TINTA}}>
          <Letreiro f={f - d} t="EXPLODINDO" top={200} cor="rgba(255,255,255,.07)" vel={14} />
          <Letreiro f={f - d} t="VIRAL" top={1320} cor="rgba(229,50,31,.3)" vel={-12} />
          <Celular rx={8} ry={lin(f - d, 0, 25, 30, 12) + Math.sin(f / 30) * 4} rz={-3} s={lin(f - d, 0, 25, 0.5, 0.62)} y={-30}>
            <Sequence from={d}><OffthreadVideo src={staticFile('ad/rec_amigos.mp4')} muted playbackRate={2} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
          </Celular>
          {[{t: '♥ 102 mil', x: 70, y: 520, k: 14}, {t: '↗ 77,6 mil', x: 640, y: 800, k: 26}, {t: '💬 1.982', x: 100, y: 1130, k: 38}].map((o) => (
            <div key={o.t} style={{position: 'absolute', left: o.x, top: o.y, fontFamily: F, fontWeight: 900, fontSize: 52, color: TINTA, background: '#fff', padding: '16px 30px', borderRadius: 60, boxShadow: '0 20px 40px rgba(0,0,0,.4)', transform: `scale(${sp(f - d - o.k, 10, 180)}) translateY(${Math.sin((f + o.k) / 12) * 8}px)`}}>{o.t}</div>
          ))}
          <div style={{position: 'absolute', bottom: 330, width: '100%', display: 'flex', justifyContent: 'center'}}>
            <BlurTxt t="perfis de animação" f0={d + 4} size={76} cor="#fff" />
          </div>
        </AbsoluteFill>
      )}

      {f >= e && f < g && (
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #3b2a14, #0b0805 70%)'}}>
          <div style={{position: 'absolute', top: 150, width: '100%', display: 'flex', justifyContent: 'center'}}>
            <BlurTxt t="renda extra" f0={e + 2} size={130} cor={OURO} peso={900} />
          </div>
          <div style={{position: 'absolute', top: 330, left: 0, right: 0, perspective: 1600}}>
            {hs.map((h, i) => <Notif key={i} f={f - plims[i]} y={(hs.length - 1 - i) * 150} ha={h} />)}
          </div>
          {f >= e + 77 && (
            <div style={{position: 'absolute', bottom: 260, width: '100%', textAlign: 'center', fontFamily: F, color: '#fff', transform: `scale(${sp(f - e - 77, 9, 200)})`}}>
              <div style={{fontWeight: 900, fontSize: 200, letterSpacing: '-0.06em'}}>+40</div>
              <div style={{fontWeight: 800, fontSize: 52, color: OURO, marginTop: -10}}>vendas nesse nicho</div>
            </div>
          )}
        </AbsoluteFill>
      )}

      {f >= g && (
        <AbsoluteFill>
          <Letreiro f={f - g} t="ANIMADOR" top={1360} cor="rgba(14,14,14,.08)" vel={8} />
          <Circulo f={f - g} size={760} x={540} y={720} />
          <Obj src="ad/ad_rolo.png" f={f - g - 8} size={620} x={540} y={720} rot={10} />
          <Detalhes f={f - g} tag="PASSO A PASSO" />
          <div style={{position: 'absolute', top: 1110, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <BlurTxt t="Animador" f0={g + 4} size={160} peso={900} />
            <BlurTxt t="de Bolso" f0={g + 14} size={160} peso={900} cor={VERM} />
            <div style={{marginTop: 50, position: 'relative', transform: `scale(${sp(f - g - 30, 11) * (f > fim - 40 && f < fim - 34 ? 0.94 : 1)})`}}>
              <div style={{padding: '30px 70px', borderRadius: 70, background: TINTA, fontFamily: F, fontWeight: 900, fontSize: 56, color: '#fff'}}>Quero por R$ 19,90</div>
              <div style={{position: 'absolute', right: -30, bottom: -110, fontSize: 120, opacity: lin(f, fim - 55, fim - 42, 0, 1), transform: `translate(${lin(f, fim - 55, fim - 40, 120, 0)}px,${lin(f, fim - 55, fim - 40, 160, 0)}px)`}}>👆</div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {[b, c, d, e, g].map((x) => <AbsoluteFill key={x} style={{background: '#fff', opacity: corte(x) * 0.8}} />)}
    </AbsoluteFill>
  );
};
