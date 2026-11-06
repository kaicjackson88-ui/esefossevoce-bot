import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, useCurrentFrame, Easing} from 'remotion';
import TT from './campanha_tempos.json';
import {COND, MONO, SANS, Celular, Cena, Centro, Fontes, Frase, Grao, Mao, Notif, Obj, VENDAS, lin, sp, S} from './Kit';

// Criativo RENDA v3 — painel financeiro verde: mapa do bairro, oferta × demanda, gráfico e saldo
const T = (TT as Record<string, {ini: number[]; total: number}>).Renda6;
export const RENDA3_DUR = T.total;
const VD = '#19d36b', ESC = '#06140c', PAINEL = '#0c2216', CLARO = '#dff7e8';

const Grade: React.FC = () => (
  <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(25,211,107,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(25,211,107,.07) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
);

const Topo: React.FC<{f: number; titulo: string}> = ({f, titulo}) => (
  <div style={{position: 'absolute', top: 100, left: 60, right: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: MONO, fontWeight: 600, fontSize: 24, color: CLARO, opacity: lin(f, 0, 10, 0, 1), zIndex: 9}}>
    <span style={{display: 'flex', alignItems: 'center', gap: 14}}><span style={{width: 16, height: 16, borderRadius: 8, background: VD, boxShadow: `0 0 16px ${VD}`, opacity: Math.floor(f / 12) % 2 ? 1 : 0.4}} />{titulo}</span>
    <span style={{opacity: .6}}>AO VIVO</span>
  </div>
);

const Pino: React.FC<{f: number; x: number; y: number; e: string; t: string}> = ({f, x, y, e, t}) => {
  const s = sp(f, 10, 170);
  const pulso = (Math.max(0, f) % 40) / 40;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-100%) scale(${s})`}}>
      <div style={{position: 'absolute', left: '50%', bottom: -14, width: 160 * pulso, height: 56 * pulso, marginLeft: -80 * pulso, borderRadius: '50%', border: `3px solid ${VD}`, opacity: 1 - pulso}} />
      <div style={{background: '#fff', borderRadius: 30, padding: '14px 26px', display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS, fontWeight: 800, fontSize: 36, color: ESC, boxShadow: '0 16px 40px rgba(0,0,0,.4)', whiteSpace: 'nowrap'}}><span style={{fontSize: 44}}>{e}</span>{t}</div>
      <div style={{width: 0, height: 0, margin: '0 auto', borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: '20px solid #fff'}} />
    </div>
  );
};

const Grafico: React.FC<{f: number; x: number; y: number; w: number; h: number}> = ({f, x, y, w, h}) => {
  const pts = [0.1, 0.18, 0.15, 0.3, 0.27, 0.45, 0.42, 0.6, 0.72, 0.68, 0.88, 0.96];
  const p = lin(f, 0, 60, 0, 1, Easing.inOut(Easing.cubic));
  const n = Math.max(2, Math.ceil(pts.length * p));
  const coord = pts.slice(0, n).map((v, i) => [x + (i / (pts.length - 1)) * w, y + h - v * h]);
  const dd = coord.map(([cx, cy], i) => `${i ? 'L' : 'M'}${cx},${cy}`).join(' ');
  const ult = coord[coord.length - 1];
  const fp = Math.max(0, f) % 30;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={VD} stopOpacity=".45" /><stop offset="1" stopColor={VD} stopOpacity="0" /></linearGradient></defs>
      {[0, 1, 2, 3].map((k) => <line key={k} x1={x} x2={x + w} y1={y + (k / 3) * h} y2={y + (k / 3) * h} stroke={CLARO} strokeOpacity=".1" strokeWidth={2} />)}
      <path d={`${dd} L${ult[0]},${y + h} L${x},${y + h} Z`} fill="url(#ar)" />
      <path d={dd} fill="none" stroke={VD} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={ult[0]} cy={ult[1]} r={16} fill={VD} /><circle cx={ult[0]} cy={ult[1]} r={30 + fp} fill="none" stroke={VD} strokeOpacity={1 - fp / 30} strokeWidth={3} />
    </svg>
  );
};

export const RendaV3: React.FC = () => {
  const f = useCurrentFrame();
  const [a, b, c, d, e] = T.ini; const fim = T.total;
  const vendas = VENDAS.slice(0, 5);
  const plims = vendas.map((_, i) => d + 6 + i * 11);
  const valores = vendas.map((v) => parseFloat(v.valor.replace(',', '.')));
  const saldo = valores.reduce((s, v, i) => s + (f >= plims[i] ? v : 0), 0);
  const ultPlim = plims.filter((x) => x <= f).slice(-1)[0] ?? -100;
  const pinos = [{e: '🥐', t: 'Padaria', x: 260, y: 600, k: 8}, {e: '💇', t: 'Salão', x: 810, y: 680, k: 16}, {e: '🔧', t: 'Oficina', x: 250, y: 1180, k: 24}, {e: '🍧', t: 'Açaí', x: 820, y: 1260, k: 32}, {e: '🐶', t: 'Pet shop', x: 540, y: 1500, k: 40}];
  const rua = [[0, 840, 1080, 780], [0, 1360, 1080, 1440], [380, 300, 460, 1920], [700, 300, 640, 1920]];
  return (
    <AbsoluteFill style={{background: ESC}}>
      <Fontes />
      <Audio src={S('ad/beat.wav')} volume={0.2} />
      <Audio src={S('ad/voz_Renda6.wav')} />
      {[b, c, d, e].map((x) => <Sequence key={x} from={x - 7}><Audio src={S('biel/sfx_whoosh.wav')} volume={0.4} /></Sequence>)}
      {pinos.map((p) => <Sequence key={p.t} from={a + p.k}><Audio src={S('biel/pop.wav')} volume={0.35} /></Sequence>)}
      {plims.map((x) => <Sequence key={x} from={x}><Audio src={S('ad/plim.wav')} volume={0.5} /></Sequence>)}
      <Sequence from={b + 30}><Audio src={S('ad/hit.wav')} volume={0.4} /></Sequence>
      <Sequence from={fim - 40}><Audio src={S('biel/pop.wav')} volume={0.7} /></Sequence>

      <Cena f={f} de={a} ate={b}>
        <Grade />
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {rua.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#123824" strokeWidth={70} />)}
          {rua.map(([x1, y1, x2, y2], i) => <line key={'t' + i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={VD} strokeOpacity=".25" strokeWidth={3} strokeDasharray="20 20" strokeDashoffset={-f * 2} />)}
        </svg>
        <Obj src="ad/ad_loja_t.png" f={f + 10} size={420} x={540} y={1010} />
        {pinos.map((p) => <Pino key={p.t} f={f - p.k} x={p.x} y={p.y} e={p.e} t={p.t} />)}
        <Topo f={f + 10} titulo="SEU BAIRRO · 5 NEGÓCIOS" />
        <Centro top={210}><Frase f0={a - 14} size={82} cor="#fff" p={[{t: 'toda loja', serif: true}, {t: 'do seu bairro'}]} /><Frase f0={a + 6} size={100} cor={VD} p={[{t: 'precisa de vídeo'}]} /></Centro>
        <Grao modo="screen" op={0.06} />
      </Cena>

      <Cena f={f} de={b} ate={c} fundo={ESC}>
        <Grade />
        <Topo f={f - b} titulo="OFERTA × DEMANDA" />
        <Centro top={260}><Frase f0={b + 2} size={96} cor="#fff" p={[{t: 'e quase', serif: true}, {t: 'ninguém'}]} /><Frase f0={b + 12} size={110} cor={VD} p={[{t: 'sabe fazer.', serif: true}]} /></Centro>
        {[{t: 'precisam de vídeo', h: 700, cor: VD, x: 200}, {t: 'sabem fazer', h: 90, cor: '#ff4d4d', x: 600}].map((o, i) => {
          const p = lin(f, b + 6 + i * 8, b + 34 + i * 8, 0, 1, Easing.out(Easing.cubic));
          return (
            <React.Fragment key={o.t}>
              <div style={{position: 'absolute', left: o.x, width: 280, bottom: 420, height: o.h * p, background: `linear-gradient(180deg, ${o.cor}, ${o.cor}55)`, borderRadius: '24px 24px 0 0', boxShadow: `0 0 60px ${o.cor}55`}} />
              <div style={{position: 'absolute', left: o.x - 40, width: 360, bottom: 340, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 40, color: CLARO}}>{o.t}</div>
            </React.Fragment>
          );
        })}
        <div style={{position: 'absolute', left: 60, right: 60, bottom: 418, height: 4, background: CLARO, opacity: .3}} />
        {f > b + 30 && <div style={{position: 'absolute', left: 560, top: 1250, fontFamily: COND, fontSize: 64, color: ESC, background: VD, padding: '6px 24px', transform: `rotate(-8deg) scale(${lin(f, b + 30, b + 36, 2, 1, Easing.out(Easing.back(2)))})`}}>OPORTUNIDADE</div>}
        <Grao modo="screen" op={0.06} />
      </Cena>

      <Cena f={f} de={c} ate={d} fundo={ESC}>
        <Grade />
        <Topo f={f - c} titulo="ESTÚDIO NO CELULAR" />
        <Celular rx={lin(sp(f - c, 15, 90), 0, 1, 40, 6)} ry={lin(sp(f - c, 15, 90), 0, 1, 30, 12) + Math.sin(f / 40) * 5} s={0.6} y={lin(sp(f - c, 15, 90), 0, 1, 1100, 60)} brilho="rgba(25,211,107,.35)">
          <AbsoluteFill style={{background: '#fff'}} />
          <div style={{position: 'absolute', top: 80, left: 30, right: 30, display: 'flex', alignItems: 'center', gap: 16, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#111'}}><div style={{width: 60, height: 60, borderRadius: 30, background: 'linear-gradient(135deg,#ffb347,#ff5e62)'}} />padaria.do.bairro</div>
          <div style={{position: 'absolute', top: 170, left: 0, right: 0, height: 760, background: 'linear-gradient(#ffe7b8, #fff3dc)', overflow: 'hidden'}}>
            <Img src={S('ad/ad_loja_t.png')} style={{position: 'absolute', left: 60, top: 150, width: 480, height: 480, objectFit: 'contain', transform: `translateX(${Math.sin(f / 12) * 14}px) scale(${1 + Math.sin(f / 9) * 0.03})`}} />
            <div style={{position: 'absolute', top: 40, width: '100%', textAlign: 'center', fontFamily: COND, fontSize: 84, color: '#d4380d', transform: `rotate(-3deg) scale(${1 + Math.sin(f / 6) * 0.04})`}}>PÃO QUENTINHO</div>
            <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 46, color: '#111'}}>todo dia às 17h 🔥</div>
          </div>
          <div style={{position: 'absolute', top: 960, left: 30, fontFamily: SANS, fontWeight: 800, fontSize: 32, color: '#111'}}>♥ curtido por muita gente do bairro</div>
        </Celular>
        {[{t: 'animação com IA', x: 250, y: 520, k: 40}, {t: 'pronto pra postar', x: 820, y: 1330, k: 70}].map((o) => (
          <div key={o.t} style={{position: 'absolute', left: o.x, top: o.y, transform: `translate(-50%,-50%) scale(${sp(f - c - o.k, 10, 180)})`, whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 900, fontSize: 44, color: ESC, background: VD, padding: '14px 30px', borderRadius: 50, boxShadow: `0 0 40px ${VD}88`}}>✓ {o.t}</div>
        ))}
        <Centro top={1570}><Frase f0={c + 90} size={70} cor="#fff" p={[{t: 'pro Instagram delas,', serif: true}, {t: 'pelo celular'}]} /></Centro>
        <Grao modo="screen" op={0.06} />
      </Cena>

      <Cena f={f} de={d} ate={e} fundo={ESC}>
        <Grade />
        <Topo f={f - d} titulo="SUAS VENDAS · HOJE" />
        <div style={{position: 'absolute', top: 180, left: 60, right: 60, background: PAINEL, borderRadius: 40, padding: '30px 44px', border: `2px solid ${VD}33`}}>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 32, color: CLARO, opacity: .7}}>entrou hoje</div>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 130, color: '#fff', letterSpacing: '-0.05em', transform: `scale(${1 + 0.05 * (1 - sp(f - ultPlim, 8, 220))})`, transformOrigin: 'left center'}}>R$ {saldo.toFixed(2).replace('.', ',')}</div>
        </div>
        <Grafico f={f - d} x={80} y={540} w={920} h={330} />
        <div style={{position: 'absolute', top: 900, left: 0, right: 0, perspective: 1500}}>
          {vendas.map((v, i) => <Notif key={i} f={f - plims[i]} v={v} style={{position: 'absolute', left: 50, right: 50, top: (vendas.length - 1 - i) * 132}} />)}
        </div>
        <Centro top={1610}><Frase f0={d + 4} size={74} cor="#fff" p={[{t: 'cada vídeo', serif: true}, {t: 'pode virar'}, {t: 'VENDA', bloco: VD, cor: ESC}]} /></Centro>
        <Grao modo="screen" op={0.06} />
      </Cena>

      <Cena f={f} de={e} ate={fim + 20} fundo={ESC}>
        <Grade />
        <Grafico f={f - e + 40} x={80} y={300} w={920} h={420} />
        <Topo f={f - e} titulo="ANIMADOR DE BOLSO" />
        <Centro top={860}>
          <Frase f0={e + 4} size={80} cor={CLARO} p={[{t: 'aprenda o', serif: true}, {t: 'passo a passo'}]} />
          <div style={{height: 20}} />
          <Frase f0={e + 12} size={150} cor="#fff" p={[{t: 'Animador', serif: true}]} />
          <div style={{marginTop: -10}}><Frase f0={e + 20} size={150} cor={VD} p={[{t: 'de Bolso'}]} /></div>
          <div style={{marginTop: 60, position: 'relative', transform: `scale(${sp(f - e - 34, 11) * (f > fim - 40 && f < fim - 34 ? 0.93 : 1)})`}}>
            <div style={{padding: '30px 72px', borderRadius: 80, background: VD, fontFamily: SANS, fontWeight: 900, fontSize: 56, color: ESC, boxShadow: `0 0 80px ${VD}77`}}>Quero por R$ 19,90</div>
            <Mao f={f} fim={fim} />
          </div>
        </Centro>
        <Grao modo="screen" op={0.06} />
      </Cena>
    </AbsoluteFill>
  );
};
