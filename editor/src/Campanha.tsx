import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing} from 'remotion';
import TT from './campanha_tempos.json';

// Campanha "Animador de Bolso": criativos com uma dor e um estilo cada
type Tempo = {ini: number[]; total: number};
export const TEMPOS = TT as Record<string, Tempo>;
const F = 'Inter, sans-serif';
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lin = (f: number, a: number, b: number, x: number, y: number, e = ease) => interpolate(f, [a, b], [x, y], {...cl, easing: e});
const sp = (f: number, d = 12, s = 120) => spring({frame: f, fps: 30, config: {damping: d, stiffness: s}});
const S = (src: string) => staticFile(src);

const Fontes = () => (
  <style>{`
  @font-face{font-family:Inter;font-weight:600;src:url(${S('fonts/inter-600.woff2')})}
  @font-face{font-family:Inter;font-weight:800;src:url(${S('fonts/inter-800.woff2')})}
  @font-face{font-family:Inter;font-weight:900;src:url(${S('fonts/inter-900.woff2')})}
  @font-face{font-family:Anton;src:url(${S('fonts/anton.woff2')})}`}</style>
);

const Txt: React.FC<{t: string; f0: number; size: number; cor?: string; peso?: number; passo?: number; it?: boolean}> = ({t, f0, size, cor = '#111', peso = 900, passo = 1.1, it}) => {
  const f = useCurrentFrame();
  return (
    <div style={{fontFamily: F, fontWeight: peso, fontSize: size, color: cor, letterSpacing: '-0.05em', whiteSpace: 'nowrap', lineHeight: 0.98, fontStyle: it ? 'italic' : 'normal'}}>
      {t.split('').map((c, i) => {
        const p = lin(f, f0 + i * passo, f0 + i * passo + 12, 0, 1);
        return <span key={i} style={{display: 'inline-block', opacity: p, filter: `blur(${(1 - p) * 16}px)`, transform: `translateY(${(1 - p) * 50}px)`}}>{c === ' ' ? ' ' : c}</span>;
      })}
    </div>
  );
};

const Centro: React.FC<{top: number; children: React.ReactNode}> = ({top, children}) => (
  <div style={{position: 'absolute', top, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>{children}</div>
);

const Obj: React.FC<{src: string; f: number; size: number; x: number; y: number; rot?: number; sombra?: boolean}> = ({src, f, size, x, y, rot = 0, sombra = true}) => {
  const s = sp(f, 11, 140);
  return (
    <Img src={S(src)} style={{position: 'absolute', left: x - size / 2, top: y - size / 2 + Math.sin(f / 14) * 10, width: size, height: size, objectFit: 'contain', filter: sombra ? 'drop-shadow(0 30px 40px rgba(0,0,0,.35))' : 'none', transform: `scale(${s}) rotate(${rot + (1 - s) * -25}deg)`}} />
  );
};

const Celular: React.FC<{children: React.ReactNode; rx: number; ry: number; rz?: number; s: number; x?: number; y?: number; brilho?: string}> = ({children, rx, ry, rz = 0, s, x = 0, y = 0, brilho = 'rgba(0,0,0,0)'}) => (
  <div style={{position: 'absolute', left: '50%', top: '50%', width: 640, height: 1380, marginLeft: -320, marginTop: -690, perspective: 2400}}>
    <div style={{width: '100%', height: '100%', transform: `translate(${x}px,${y}px) scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`, transformStyle: 'preserve-3d'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 100, background: 'linear-gradient(135deg,#444,#0b0b0b 40%,#2c2c2c)', boxShadow: `0 70px 140px rgba(0,0,0,.5), 0 0 0 3px #666 inset, 0 0 120px ${brilho}`}} />
      <div style={{position: 'absolute', inset: 18, borderRadius: 84, overflow: 'hidden', background: '#000'}}>
        {children}
        <AbsoluteFill style={{background: `linear-gradient(${110 + ry * 2}deg, rgba(255,255,255,.16), transparent 35%, transparent 75%, rgba(255,255,255,.05))`}} />
      </div>
    </div>
  </div>
);

const Botao: React.FC<{f: number; fim: number; fundo: string; cor: string; t?: string}> = ({f, fim, fundo, cor, t = 'Quero por R$ 19,90'}) => (
  <div style={{position: 'relative', transform: `scale(${f > fim - 40 && f < fim - 34 ? 0.93 : 1})`}}>
    <div style={{padding: '32px 74px', borderRadius: 80, background: fundo, fontFamily: F, fontWeight: 900, fontSize: 58, color: cor, boxShadow: '0 24px 60px rgba(0,0,0,.3)'}}>{t}</div>
    <div style={{position: 'absolute', right: -30, bottom: -110, fontSize: 120, opacity: lin(f, fim - 55, fim - 42, 0, 1), transform: `translate(${lin(f, fim - 55, fim - 40, 120, 0)}px,${lin(f, fim - 55, fim - 40, 160, 0)}px)`}}>👆</div>
  </div>
);

const Flash: React.FC<{f: number; cortes: number[]; cor?: string}> = ({f, cortes, cor = '#fff'}) => (
  <>{cortes.map((x) => <AbsoluteFill key={x} style={{background: cor, opacity: lin(f, x - 3, x + 1, 0, 0.75) * (1 - lin(f, x + 1, x + 7, 0, 1))}} />)}</>
);

const Sons: React.FC<{voz: string; cortes: number[]; fim: number; vol?: number}> = ({voz, cortes, fim, vol = 0.2}) => (
  <>
    <Audio src={S('ad/beat.wav')} volume={vol} />
    <Audio src={S(`ad/voz_${voz}.wav`)} />
    {cortes.map((x) => <Sequence key={x} from={Math.max(0, x - 6)}><Audio src={S('biel/sfx_whoosh.wav')} volume={0.35} /></Sequence>)}
    <Sequence from={fim - 40}><Audio src={S('biel/pop.wav')} volume={0.7} /></Sequence>
  </>
);

const Notif: React.FC<{f: number; y: number; ha: string}> = ({f, y, ha}) => {
  const s = sp(f, 13, 170); const v = Math.min(1, Math.max(0, s));
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: y, transform: `translateY(${(1 - s) * -260}px) scale(${0.85 + 0.15 * s}) rotateX(${(1 - s) * 50}deg)`, opacity: Math.min(1, v * 1.5), filter: `blur(${(1 - v) * 10}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 26, padding: '28px 30px', borderRadius: 44, background: 'rgba(58,52,46,.85)', boxShadow: '0 20px 50px rgba(0,0,0,.25)', fontFamily: F, color: '#fff'}}>
        <Img src={S('ad/kiwi_icon.png')} style={{width: 96, height: 96, borderRadius: 24}} />
        <div style={{flex: 1}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span style={{fontWeight: 800, fontSize: 38}}>Venda aprovada no Pix!</span>
            <span style={{fontWeight: 600, fontSize: 30, opacity: .55}}>{ha}</span>
          </div>
          <div style={{fontWeight: 600, fontSize: 36, opacity: .85, marginTop: 4}}>Sua comissão: R$ 17,41</div>
        </div>
      </div>
    </div>
  );
};

const Letreiro: React.FC<{f: number; t: string; top: number; cor: string; vel?: number; fam?: string}> = ({f, t, top, cor, vel = 9, fam = F}) => (
  <div style={{position: 'absolute', top, left: 0, whiteSpace: 'nowrap', fontFamily: fam, fontWeight: 900, fontSize: 420, letterSpacing: '-0.05em', color: cor, transform: `translateX(${200 - f * vel}px)`}}>{`${t} ${t} ${t} ${t}`}</div>
);

// =============== 1. PREÇO — estilo app de delivery ===============
export const CriPreco: React.FC = () => {
  const f = useCurrentFrame();
  const {ini, total} = TEMPOS.Preco; const [a, b, c, d, e, g] = ini;
  const VM = '#ea1d2c';
  const cortes = [b, c, d, e, g];
  return (
    <AbsoluteFill style={{background: '#f5f5f7'}}>
      <Fontes /><Sons voz="Preco" cortes={cortes} fim={total} />
      <Sequence from={a + 2}><Audio src={S('ad/hit.wav')} volume={0.5} /></Sequence>
      {f < b && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          {[0, 1, 2, 3].map((i) => <Obj key={i} src="ad/ad_moedas_t.png" f={f - 6 - i * 3} size={360} x={[190, 890, 230, 870][i]} y={[420, 470, 1430, 1380][i]} rot={[-12, 10, 8, -10][i]} />)}
          <div style={{transform: `scale(${lin(f, 0, 8, 2.4, 1, Easing.out(Easing.back(2)))}) rotate(${lin(f, 0, 10, -14, -4)}deg)`, opacity: lin(f, 0, 3, 0, 1)}}>
            <div style={{fontFamily: F, fontWeight: 900, fontSize: 250, color: VM, letterSpacing: '-0.06em'}}>R$ 19,90</div>
          </div>
          <div style={{marginTop: 30, fontFamily: F, fontWeight: 800, fontSize: 52, color: '#111', opacity: lin(f, 14, 24, 0, 1)}}>pagamento único</div>
        </AbsoluteFill>
      )}
      {f >= b && f < c && (
        <AbsoluteFill>
          <div style={{position: 'absolute', top: 220, left: 60, right: 60, height: 120, borderRadius: 60, background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,.08)', display: 'flex', alignItems: 'center', padding: '0 46px', fontFamily: F, fontWeight: 600, fontSize: 46, color: '#555', transform: `scale(${sp(f - b, 14, 160)})`}}>
            🔍&nbsp;&nbsp;{'lanche'.slice(0, Math.max(0, Math.floor((f - b - 4) / 2)))}<span style={{opacity: Math.floor(f / 8) % 2, color: VM}}>|</span>
          </div>
          {[{img: 'ad/ad_burger_t.png', t: 'Combo lanche + fritas', p: 'R$ 34,90', k: 14, top: 420, sub: 'acaba em 10 min', win: false}, {img: 'biel/avatar_biel.jpg', t: 'Animador de Bolso', p: 'R$ 19,90', k: 30, top: 900, sub: 'fica com você', win: true}].map((o) => {
            const s = sp(f - b - o.k, 13, 150);
            return (
              <div key={o.t} style={{position: 'absolute', top: o.top, left: 60, right: 60, height: 400, borderRadius: 50, background: '#fff', boxShadow: o.win ? `0 0 0 6px ${VM}, 0 30px 60px rgba(234,29,44,.25)` : '0 20px 40px rgba(0,0,0,.08)', display: 'flex', alignItems: 'center', gap: 40, padding: 40, transform: `translateX(${(1 - s) * 900}px)`}}>
                <Img src={S(o.img)} style={{width: 300, height: 300, objectFit: o.win ? 'cover' : 'contain', borderRadius: o.win ? 40 : 0}} />
                <div style={{fontFamily: F}}>
                  <div style={{fontWeight: 800, fontSize: 46, color: '#111', lineHeight: 1.1}}>{o.t}</div>
                  <div style={{fontWeight: 600, fontSize: 34, color: '#888', marginTop: 10}}>{o.sub}</div>
                  <div style={{fontWeight: 900, fontSize: 76, color: o.win ? VM : '#111', marginTop: 16, position: 'relative', display: 'inline-block'}}>
                    {o.p}
                    {!o.win && <div style={{position: 'absolute', left: -6, top: '50%', height: 8, background: '#111', width: `${lin(f, b + 46, b + 56, 0, 110)}%`}} />}
                  </div>
                </div>
              </div>
            );
          })}
        </AbsoluteFill>
      )}
      {f >= c && f < d && (
        <AbsoluteFill>
          <Centro top={230}><Txt t="desenhos animados" f0={c + 2} size={96} /><div style={{height: 10}} /><Txt t="com IA" f0={c + 12} size={120} cor={VM} /></Centro>
          {['biel/au_c4a.jpg', 'biel/em2_c1a.jpg', 'biel/au2_c3a.jpg'].map((src, i) => {
            const s = sp(f - c - 12 - i * 6, 13, 120);
            return <Img key={src} src={S(src)} style={{position: 'absolute', top: 640, left: 540 - 230 + (i - 1) * 340, width: 460, height: 820, objectFit: 'cover', borderRadius: 40, boxShadow: '0 30px 60px rgba(0,0,0,.3)', transform: `translateY(${(1 - s) * 900}px) rotate(${(i - 1) * 7}deg) scale(${i === 1 ? 1.08 : 0.92})`, zIndex: i === 1 ? 2 : 1}} />;
          })}
        </AbsoluteFill>
      )}
      {f >= d && f < e && (() => {
        const p = lin(f, d + 6, e - 10, 0, 1, Easing.inOut(Easing.cubic));
        const etapas = ['Roteiro', 'Personagem', 'Voz', 'Edição'];
        return (
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
            <Txt t="tudo pelo celular" f0={d + 2} size={92} />
            <div style={{marginTop: 80, width: 900, background: '#fff', borderRadius: 50, padding: '60px 44px', boxShadow: '0 20px 50px rgba(0,0,0,.1)'}}>
              <div style={{fontFamily: F, fontWeight: 800, fontSize: 44, color: '#111', marginBottom: 70}}>Seu vídeo está a caminho</div>
              <div style={{height: 22, borderRadius: 12, background: '#eee', position: 'relative'}}>
                <div style={{position: 'absolute', top: 0, bottom: 0, left: 0, width: `${p * 100}%`, borderRadius: 12, background: VM}} />
                <div style={{position: 'absolute', top: -70, left: `calc(${p * 100}% - 40px)`, fontSize: 70}}>🛵</div>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 40}}>
                {etapas.map((t, i) => <div key={t} style={{fontFamily: F, fontWeight: 800, fontSize: 34, color: p >= (i + 0.5) / 4 ? VM : '#aaa'}}>{p >= (i + 0.5) / 4 ? '✓ ' : ''}{t}</div>)}
              </div>
            </div>
          </AbsoluteFill>
        );
      })()}
      {f >= e && f < g && (() => {
        const some = lin(f, e + 50, e + 64, 1, 0, Easing.in(Easing.back(2)));
        return (
          <AbsoluteFill>
            <Centro top={200}><Txt t="o lanche acaba" f0={e + 2} size={90} cor="#999" /></Centro>
            <Centro top={360}><div style={{fontFamily: F, fontWeight: 900, fontSize: 120, color: '#111'}}>{`00:${String(Math.max(0, 10 - Math.floor((f - e) / 5))).padStart(2, '0')}`}</div></Centro>
            <Centro top={560}><div style={{transform: `scale(${some})`}}><Img src={S('ad/ad_burger_t.png')} style={{width: 620, height: 620, objectFit: 'contain'}} /></div></Centro>
            {f > e + 62 && <Centro top={1250}><Txt t="isso aqui" f0={e + 64} size={110} /><Txt t="fica com você." f0={e + 72} size={110} cor={VM} /></Centro>}
          </AbsoluteFill>
        );
      })()}
      {f >= g && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: VM}}>
          <Txt t="Animador" f0={g + 2} size={170} cor="#fff" /><Txt t="de Bolso" f0={g + 10} size={170} cor="#fff" />
          <div style={{marginTop: 30, fontFamily: F, fontWeight: 800, fontSize: 48, color: '#ffd6d9', opacity: lin(f, g + 20, g + 30, 0, 1)}}>menos que um lanche</div>
          <div style={{marginTop: 70, transform: `scale(${sp(f - g - 24, 11)})`}}><Botao f={f} fim={total} fundo="#fff" cor={VM} t="Começar por R$ 19,90" /></div>
        </AbsoluteFill>
      )}
      <Flash f={f} cortes={cortes} />
    </AbsoluteFill>
  );
};

// =============== 2. MOBILIDADE — escuro dourado ===============
const OURO = '#f5b94a';
const FundoOuro: React.FC = () => {
  const f = useCurrentFrame();
  const x = 50 + Math.sin(f / 40) * 18, y = 35 + Math.cos(f / 55) * 12;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at ${x}% ${y}%, #6b4410 0%, #2a1a07 45%, #0b0703 100%)`}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 30% at ${100 - x}% ${80 - y / 3}%, rgba(245,185,74,.28), transparent 70%)`, filter: 'blur(40px)'}} />
    </AbsoluteFill>
  );
};

export const CriMobil: React.FC = () => {
  const f = useCurrentFrame();
  const {ini, total} = TEMPOS.Mobil; const [a, b, c, d, e] = ini;
  const cortes = [b, c, d, e];
  const shake = f >= b && f < b + 10 ? Math.sin(f * 11) * (b + 10 - f) * 3 : 0;
  return (
    <AbsoluteFill>
      <FundoOuro /><Fontes /><Sons voz="Mobil" cortes={cortes} fim={total} />
      <Sequence from={b}><Audio src={S('ad/hit.wav')} volume={0.6} /></Sequence>
      {f < b && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <Txt t="precisa de um" f0={a + 2} size={84} cor="#e9dcc4" peso={800} />
          <div style={{height: 10}} />
          <Txt t="computador" f0={a + 12} size={150} cor="#fff" />
          <Txt t="caro?" f0={a + 24} size={150} cor={OURO} />
          <div style={{marginTop: 60, padding: '16px 40px', border: `5px solid ${OURO}`, borderRadius: 16, fontFamily: F, fontWeight: 900, fontSize: 64, color: OURO, transform: `rotate(-6deg) scale(${sp(f - a - 34, 9, 200)})`}}>R$ 5.000+</div>
        </AbsoluteFill>
      )}
      {f >= b && f < c && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translateX(${shake}px)`}}>
          <svg width={600} height={600} style={{position: 'absolute', opacity: 0.9}}>
            {[[80, 80, 520, 520], [520, 80, 80, 520]].map(([x1, y1, x2, y2], i) => {
              const p = lin(f - b, i * 4, i * 4 + 8, 0, 1);
              return <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke="#ff3b30" strokeWidth={46} strokeLinecap="round" />;
            })}
          </svg>
          <div style={{transform: `scale(${lin(f - b, 0, 6, 2, 1, Easing.out(Easing.back(2)))})`, fontFamily: F, fontWeight: 900, fontSize: 190, color: '#fff', letterSpacing: '-0.06em', textAlign: 'center', lineHeight: 0.95, textShadow: '0 10px 40px rgba(0,0,0,.6)'}}>NÃO<br />PRECISA.</div>
        </AbsoluteFill>
      )}
      {f >= c && f < d && (() => {
        const ent = sp(f - c, 16, 80);
        const itens = [{t: 'Personagem', k: 4, x: -330, y: -420}, {t: 'Voz', k: 30, x: 330, y: -180}, {t: 'Legenda', k: 48, x: -330, y: 160}, {t: 'Efeito', k: 72, x: 330, y: 400}];
        return (
          <AbsoluteFill>
            <Celular rx={interpolate(ent, [0, 1], [50, 8])} ry={interpolate(ent, [0, 1], [-30, -12]) + Math.sin(f / 40) * 5} s={0.72} y={interpolate(ent, [0, 1], [1200, 60])} brilho="rgba(245,185,74,.35)">
              <Img src={S('biel/au2_c2a.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.1 + (f - c) * 0.002})`}} />
            </Celular>
            {itens.map((o) => (
              <div key={o.t} style={{position: 'absolute', left: 540 + o.x - 200, top: 960 + o.y, width: 400, whiteSpace: 'nowrap', textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: 48, color: '#2a1a07', background: OURO, padding: '18px 0', borderRadius: 60, boxShadow: '0 20px 50px rgba(0,0,0,.5)', transform: `scale(${sp(f - c - o.k, 10, 180)})`}}>✓ {o.t}</div>
            ))}
          </AbsoluteFill>
        );
      })()}
      {f >= d && f < e && (
        <AbsoluteFill>
          {[{src: 'ad/ad_onibus_t.png', t: 'no ônibus', k: 2, y: 520}, {src: 'ad/ad_relogio_t.png', t: 'no intervalo', k: 34, y: 960}, {src: 'ad/ad_sofa_t.png', t: 'no sofá', k: 76, y: 1400}].map((o, i) => {
            const s = sp(f - d - o.k, 12, 140);
            return (
              <React.Fragment key={o.t}>
                <Obj src={o.src} f={f - d - o.k} size={400} x={i % 2 ? 790 : 290} y={o.y} />
                <div style={{position: 'absolute', top: o.y - 55, left: i % 2 ? 70 : 520, fontFamily: F, fontWeight: 900, fontSize: 84, color: '#fff', letterSpacing: '-0.05em', opacity: Math.min(1, s), transform: `translateX(${(1 - s) * (i % 2 ? -200 : 200)}px)`}}>{o.t}</div>
              </React.Fragment>
            );
          })}
        </AbsoluteFill>
      )}
      {f >= e && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <Txt t="Animador" f0={e + 2} size={160} cor="#fff" /><Txt t="de Bolso" f0={e + 10} size={160} cor={OURO} />
          <div style={{marginTop: 30, fontFamily: F, fontWeight: 600, fontSize: 46, color: '#e9dcc4', textAlign: 'center', opacity: lin(f, e + 20, e + 32, 0, 1)}}>o passo a passo, do zero,<br />no celular que tá na sua mão</div>
          <div style={{marginTop: 70, transform: `scale(${sp(f - e - 28, 11)})`}}><Botao f={f} fim={total} fundo={`linear-gradient(180deg,#ffd27a,${OURO})`} cor="#2a1a07" /></div>
        </AbsoluteFill>
      )}
      <Flash f={f} cortes={cortes} cor="#ffe2a8" />
    </AbsoluteFill>
  );
};

// =============== 4. RENDA — infográfico verde ===============
export const CriRenda: React.FC = () => {
  const f = useCurrentFrame();
  const {ini, total} = TEMPOS.Renda; const [a, b, c, d, e] = ini;
  const VD = '#1fbf4a';
  const cortes = [b, c, d, e];
  const hs = ['há 36m', 'há 27m', 'há 19m', 'há 11m', 'há 6m', 'há 2m', 'agora'];
  const plims = hs.map((_, i) => d + 4 + i * 6);
  const nos = [{t: 'Padaria', e: '🥐', x: 210, y: 380}, {t: 'Salão', e: '💇', x: 870, y: 380}, {t: 'Oficina', e: '🔧', x: 210, y: 1380}, {t: 'Açaí', e: '🍧', x: 870, y: 1380}];
  return (
    <AbsoluteFill style={{background: '#f7f8f7'}}>
      <Fontes /><Sons voz="Renda" cortes={cortes} fim={total} />
      {plims.map((x) => <Sequence key={x} from={x}><Audio src={S('ad/plim.wav')} volume={0.5} /></Sequence>)}
      {f < b && (
        <AbsoluteFill>
          <svg width={1080} height={1920} style={{position: 'absolute'}}>
            {nos.map((n, i) => {
              const p = lin(f, 10 + i * 5, 26 + i * 5, 0, 1);
              return <line key={i} x1={540} y1={880} x2={540 + (n.x - 540) * p} y2={880 + (n.y - 880) * p} stroke={VD} strokeWidth={4} strokeDasharray="12 10" />;
            })}
          </svg>
          <Obj src="ad/ad_loja_t.png" f={f - 2} size={560} x={540} y={880} />
          {nos.map((n, i) => (
            <div key={n.t} style={{position: 'absolute', left: n.x - 110, top: n.y - 110, width: 220, height: 220, transform: `scale(${sp(f - 18 - i * 5, 11, 160)})`}}>
              <svg width={220} height={220} style={{position: 'absolute'}}><polygon points="110,4 204,57 204,163 110,216 16,163 16,57" fill={VD} /></svg>
              <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 90}}>{n.e}</div>
              <div style={{position: 'absolute', top: 228, width: '100%', textAlign: 'center', fontFamily: F, fontWeight: 800, fontSize: 40, color: '#111'}}>{n.t}</div>
            </div>
          ))}
          <Centro top={1680}><Txt t="todas precisam de vídeo" f0={a + 4} size={70} /></Centro>
        </AbsoluteFill>
      )}
      {f >= b && f < c && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <Txt t="quase ninguém" f0={b + 2} size={130} /><Txt t="sabe fazer." f0={b + 12} size={130} cor={VD} it />
          <div style={{display: 'flex', gap: 24, marginTop: 70, flexWrap: 'wrap', justifyContent: 'center', width: 900}}>
            {['caro', 'demorado', 'precisa de PC'].map((t, i) => (
              <div key={t} style={{fontFamily: F, fontWeight: 800, fontSize: 46, padding: '16px 36px', borderRadius: 50, border: '3px solid #111', color: '#111', transform: `scale(${sp(f - b - 18 - i * 5, 11, 170)})`}}>{t}</div>
            ))}
          </div>
        </AbsoluteFill>
      )}
      {f >= c && f < d && (() => {
        const ent = sp(f - c, 15, 90);
        return (
          <AbsoluteFill>
            <Centro top={170}><Txt t="você faz pelo celular" f0={c + 2} size={78} /></Centro>
            <Celular rx={interpolate(ent, [0, 1], [40, 6])} ry={interpolate(ent, [0, 1], [30, 10]) + Math.sin(f / 40) * 5} s={0.66} y={interpolate(ent, [0, 1], [1100, 80])}>
              <AbsoluteFill style={{background: 'linear-gradient(#bff0cc, #fff 60%)'}} />
              <Img src={S('ad/ad_loja_t.png')} style={{position: 'absolute', top: 260, left: 40, width: 520, height: 520, objectFit: 'contain', transform: `scale(${1 + Math.sin(f / 10) * 0.03})`}} />
              <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: 'Anton', fontSize: 74, color: '#111'}}>PROMOÇÃO DO DIA</div>
              <div style={{position: 'absolute', bottom: 260, width: '100%', textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: 60, color: VD, transform: `scale(${1 + Math.sin(f / 6) * 0.05})`}}>Peça já! 📲</div>
            </Celular>
            <div style={{position: 'absolute', right: 70, top: 1500, fontFamily: F, fontWeight: 900, fontSize: 46, color: '#fff', background: VD, padding: '16px 32px', borderRadius: 50, transform: `scale(${sp(f - c - 26, 10, 180)})`}}>✓ pronto pra postar</div>
          </AbsoluteFill>
        );
      })()}
      {f >= d && f < e && (
        <AbsoluteFill style={{background: '#0d1f13'}}>
          <div style={{position: 'absolute', top: 160, width: '100%', textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: 96, color: VD}}>renda extra</div>
          <div style={{position: 'absolute', top: 330, left: 0, right: 0, perspective: 1600}}>
            {hs.map((h, i) => <Notif key={i} f={f - plims[i]} y={(hs.length - 1 - i) * 150} ha={h} />)}
          </div>
          {f >= d + 46 && (
            <div style={{position: 'absolute', bottom: 240, width: '100%', textAlign: 'center', fontFamily: F, color: '#fff', transform: `scale(${sp(f - d - 46, 9, 200)})`}}>
              <div style={{fontWeight: 900, fontSize: 200, letterSpacing: '-0.06em'}}>+40</div>
              <div style={{fontWeight: 800, fontSize: 52, color: VD, marginTop: -10}}>vendas nesse nicho</div>
            </div>
          )}
        </AbsoluteFill>
      )}
      {f >= e && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{position: 'absolute', top: 300, padding: '14px 34px', borderRadius: 50, background: VD, fontFamily: F, fontWeight: 800, fontSize: 40, color: '#fff', transform: `scale(${sp(f - e)})`}}>✓ o passo a passo completo</div>
          <Txt t="Animador" f0={e + 4} size={170} /><Txt t="de Bolso" f0={e + 12} size={170} cor={VD} />
          <div style={{marginTop: 80, transform: `scale(${sp(f - e - 26, 11)})`}}><Botao f={f} fim={total} fundo={VD} cor="#fff" /></div>
        </AbsoluteFill>
      )}
      <Flash f={f} cortes={cortes} />
    </AbsoluteFill>
  );
};

// =============== 5. SEM APARECER — tipografia agressiva amarelo/preto ===============
export const CriRosto: React.FC = () => {
  const f = useCurrentFrame();
  const {ini, total} = TEMPOS.Rosto; const [a, b, c, d, e] = ini;
  const AM = '#ffe600';
  const cortes = [b, c, d, e];
  const sel = [d + 2, d + 30, d + 58];
  const slam = (t: string, f0: number, size: number, cor: string, rot = -4) => {
    const s = lin(f, f0, f0 + 6, 2.2, 1, Easing.out(Easing.back(1.6)));
    return <div style={{fontFamily: 'Anton', fontSize: size, color: cor, lineHeight: 0.95, textTransform: 'uppercase', opacity: lin(f, f0, f0 + 2, 0, 1), transform: `scale(${s}) rotate(${rot}deg)`, whiteSpace: 'nowrap'}}>{t}</div>;
  };
  return (
    <AbsoluteFill style={{background: AM}}>
      <Fontes /><Sons voz="Rosto" cortes={cortes} fim={total} vol={0.24} />
      {sel.map((x) => <Sequence key={x} from={x}><Audio src={S('ad/hit.wav')} volume={0.45} /></Sequence>)}
      {f < b && (
        <AbsoluteFill style={{background: '#0b0b0b'}}>
          <Letreiro f={f} t="ANÔNIMO" top={60} cor="rgba(255,230,0,.08)" fam="Anton" />
          <Obj src="ad/ad_mascara_t.png" f={f - 2} size={560} x={540} y={620} />
          <Centro top={1000}>{slam('você não', a + 4, 190, '#fff')}{slam('precisa', a + 10, 190, '#fff', 3)}{slam('aparecer', a + 16, 210, AM)}</Centro>
        </AbsoluteFill>
      )}
      {f >= b && f < c && (
        <AbsoluteFill>
          {[{src: 'ad/ad_microfone_t.png', t: 'gravar sua voz', k: 2, y: 560}, {src: 'ad/ad_lapis_t.png', t: 'saber desenhar', k: 58, y: 1220}].map((o) => {
            const r = lin(f - b - o.k, 10, 18, 0, 1);
            return (
              <React.Fragment key={o.t}>
                <Obj src={o.src} f={f - b - o.k} size={420} x={290} y={o.y} sombra={false} />
                <svg width={420} height={420} style={{position: 'absolute', left: 80, top: o.y - 210}}><line x1={30} y1={30} x2={30 + 360 * r} y2={30 + 360 * r} stroke="#e5321f" strokeWidth={34} strokeLinecap="round" /></svg>
                <div style={{position: 'absolute', left: 540, top: o.y - 110, width: 500}}>
                  <div style={{fontFamily: 'Anton', fontSize: 70, color: '#111', opacity: lin(f, b + o.k, b + o.k + 6, 0, 1)}}>SEM</div>
                  <div style={{fontFamily: F, fontWeight: 900, fontSize: 68, color: '#111', letterSpacing: '-0.04em', lineHeight: 1, opacity: lin(f, b + o.k + 4, b + o.k + 12, 0, 1)}}>{o.t}</div>
                </div>
              </React.Fragment>
            );
          })}
        </AbsoluteFill>
      )}
      {f >= c && f < d && (
        <AbsoluteFill style={{background: '#0b0b0b'}}>
          {[{t: 'a IA cria o personagem', k: 2}, {t: 'a voz narra', k: 60}, {t: 'você só monta', k: 100}].map((o, i) => {
            const s = sp(f - c - o.k, 12, 150);
            return (
              <div key={o.t} style={{position: 'absolute', top: 300 + i * 470, left: 70, right: 70, height: 400, borderRadius: 40, background: i === 2 ? AM : '#1c1c1c', display: 'flex', alignItems: 'center', gap: 40, padding: 40, transform: `translateX(${(1 - s) * (i % 2 ? -1100 : 1100)}px)`}}>
                {i === 0 && <Img src={S('biel/avatar_biel.jpg')} style={{width: 300, height: 300, borderRadius: 30, objectFit: 'cover'}} />}
                {i === 1 && <div style={{width: 300, height: 300, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center'}}>{Array.from({length: 18}, (_, k) => <div key={k} style={{width: 8, borderRadius: 4, background: AM, height: 30 + Math.abs(Math.sin(f / 3 + k)) * 200}} />)}</div>}
                {i === 2 && <div style={{width: 300, height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16}}>{['#111', '#444', '#777'].map((cc, k) => <div key={k} style={{height: 50, borderRadius: 10, background: cc, width: `${lin(f, c + o.k + 6 + k * 4, c + o.k + 20 + k * 4, 10, 100)}%`}} />)}</div>}
                <div style={{fontFamily: F, fontWeight: 900, fontSize: 66, lineHeight: 1.05, color: i === 2 ? '#111' : '#fff', letterSpacing: '-0.04em', flex: 1}}>{o.t}</div>
              </div>
            );
          })}
        </AbsoluteFill>
      )}
      {f >= d && f < e && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          {['sem rosto.', 'sem microfone.', 'sem computador.'].map((t, i) => f >= sel[i] && (
            <div key={t} style={{margin: '18px 0', background: i === 2 ? '#111' : 'transparent', padding: '6px 30px'}}>{slam(t, sel[i], 128, i === 2 ? AM : '#111', [-4, 3, -2][i])}</div>
          ))}
        </AbsoluteFill>
      )}
      {f >= e && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: '#0b0b0b'}}>
          {slam('Animador', e + 2, 220, '#fff')}{slam('de bolso', e + 8, 220, AM, 2)}
          <div style={{marginTop: 30, fontFamily: F, fontWeight: 800, fontSize: 46, color: '#bbb', opacity: lin(f, e + 18, e + 28, 0, 1)}}>começa hoje, pelo celular</div>
          <div style={{marginTop: 70, transform: `scale(${sp(f - e - 22, 11)})`}}><Botao f={f} fim={total} fundo={AM} cor="#111" /></div>
        </AbsoluteFill>
      )}
      <Flash f={f} cortes={cortes} cor={AM} />
    </AbsoluteFill>
  );
};
