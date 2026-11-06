import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, useCurrentFrame, Easing} from 'remotion';
import TT from './campanha_tempos.json';
import {SANS, SERIF, Celular, Cena, Centro, Fontes, Frase, Grao, Mao, Notif, Obj, VENDAS, lin, sp, S} from './Kit';

// Criativo MOBILIDADE v3 — cinematográfico escuro e dourado: tarjas de cinema, luz anamórfica, bokeh, película
const T = (TT as Record<string, {ini: number[]; total: number}>).Mobil6;
export const MOBIL3_DUR = T.total;
const OURO = '#f5b94a', CREME = '#f3e6cc';

const Fundo: React.FC<{f: number; quente?: number}> = ({f, quente = 1}) => {
  const x = 50 + Math.sin(f / 40) * 18, y = 38 + Math.cos(f / 55) * 10;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 55% at ${x}% ${y}%, rgba(120,76,18,${Math.min(1, quente)}) 0%, #24170a 45%, #070503 100%)`}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 25% at ${100 - x}% ${78 - y / 4}%, rgba(245,185,74,${0.2 * quente}), transparent 70%)`, filter: 'blur(40px)'}} />
    </AbsoluteFill>
  );
};

const Bokeh: React.FC<{f: number; n?: number}> = ({f, n = 22}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {Array.from({length: n}, (_, i) => {
      const r = ((i * 37) % 9) * 9 + 14;
      const x = (i * 211) % 1080, y0 = (i * 397) % 1920;
      const y = (y0 - f * (0.6 + (i % 5) * 0.25) + 1920 * 4) % 1920;
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,214,140,${0.22 + (i % 3) * 0.08}), transparent 70%)`, filter: `blur(${(i % 4) * 2}px)`}} />;
    })}
  </AbsoluteFill>
);

const Cinema: React.FC<{f: number}> = ({f}) => (
  <>
    <div style={{position: 'absolute', left: -200, right: -200, top: 940 + Math.sin(f / 30) * 40, height: 6, background: 'linear-gradient(90deg, transparent, rgba(255,225,170,.55) 50%, transparent)', filter: 'blur(3px)', transform: `translateX(${Math.sin(f / 25) * 120}px)`, mixBlendMode: 'screen'}} />
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 90, background: '#000'}} />
    <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, background: '#000'}} />
    <div style={{position: 'absolute', top: 110, left: 70, right: 70, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: '0.18em', color: CREME, opacity: .55}}>
      <span>ANIMADOR DE BOLSO</span><span>● REC 00:{String(Math.floor(f / 30)).padStart(2, '0')}:{String(f % 30).padStart(2, '0')}</span>
    </div>
  </>
);

const Monitor: React.FC<{f: number; risco: number}> = ({f, risco}) => (
  <svg width={560} height={470} viewBox="0 0 560 470" style={{transform: `scale(${sp(f, 12, 130)})`, filter: 'drop-shadow(0 0 60px rgba(245,185,74,.35))'}}>
    <rect x={20} y={20} width={520} height={320} rx={24} fill="#1a1510" stroke={OURO} strokeWidth={4} />
    <rect x={44} y={44} width={472} height={272} rx={8} fill="#2a2116" />
    <text x={280} y={215} textAnchor="middle" fontFamily="Anton" fontSize={100} fill={OURO}>R$ 5.000+</text>
    <rect x={240} y={340} width={80} height={70} fill="#1a1510" stroke={OURO} strokeWidth={4} /><rect x={150} y={410} width={260} height={24} rx={10} fill={OURO} />
    {risco > 0 && <line x1={10} y1={10} x2={10 + 540 * risco} y2={10 + 450 * risco} stroke="#ff3b30" strokeWidth={34} strokeLinecap="round" />}
  </svg>
);

const Pelicula: React.FC<{f: number; src: string; t: string; y: number; dir: number}> = ({f, src, t, y, dir}) => {
  const s = sp(f, 14, 120);
  return (
    <div style={{position: 'absolute', left: 90, width: 900, top: y, height: 380, transform: `translateX(${(1 - s) * 1100 * dir}px) rotate(${dir * -1.5}deg)`}}>
      <div style={{position: 'absolute', inset: 0, background: '#0d0a06', borderRadius: 18, boxShadow: '0 30px 60px rgba(0,0,0,.6)'}} />
      {[0, 1].map((k) => <div key={k} style={{position: 'absolute', left: 20, right: 20, top: k ? 348 : 10, height: 22, backgroundImage: 'linear-gradient(90deg, #4a3a22 0 26px, transparent 26px 50px)', backgroundSize: '50px 22px'}} />)}
      <div style={{position: 'absolute', left: 24, right: 24, top: 44, bottom: 44, borderRadius: 8, overflow: 'hidden', background: 'radial-gradient(circle at 30% 50%, #5a3c14, #1a1209)'}}>
        <Img src={S(src)} style={{position: 'absolute', left: 20, top: -30, width: 350, height: 350, objectFit: 'contain', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.6))', transform: `scale(${1 + Math.sin(f / 20) * 0.03})`}} />
        <div style={{position: 'absolute', left: 390, top: 90, fontFamily: SERIF, fontStyle: 'italic', fontSize: 100, color: CREME, lineHeight: 1, whiteSpace: 'nowrap'}}>{t}</div>
      </div>
    </div>
  );
};

export const MobilV3: React.FC = () => {
  const f = useCurrentFrame();
  const [a, b, c, d, e, g] = T.ini; const fim = T.total;
  const plims = [e + 10, e + 20, e + 30, e + 40];
  const shake = f >= b && f < b + 12 ? Math.sin(f * 11) * (b + 12 - f) * 3 : 0;
  const ent3 = sp(f - c, 16, 80);
  const itens = [{t: 'personagem', k: 2, x: -290, y: -430}, {t: 'voz', k: 25, x: 330, y: -230}, {t: 'animação', k: 46, x: -300, y: 130}, {t: 'legenda', k: 72, x: 320, y: 330}];
  return (
    <AbsoluteFill style={{background: '#070503'}}>
      <Fontes />
      <Audio src={S('ad/beat.wav')} volume={0.2} />
      <Audio src={S('ad/voz_Mobil6.wav')} />
      {[b, c, d, e, g].map((x) => <Sequence key={x} from={Math.max(0, x - 7)}><Audio src={S('biel/sfx_whoosh.wav')} volume={0.4} /></Sequence>)}
      <Sequence from={b}><Audio src={S('ad/hit.wav')} volume={0.65} /></Sequence>
      <Sequence from={g + 4}><Audio src={S('ad/hit.wav')} volume={0.4} /></Sequence>
      {itens.map((o) => <Sequence key={o.t} from={c + o.k + 4}><Audio src={S('biel/pop.wav')} volume={0.4} /></Sequence>)}
      {plims.map((x) => <Sequence key={x} from={x}><Audio src={S('ad/plim.wav')} volume={0.5} /></Sequence>)}
      <Sequence from={fim - 40}><Audio src={S('biel/pop.wav')} volume={0.7} /></Sequence>

      <Cena f={f} de={a} ate={b}>
        <Fundo f={f} /><Bokeh f={f} />
        <Celular rx={8} ry={lin(f, 0, 14, -30, -18) + Math.sin(f / 30) * 3} rz={-4} s={0.42} x={250} y={80} brilho="rgba(245,185,74,.35)">
          <OffthreadVideo src={S('ad/rec_predio.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </Celular>
        <div style={{position: 'absolute', left: 30, top: 720}}><Monitor f={f - 10} risco={0} /></div>
        <Centro top={250}>
          <Frase f0={a} size={74} cor={CREME} p={[{t: 'você acha que', serif: true}, {t: 'precisa de um'}]} />
          <Frase f0={a + 14} size={124} cor="#fff" p={[{t: 'computador'}, {t: 'caro?', cor: OURO}]} />
        </Centro>
        <Centro top={1440}><Frase f0={a + 50} size={64} cor={CREME} p={[{t: 'pra fazer', serif: true}, {t: 'isso aqui', cor: OURO}]} /></Centro>
        <Cinema f={f} /><Grao modo="screen" op={0.07} />
      </Cena>

      <Cena f={f} de={b} ate={c}>
        <AbsoluteFill style={{transform: `translateX(${shake}px)`}}>
          <Fundo f={f} quente={1.4} /><Bokeh f={f} />
          {[0, 1, 2].map((k) => {
            const p = lin(f, b + k * 4, b + 26 + k * 4, 0, 1, Easing.out(Easing.cubic));
            return <div key={k} style={{position: 'absolute', left: 540 - 700 * p, top: 900 - 700 * p, width: 1400 * p, height: 1400 * p, borderRadius: '50%', border: `${8 - k * 2}px solid rgba(245,185,74,${(1 - p) * 0.8})`}} />;
          })}
          <div style={{position: 'absolute', left: 260, top: 420, opacity: 0.75}}><Monitor f={30} risco={lin(f, b, b + 8, 0.01, 1)} /></div>
          <Centro top={1000}>
            <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 220, color: '#fff', letterSpacing: '-0.06em', lineHeight: 0.92, textAlign: 'center', transform: `scale(${lin(f, b, b + 6, 2.2, 1, Easing.out(Easing.back(2)))})`, textShadow: '0 0 60px rgba(245,185,74,.6)'}}>
              NÃO<br /><span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: OURO, letterSpacing: '-0.02em'}}>precisa.</span>
            </div>
          </Centro>
          <AbsoluteFill style={{background: '#fff3d6', opacity: 0.8 * (1 - lin(f, b + 1, b + 8, 0, 1))}} />
        </AbsoluteFill>
        <Cinema f={f} />
      </Cena>

      <Cena f={f} de={c} ate={d}>
        <Fundo f={f} /><Bokeh f={f} />
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {itens.map((o, i) => {
            const p = lin(f - c - o.k, 0, 10, 0, 1);
            return <line key={i} x1={540} y1={940} x2={540 + o.x * p} y2={940 + o.y * p} stroke={OURO} strokeWidth={2} strokeDasharray="6 8" opacity={.6} />;
          })}
        </svg>
        <Celular rx={lin(ent3, 0, 1, 50, 8)} ry={lin(ent3, 0, 1, -30, -12) + Math.sin(f / 40) * 5} s={0.62} y={lin(ent3, 0, 1, 1200, 40)} brilho="rgba(245,185,74,.45)">
          <Img src={S('biel/au2_c2a.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.12 + (f - c) * 0.002})`}} />
          <div style={{position: 'absolute', bottom: 160, width: '100%', textAlign: 'center', fontFamily: 'Anton', fontSize: 64, color: '#fff', WebkitTextStroke: '3px #000', opacity: lin(f, c + 72, c + 80, 0, 1)}}>A TIA VIU TUDO 😱</div>
        </Celular>
        {itens.map((o) => (
          <div key={o.t} style={{position: 'absolute', left: 540 + o.x, top: 940 + o.y, transform: `translate(-50%,-50%) scale(${sp(f - c - o.k - 6, 10, 180)})`, whiteSpace: 'nowrap', fontFamily: SERIF, fontStyle: 'italic', fontSize: 62, color: '#2a1a07', background: `linear-gradient(180deg,#ffe0a3,${OURO})`, padding: '10px 36px', borderRadius: 60, boxShadow: '0 20px 50px rgba(0,0,0,.5)'}}>✓ {o.t}</div>
        ))}
        {f >= c + 100 && <Centro top={1560}><Frase f0={c + 100} size={72} cor="#fff" p={[{t: 'tudo no celular', serif: true}, {t: 'na sua mão'}]} /></Centro>}
        <Cinema f={f} /><Grao modo="screen" op={0.07} />
      </Cena>

      <Cena f={f} de={d} ate={e}>
        <Fundo f={f} /><Bokeh f={f} n={14} />
        <Pelicula f={f - d - 2} src="ad/ad_onibus_t.png" t="no ônibus" y={330} dir={1} />
        <Pelicula f={f - d - 28} src="ad/ad_relogio_t.png" t="no intervalo" y={760} dir={-1} />
        <Pelicula f={f - d - 68} src="ad/ad_sofa_t.png" t="no sofá" y={1190} dir={1} />
        <Cinema f={f} /><Grao modo="screen" op={0.07} />
      </Cena>

      <Cena f={f} de={e} ate={g}>
        <Fundo f={f} quente={1.3} /><Bokeh f={f} n={30} />
        <Celular rx={6} ry={14 + Math.sin(f / 30) * 4} rz={3} s={0.5} y={170} brilho="rgba(245,185,74,.4)">
          <Sequence from={e}><OffthreadVideo src={S('ad/rec_cara.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
        </Celular>
        <div style={{position: 'absolute', top: 300, left: 0, right: 0, perspective: 1500}}>
          {VENDAS.slice(0, 4).map((v, i) => <Notif key={i} f={f - plims[i]} v={v} style={{position: 'absolute', left: 50 + (i % 2) * 30, right: 80 - (i % 2) * 30, top: (3 - i) * 140}} />)}
        </div>
        <Centro top={1430}><Frase f0={e + 2} size={84} cor="#fff" p={[{t: 'tem gente', serif: true}, {t: 'FATURANDO', bloco: OURO, cor: '#2a1a07'}, {t: 'com vídeos assim', serif: true}]} /></Centro>
        <Cinema f={f} /><Grao modo="screen" op={0.07} />
      </Cena>

      <Cena f={f} de={g} ate={fim + 20}>
        <Fundo f={f} quente={1.3} /><Bokeh f={f} n={30} />
        <Obj src="ad/ad_celular_t.png" f={f - g - 4} size={640} x={540} y={600} rot={-14} sombra="drop-shadow(0 0 80px rgba(245,185,74,.55))" />
        <Centro top={1000}>
          <Frase f0={g + 4} size={150} cor="#fff" p={[{t: 'Animador', serif: true}]} />
          <div style={{marginTop: -10}}><Frase f0={g + 12} size={150} cor={OURO} p={[{t: 'de Bolso'}]} /></div>
          <div style={{marginTop: 24}}><Frase f0={g + 22} size={50} cor={CREME} p={[{t: 'o passo a passo,', serif: true}, {t: 'do zero, no celular'}]} /></div>
          <div style={{marginTop: 50, position: 'relative', transform: `scale(${sp(f - g - 30, 11) * (f > fim - 40 && f < fim - 34 ? 0.93 : 1)})`}}>
            <div style={{padding: '30px 72px', borderRadius: 80, background: `linear-gradient(180deg,#ffe0a3,${OURO})`, fontFamily: SANS, fontWeight: 900, fontSize: 56, color: '#2a1a07', boxShadow: '0 0 80px rgba(245,185,74,.45)'}}>Quero por R$ 19,90</div>
            <Mao f={f} fim={fim} />
          </div>
        </Centro>
        <Cinema f={f} /><Grao modo="screen" op={0.07} />
      </Cena>
    </AbsoluteFill>
  );
};
