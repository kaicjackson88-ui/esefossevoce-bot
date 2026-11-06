import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, useCurrentFrame, Easing} from 'remotion';
import TT from './campanha_tempos.json';
import {COND, MONO, SANS, SERIF, Cena, Centro, Fontes, Frase, Grao, Mao, Notif, Obj, VENDAS, lin, sp, S} from './Kit';

// Criativo PREÇO v3 — estilo encarte de supermercado: amarelo, vermelho, retícula, etiquetas e cupom fiscal
const T = (TT as Record<string, {ini: number[]; total: number}>).Preco6;
export const PRECO3_DUR = T.total;
const AM = '#ffd400', VM = '#e30613', TI = '#111';

const Reticula: React.FC<{cor?: string; op?: number}> = ({cor = VM, op = 0.18}) => (
  <AbsoluteFill style={{backgroundImage: `radial-gradient(${cor} 22%, transparent 24%)`, backgroundSize: '34px 34px', opacity: op}} />
);

const Estrela: React.FC<{f: number; x: number; y: number; r: number; t1: string; t2?: string; cor?: string}> = ({f, x, y, r, t1, t2, cor = VM}) => {
  const s = sp(f, 9, 160);
  const pts = Array.from({length: 32}, (_, i) => {const an = (i / 32) * Math.PI * 2; const rr = i % 2 ? r * 0.82 : r; return `${r + Math.cos(an) * rr},${r + Math.sin(an) * rr}`;}).join(' ');
  const rot = f * 0.8 - 12;
  return (
    <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, transform: `scale(${s}) rotate(${rot}deg)`}}>
      <svg width={r * 2} height={r * 2} style={{position: 'absolute'}}><polygon points={pts} fill={cor} /></svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `rotate(${-rot}deg)`, color: '#fff', textAlign: 'center'}}>
        <div style={{fontFamily: COND, fontSize: r * 0.42, lineHeight: 0.95}}>{t1}</div>
        {t2 && <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: r * 0.3, lineHeight: 1}}>{t2}</div>}
      </div>
    </div>
  );
};

const PrecoGondola: React.FC<{inteiro: string; cent: string; size: number; cor?: string; riscado?: number}> = ({inteiro, cent, size, cor = VM, riscado = 0}) => (
  <div style={{position: 'relative', display: 'flex', alignItems: 'flex-start', color: cor, fontFamily: COND, lineHeight: 0.85}}>
    <span style={{fontSize: size * 0.28, marginTop: size * 0.1, marginRight: size * 0.04}}>R$</span>
    <span style={{fontSize: size}}>{inteiro}</span>
    <span style={{fontSize: size * 0.42, marginTop: size * 0.05}}>,{cent}</span>
    {riscado > 0 && <div style={{position: 'absolute', left: -10, top: '48%', height: size * 0.08, background: TI, width: `${riscado * 108}%`, transform: 'rotate(-8deg)'}} />}
  </div>
);

const Etiqueta: React.FC<{f: number; x: number; y: number; rot: number; nome: string; inteiro: string; cent: string; cor: string; fundo: string; img?: string; riscado?: number}> = ({f, x, y, rot, nome, inteiro, cent, cor, fundo, img, riscado}) => {
  const s = sp(f, 12, 140);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 460, transform: `translateY(${(1 - s) * -900}px) rotate(${rot + Math.sin(f / 18) * 1.5}deg)`, transformOrigin: '50% 0'}}>
      <div style={{position: 'absolute', left: 228, top: -120, width: 4, height: 130, background: '#333'}} />
      <div style={{background: fundo, borderRadius: 26, padding: '34px 30px 30px', boxShadow: '0 30px 60px rgba(0,0,0,.3)', border: `6px solid ${TI}`}}>
        <div style={{width: 30, height: 30, borderRadius: 15, background: '#fff', border: `4px solid ${TI}`, margin: '-14px auto 14px'}} />
        {img && <Img src={S(img)} style={{width: 390, height: 260, objectFit: img.endsWith('.jpg') ? 'cover' : 'contain', borderRadius: 16, display: 'block'}} />}
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 38, color: TI, marginTop: 16, letterSpacing: '-0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{nome}</div>
        <PrecoGondola inteiro={inteiro} cent={cent} size={170} cor={cor} riscado={riscado} />
      </div>
    </div>
  );
};

const Cupom: React.FC<{f: number; linhas: [string, string][]; total: [string, string]}> = ({f, linhas, total}) => {
  const altura = lin(f, 4, 50, 0, 1, Easing.inOut(Easing.cubic));
  const dentes = Array.from({length: 21}, (_, i) => `${i * 5}% ${i % 2 ? 100 : 97}%`).join(',');
  return (
    <div style={{position: 'absolute', left: 150, width: 780, top: 380, height: 1100, overflow: 'hidden'}}>
      <div style={{transform: `translateY(${(1 - altura) * -1100}px)`, background: '#fbfaf5', padding: '50px 54px 80px', boxShadow: '0 30px 60px rgba(0,0,0,.25)', fontFamily: MONO, fontWeight: 600, color: '#222', clipPath: `polygon(0 0,100% 0,${dentes.split(',').reverse().join(',')})`}}>
        <div style={{textAlign: 'center', fontSize: 38}}>ANIMADOR DE BOLSO</div>
        <div style={{textAlign: 'center', fontSize: 26, opacity: .6, marginTop: 6}}>CUPOM · SEU PRIMEIRO VÍDEO</div>
        <div style={{borderTop: '4px dashed #999', margin: '30px 0'}} />
        {linhas.map(([a, b], i) => (
          <div key={a} style={{display: 'flex', fontSize: 40, margin: '20px 0', opacity: lin(f, 14 + i * 9, 20 + i * 9, 0, 1)}}>
            <span>{a}</span><span style={{flex: 1, borderBottom: '4px dotted #aaa', margin: '0 14px 12px'}} /><span style={{color: VM}}>{b}</span>
          </div>
        ))}
        <div style={{borderTop: '4px dashed #999', margin: '30px 0'}} />
        <div style={{display: 'flex', fontSize: 52, opacity: lin(f, 54, 60, 0, 1)}}><span>{total[0]}</span><span style={{flex: 1}} /><span style={{color: VM}}>{total[1]}</span></div>
        <div style={{display: 'flex', gap: 4, height: 90, marginTop: 40, justifyContent: 'center'}}>{[3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 3, 1].map((w, i) => <div key={i} style={{width: w * 4, background: '#222'}} />)}</div>
      </div>
    </div>
  );
};

export const PrecoV3: React.FC = () => {
  const f = useCurrentFrame();
  const [a, b, c, d, e, g] = T.ini; const fim = T.total;
  const vira = e + Math.round((g - e) * 0.42);
  const plims = [vira + 8, vira + 16, vira + 24, vira + 32];
  return (
    <AbsoluteFill style={{background: AM}}>
      <Fontes />
      <Audio src={S('ad/beat.wav')} volume={0.2} />
      <Audio src={S('ad/voz_Preco6.wav')} />
      {[b, c, d, e, g].map((x) => <Sequence key={x} from={x - 7}><Audio src={S('biel/sfx_whoosh.wav')} volume={0.4} /></Sequence>)}
      {[a + 1, b + 40, g + 4].map((x) => <Sequence key={x} from={x}><Audio src={S('ad/hit.wav')} volume={0.45} /></Sequence>)}
      {plims.map((x) => <Sequence key={x} from={x}><Audio src={S('ad/plim.wav')} volume={0.5} /></Sequence>)}
      {[0, 1, 2, 3].map((i) => <Sequence key={i} from={d + 14 + i * 9}><Audio src={S('biel/tique.wav')} volume={0.4} /></Sequence>)}
      <Sequence from={fim - 40}><Audio src={S('biel/pop.wav')} volume={0.7} /></Sequence>

      <Cena f={f} de={a} ate={b}>
        <Reticula />
        <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 230, background: VM, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${lin(f, 0, 8, -230, 0)}px)`}}>
          <div style={{fontFamily: COND, fontSize: 120, color: AM, letterSpacing: '0.04em'}}>OFERTA DO DIA</div>
        </div>
        <Estrela f={f - 6} x={860} y={430} r={150} t1="SÓ" t2="hoje" />
        <Centro top={620}>
          <div style={{transform: `scale(${lin(f, 0, 7, 2.6, 1, Easing.out(Easing.back(1.8)))}) rotate(${lin(f, 0, 10, -10, -3)}deg)`}}>
            <PrecoGondola inteiro="19" cent="90" size={520} />
          </div>
          <div style={{marginTop: 30}}><Frase f0={a + 14} size={70} p={[{t: 'pagamento', serif: true}, {t: 'ÚNICO', cond: true, bloco: TI, cor: AM}]} /></div>
        </Centro>
        <Grao />
      </Cena>

      <Cena f={f} de={b} ate={c} fundo="#fff4b8">
        <Reticula op={0.1} />
        <Centro top={170}><Frase f0={b + 2} size={88} p={[{t: 'menos que', serif: true}, {t: 'UM LANCHE', cond: true, cor: VM}]} /></Centro>
        <Etiqueta f={f - b - 6} x={50} y={500} rot={-6} nome="Combo lanche" inteiro="34" cent="90" cor={TI} fundo="#fff" img="ad/ad_burger_t.png" riscado={lin(f, b + 36, b + 44, 0, 1)} />
        <Etiqueta f={f - b - 16} x={570} y={620} rot={5} nome="Animador de Bolso" inteiro="19" cent="90" cor={VM} fundo={AM} img="biel/au_c4a.jpg" />
        {f > b + 40 && <Estrela f={f - b - 40} x={830} y={1520} r={140} t1="MAIS" t2="barato" cor={TI} />}
        <Grao />
      </Cena>

      <Cena f={f} de={c} ate={d} fundo={VM}>
        <Reticula cor="#fff" op={0.08} />
        <Centro top={160}><Frase f0={c + 2} size={84} cor="#fff" p={[{t: 'animações', serif: true}, {t: 'IGUAIS', cond: true, cor: AM}, {t: 'às que', serif: true}, {t: 'VIRALIZAM', cond: true}]} /></Centro>
        {[{src: 'ad/rec_predio.mp4', tag: '3 MI', x: 40, r: -5, k: 10}, {src: 'ad/rec_cara.mp4', tag: '♥ 287 MIL', x: 370, r: 2, k: 18}, {src: 'ad/rec_amigos.mp4', tag: '♥ 102 MIL', x: 700, r: 6, k: 26}].map((o) => {
          const s = sp(f - c - o.k, 13, 130);
          return (
            <div key={o.src} style={{position: 'absolute', left: o.x, top: 580, width: 340, transform: `translateY(${(1 - s) * 1300}px) rotate(${o.r}deg)`}}>
              <div style={{background: '#fff', padding: 14, borderRadius: 24, boxShadow: '0 30px 60px rgba(0,0,0,.35)'}}>
                <div style={{height: 600, borderRadius: 14, overflow: 'hidden'}}><Sequence from={c}><OffthreadVideo src={S(o.src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence></div>
                <div style={{fontFamily: COND, fontSize: 60, color: VM, textAlign: 'center', marginTop: 8}}>{o.tag}</div>
              </div>
            </div>
          );
        })}
        <Centro top={1440}><div style={{fontFamily: COND, fontSize: 90, color: TI, background: AM, padding: '4px 30px', transform: `rotate(-3deg) scale(${sp(f - c - 40, 10, 170)})`}}>NO SEU CELULAR</div></Centro>
        <Grao />
      </Cena>

      <Cena f={f} de={d} ate={e}>
        <Reticula op={0.12} />
        <Centro top={170}><Frase f0={d + 2} size={84} p={[{t: 'do roteiro', serif: true}, {t: 'À ANIMAÇÃO', cond: true, cor: VM}]} /></Centro>
        <Cupom f={f - d} linhas={[['ROTEIRO', 'IA'], ['PERSONAGEM', 'IA'], ['VOZ', 'IA'], ['ANIMAÇÃO', 'IA']]} total={['TOTAL', 'CELULAR']} />
        <Estrela f={f - d - 58} x={890} y={1520} r={130} t1="SEM" t2="PC" />
        <Grao />
      </Cena>

      <Cena f={f} de={e} ate={g} fundo={TI}>
        {f < vira + 4 && (
          <>
            <Centro top={220}><Frase f0={e + 2} size={88} cor="#fff" p={[{t: 'o lanche', serif: true}, {t: 'ACABA EM', cond: true}]} /></Centro>
            <Centro top={400}><div style={{fontFamily: COND, fontSize: 220, color: AM}}>{`00:${String(Math.max(0, 10 - Math.floor(((f - e) / (vira - e)) * 10))).padStart(2, '0')}`}</div></Centro>
            <Centro top={720}><div style={{transform: `scale(${lin(f, vira - 12, vira, 1, 0, Easing.in(Easing.back(2)))})`}}><Img src={S('ad/ad_burger_t.png')} style={{width: 640, height: 640, objectFit: 'contain'}} /></div></Centro>
          </>
        )}
        {f >= vira && (
          <>
            <Centro top={190}><Frase f0={vira} size={90} cor="#fff" p={[{t: 'isso aqui', serif: true}, {t: 'PODE VIRAR', cond: true}, {t: 'RENDA', cond: true, bloco: AM, cor: TI}]} /></Centro>
            <div style={{position: 'absolute', top: 560, left: 0, right: 0, perspective: 1500}}>
              {VENDAS.slice(0, 4).map((v, i) => <Notif key={i} f={f - plims[i]} v={v} style={{position: 'absolute', left: 50, right: 50, top: (3 - i) * 150}} />)}
            </div>
            <Obj src="ad/ad_cofre_t.png" f={f - vira - 30} size={420} x={540} y={1470} rot={-6} />
          </>
        )}
        <Grao modo="screen" op={0.08} />
      </Cena>

      <Cena f={f} de={g} ate={fim + 20}>
        <Reticula />
        <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 230, background: VM, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{fontFamily: COND, fontSize: 110, color: AM}}>OFERTA DO DIA</div></div>
        <Estrela f={f - g - 4} x={210} y={480} r={140} t1="SÓ" t2="hoje" />
        <Obj src="ad/ad_carrinho_t.png" f={f - g - 8} size={440} x={790} y={520} rot={8} />
        <Centro top={820}>
          <Frase f0={g + 4} size={150} p={[{t: 'Animador', serif: true}]} />
          <div style={{marginTop: -6}}><Frase f0={g + 12} size={170} p={[{t: 'DE BOLSO', cond: true, cor: VM}]} /></div>
          <div style={{marginTop: 20, transform: `scale(${sp(f - g - 20, 10)})`}}><PrecoGondola inteiro="19" cent="90" size={250} cor={TI} /></div>
          <div style={{marginTop: 40, position: 'relative', transform: `scale(${sp(f - g - 30, 11) * (f > fim - 40 && f < fim - 34 ? 0.93 : 1)})`}}>
            <div style={{padding: '30px 72px', borderRadius: 80, background: VM, fontFamily: SANS, fontWeight: 900, fontSize: 56, color: '#fff', boxShadow: '0 24px 60px rgba(0,0,0,.3)', border: `5px solid ${TI}`}}>Quero por R$ 19,90</div>
            <Mao f={f} fim={fim} />
          </div>
        </Centro>
        <Grao />
      </Cena>
    </AbsoluteFill>
  );
};
