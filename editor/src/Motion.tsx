import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

// Criativo de teste "Animador de Bolso" — motion design 2D (texto com blur, UI animada, celular 3D)
export const AD_DUR = 450;
const F = 'Inter, sans-serif';
const OURO = '#f5b94a';
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lin = (f: number, a: number, b: number, x: number, y: number, e = ease) => interpolate(f, [a, b], [x, y], {...cl, easing: e});

const Fontes = () => (
  <style>{`
  @font-face{font-family:Inter;font-weight:600;src:url(${staticFile('fonts/inter-600.woff2')})}
  @font-face{font-family:Inter;font-weight:800;src:url(${staticFile('fonts/inter-800.woff2')})}
  @font-face{font-family:Inter;font-weight:900;src:url(${staticFile('fonts/inter-900.woff2')})}`}</style>
);

const BlurTxt: React.FC<{t: string; ini: number; size: number; cor?: string; peso?: number; passo?: number}> = ({t, ini, size, cor = '#111', peso = 800, passo = 1.4}) => {
  const f = useCurrentFrame();
  return (
    <div style={{fontFamily: F, fontWeight: peso, fontSize: size, color: cor, letterSpacing: '-0.04em', whiteSpace: 'nowrap', lineHeight: 1.05}}>
      {t.split('').map((c, i) => {
        const p = lin(f, ini + i * passo, ini + i * passo + 14, 0, 1);
        return (
          <span key={i} style={{display: 'inline-block', opacity: p, filter: `blur(${(1 - p) * 18}px)`, transform: `translateY(${(1 - p) * 40}px) scale(${0.8 + 0.2 * p})`}}>
            {c === ' ' ? ' ' : c}
          </span>
        );
      })}
    </div>
  );
};

const saida = (f: number, ini: number, dur = 10) => {
  const p = lin(f, ini, ini + dur, 0, 1, Easing.in(Easing.cubic));
  return {opacity: 1 - p, filter: `blur(${p * 30}px)`, transform: `scale(${1 + p * 0.35})`};
};

const FundoOuro: React.FC = () => {
  const f = useCurrentFrame();
  const x = 50 + Math.sin(f / 40) * 18, y = 35 + Math.cos(f / 55) * 12;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at ${x}% ${y}%, #6b4410 0%, #2a1a07 45%, #0b0703 100%)`}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 30% at ${100 - x}% ${80 - y / 3}%, rgba(245,185,74,.28), transparent 70%)`, filter: 'blur(40px)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.6))'}} />
    </AbsoluteFill>
  );
};

const TelaEditor: React.FC<{f: number}> = ({f}) => {
  const clips = [{c: '#ff4d6d', w: 150, d: 6}, {c: '#ffd21f', w: 120, d: 14}, {c: '#3ccf6e', w: 170, d: 22}, {c: '#4d7cff', w: 110, d: 30}];
  const play = lin(f, 20, 90, 20, 520, Easing.linear);
  return (
    <AbsoluteFill style={{background: '#111'}}>
      <div style={{position: 'absolute', top: 90, left: 30, right: 30, height: 560, borderRadius: 24, overflow: 'hidden'}}>
        <Img src={staticFile('biel/au_c4a.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.05 + f * 0.002})`}} />
        <div style={{position: 'absolute', bottom: 28, width: '100%', textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: 38, color: '#fff', WebkitTextStroke: '2px #000', opacity: lin(f, 40, 48, 0, 1)}}>MANDEI NO GRUPO ERRADO</div>
      </div>
      <div style={{position: 'absolute', top: 700, left: 20, right: 20}}>
        {[0, 1, 2].map((r) => (
          <div key={r} style={{height: 54, marginBottom: 16, borderRadius: 10, background: '#1d1d1d', position: 'relative', overflow: 'hidden'}}>
            {clips.map((k, i) => {
              const p = lin(f, k.d + r * 5, k.d + r * 5 + 12, 0, 1);
              const left = clips.slice(0, i).reduce((s, q) => s + q.w + 6, 6);
              return <div key={i} style={{position: 'absolute', top: 6, bottom: 6, left: left + (1 - p) * 300, width: k.w * (r === 1 ? 0.8 : 1), borderRadius: 8, background: r === 2 ? '#5b5b5b' : k.c, opacity: p, filter: `blur(${(1 - p) * 8}px)`}} />;
            })}
          </div>
        ))}
        <div style={{position: 'absolute', top: -10, bottom: 0, left: play, width: 4, background: '#fff', borderRadius: 2, boxShadow: '0 0 12px #fff'}} />
      </div>
      <div style={{position: 'absolute', bottom: 80, width: '100%', display: 'flex', justifyContent: 'space-around', fontFamily: F, fontWeight: 600, fontSize: 24}}>
        {['Áudio', 'Texto', 'Efeitos', 'Legendas'].map((t, i) => <span key={t} style={{color: i === 3 && f > 45 ? OURO : '#aaa'}}>{t}</span>)}
      </div>
    </AbsoluteFill>
  );
};

const TelaPost: React.FC<{f: number}> = ({f}) => {
  const v = Math.round(lin(f, 4, 60, 0, 13116, Easing.out(Easing.cubic)));
  const c = Math.round(lin(f, 12, 62, 0, 715, Easing.out(Easing.cubic)));
  const cor = spring({frame: f - 30, fps: 30, config: {damping: 9}});
  return (
    <AbsoluteFill>
      <Img src={staticFile('biel/au_c7b.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.1 - f * 0.0015})`}} />
      <AbsoluteFill style={{background: 'linear-gradient(transparent 55%, rgba(0,0,0,.85))'}} />
      <div style={{position: 'absolute', right: 26, bottom: 330, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, fontFamily: F, fontWeight: 800, color: '#fff', fontSize: 26}}>
        <div style={{transform: `scale(${0.8 + cor * 0.45})`, fontSize: 64, color: '#ff3b5c'}}>♥</div>
        <div style={{textAlign: 'center'}}>💬<br />{c}</div>
      </div>
      <div style={{position: 'absolute', left: 30, bottom: 150, fontFamily: F, color: '#fff'}}>
        <div style={{fontWeight: 800, fontSize: 30}}>@ocorredobiel</div>
        <div style={{fontWeight: 900, fontSize: 92, letterSpacing: '-0.04em', marginTop: 6}}>{v.toLocaleString('pt-BR')}</div>
        <div style={{fontWeight: 600, fontSize: 30, color: '#ddd'}}>visualizações</div>
      </div>
    </AbsoluteFill>
  );
};

const Celular: React.FC<{children: React.ReactNode; rx: number; ry: number; s: number; y: number}> = ({children, rx, ry, s, y}) => (
  <div style={{position: 'absolute', left: '50%', top: '50%', width: 700, height: 1420, marginLeft: -350, marginTop: -710, perspective: 2200}}>
    <div style={{width: '100%', height: '100%', transform: `translateY(${y}px) scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg)`, transformStyle: 'preserve-3d'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 110, background: 'linear-gradient(135deg,#3a3a3c,#0d0d0e 40%,#2b2b2d)', boxShadow: '0 80px 160px rgba(0,0,0,.7), 0 0 0 3px #555 inset, 0 0 90px rgba(245,185,74,.25)'}} />
      <div style={{position: 'absolute', inset: 22, borderRadius: 90, overflow: 'hidden', background: '#000'}}>
        {children}
        <div style={{position: 'absolute', top: 22, left: '50%', marginLeft: -95, width: 190, height: 52, borderRadius: 30, background: '#000'}} />
        <AbsoluteFill style={{background: `linear-gradient(${115 + ry * 2}deg, rgba(255,255,255,.18) 0%, transparent 35%, transparent 70%, rgba(255,255,255,.06))`}} />
      </div>
    </div>
  </div>
);

const Toggle: React.FC<{t: string; ini: number}> = ({t, ini}) => {
  const f = useCurrentFrame();
  const ent = lin(f, ini, ini + 14, 0, 1);
  const on = spring({frame: f - ini - 10, fps: 30, config: {damping: 14, stiffness: 180}});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 34, opacity: ent, filter: `blur(${(1 - ent) * 14}px)`, transform: `translateX(${(1 - ent) * -80}px)`, marginBottom: 46}}>
      <div style={{width: 150, height: 84, borderRadius: 50, background: on > 0.5 ? '#34c759' : '#d9d9de', position: 'relative'}}>
        <div style={{position: 'absolute', top: 7, left: 7 + on * 66, width: 70, height: 70, borderRadius: 40, background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,.18)'}} />
      </div>
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 64, color: '#111', letterSpacing: '-0.03em'}}>{t}</div>
    </div>
  );
};

export const AdTeste: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ent = spring({frame: f - 58, fps, config: {damping: 16, stiffness: 70}});
  const rx = interpolate(ent, [0, 1], [55, 8]) + Math.sin(f / 30) * 2;
  const ry = interpolate(ent, [0, 1], [-35, -14]) + Math.sin(f / 45) * 6 + lin(f, 150, 170, 0, 14);
  const ys = interpolate(ent, [0, 1], [1400, 120]);
  const ss = lin(f, 150, 240, 0.78, 0.86, Easing.inOut(Easing.cubic));
  const telaTroca = lin(f, 148, 158, 0, 1);
  const flash = lin(f, 148, 152, 0, 1) * (1 - lin(f, 152, 164, 0, 1));
  const shake = f > 150 && f < 160 ? Math.sin(f * 9) * (160 - f) * 1.2 : 0;
  const clique = spring({frame: f - 405, fps, config: {damping: 10}});
  const mao = lin(f, 392, 405, 0, 1);
  const sB = f > 235 ? saida(f, 235) : {opacity: 1, filter: 'none', transform: ''};

  return (
    <AbsoluteFill style={{background: '#f2f2f4'}}>
      <Fontes />
      <Audio src={staticFile('biel/musica_px.wav')} volume={0.22} />
      {[0, 52, 148, 238, 330].map((s) => <Sequence key={s} from={s}><Audio src={staticFile('biel/sfx_whoosh.wav')} volume={0.45} /></Sequence>)}
      <Sequence from={38}><Audio src={staticFile('biel/tique.wav')} volume={0.5} /></Sequence>
      {[258, 274, 290, 306].map((s) => <Sequence key={s} from={s}><Audio src={staticFile('biel/pop.wav')} volume={0.55} /></Sequence>)}
      {[160, 178].map((s) => <Sequence key={s} from={s}><Audio src={staticFile('biel/noti.wav')} volume={0.5} /></Sequence>)}
      <Sequence from={136}><Audio src={staticFile('biel/sfx_riser.wav')} volume={0.35} /></Sequence>
      <Sequence from={340}><Audio src={staticFile('biel/boom.wav')} volume={0.5} /></Sequence>
      <Sequence from={405}><Audio src={staticFile('biel/pop.wav')} volume={0.7} /></Sequence>

      {f < 62 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', ...saida(f, 50)}}>
          <BlurTxt t="Você não precisa" ini={2} size={104} />
          <div style={{position: 'relative', marginTop: 10}}>
            <BlurTxt t="de computador" ini={16} size={120} peso={900} />
            <div style={{position: 'absolute', top: '54%', left: -10, height: 14, borderRadius: 8, background: '#ff3b30', width: `${lin(f, 36, 46, 0, 106)}%`, boxShadow: '0 0 20px rgba(255,59,48,.5)'}} />
          </div>
        </AbsoluteFill>
      )}

      {f >= 52 && f < 245 && (
        <AbsoluteFill style={{opacity: sB.opacity, filter: sB.filter, transform: `${sB.transform} translateX(${shake}px)`}}>
          <FundoOuro />
          <div style={{position: 'absolute', top: 150, width: '100%', display: 'flex', justifyContent: 'center'}}>
            {f < 148 ? <BlurTxt t="Só com o celular" ini={64} size={96} cor="#fff" /> : f >= 158 ? <BlurTxt t="E viraliza." ini={160} size={110} cor={OURO} peso={900} /> : null}
          </div>
          <Celular rx={rx} ry={ry} s={ss} y={ys}>
            <AbsoluteFill style={{opacity: 1 - telaTroca}}><TelaEditor f={f - 60} /></AbsoluteFill>
            <AbsoluteFill style={{opacity: telaTroca, filter: `blur(${(1 - telaTroca) * 20}px)`}}><TelaPost f={f - 150} /></AbsoluteFill>
          </Celular>
          {f > 190 && (
            <div style={{position: 'absolute', bottom: 170, width: '100%', textAlign: 'center', fontFamily: F, fontWeight: 800, fontSize: 46, color: '#fff', opacity: lin(f, 190, 202, 0, 1), filter: `blur(${(1 - lin(f, 190, 202, 0, 1)) * 12}px)`}}>
              <span style={{color: OURO}}>715 comentários</span> em um episódio
            </div>
          )}
          <AbsoluteFill style={{background: '#fff', opacity: flash}} />
        </AbsoluteFill>
      )}

      {f >= 238 && f < 340 && (
        <AbsoluteFill style={{background: '#f2f2f4', padding: '0 110px', justifyContent: 'center', ...(f > 328 ? saida(f, 328) : {})}}>
          <div style={{marginBottom: 80}}><BlurTxt t="Tudo no celular:" ini={240} size={92} peso={900} /></div>
          <Toggle t="Roteiro com IA" ini={250} />
          <Toggle t="Personagem fixo" ini={266} />
          <Toggle t="Narração" ini={282} />
          <Toggle t="Efeitos sonoros" ini={298} />
        </AbsoluteFill>
      )}

      {f >= 330 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <FundoOuro />
          <div style={{transform: `scale(${lin(f, 332, 450, 1.08, 1, Easing.out(Easing.quad))})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <BlurTxt t="Animador" ini={334} size={150} cor="#fff" peso={900} passo={1.8} />
            <BlurTxt t="de Bolso" ini={346} size={150} cor={OURO} peso={900} passo={1.8} />
            <div style={{marginTop: 40, opacity: lin(f, 362, 376, 0, 1), filter: `blur(${(1 - lin(f, 362, 376, 0, 1)) * 12}px)`, fontFamily: F, fontWeight: 600, fontSize: 46, color: '#e9dcc4', textAlign: 'center', lineHeight: 1.3}}>
              Séries animadas que viralizam,<br />feitas do zero no seu celular
            </div>
            <div style={{marginTop: 70, position: 'relative', transform: `scale(${spring({frame: f - 378, fps, config: {damping: 11}}) * (1 - clique * 0.05 + Math.max(0, clique - 1) * 0.05)})`}}>
              <div style={{padding: '34px 80px', borderRadius: 70, background: `linear-gradient(180deg,#ffd27a,${OURO})`, fontFamily: F, fontWeight: 900, fontSize: 56, color: '#2a1a07', boxShadow: '0 20px 60px rgba(245,185,74,.45)'}}>Quero por R$ 19,90</div>
              <div style={{position: 'absolute', right: -40, bottom: -110, fontSize: 130, opacity: mao, transform: `translate(${(1 - mao) * 120}px, ${(1 - mao) * 160}px) scale(${1 - clique * 0.1 + Math.max(0, clique - 1) * 0.1})`}}>👆</div>
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
