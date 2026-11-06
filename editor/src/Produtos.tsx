import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {Fontes, SANS, SERIF, S} from './Kit';

// Mockups dos produtos para a página de vendas (1080x1080, fundo transparente)
const ACC = '#ff7a3d', ACC2 = '#ffb35c', TXT = '#f4efe6', BG = '#151311';

const Fone: React.FC<{children: React.ReactNode; x: number; y: number; w: number; rot: number; z?: number}> = ({children, x, y, w, rot, z = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: w * 2.05, transform: `rotate(${rot}deg)`, zIndex: z, borderRadius: w * 0.16, padding: w * 0.035, background: 'linear-gradient(145deg,#3d3a36,#0c0b0a 45%,#2a2724)', boxShadow: '0 60px 90px rgba(0,0,0,.55), inset 0 0 0 2px rgba(255,255,255,.12)'}}>
    <div style={{width: '100%', height: '100%', borderRadius: w * 0.13, overflow: 'hidden', background: '#0d0c0b', position: 'relative'}}>
      {children}
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg,rgba(255,255,255,.14),transparent 35%)'}} />
    </div>
  </div>
);

export const ProdCurso: React.FC = () => (
  <AbsoluteFill>
    <Fontes />
    <div style={{position: 'absolute', left: 140, top: 130, width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,61,.45), transparent 65%)'}} />
    <Fone x={560} y={170} w={340} rot={9}>
      <Img src={S('biel/au_c4a.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <div style={{position: 'absolute', bottom: 90, width: '100%', textAlign: 'center', fontFamily: 'Anton', fontSize: 40, color: '#fff', WebkitTextStroke: '2px #000'}}>O ÁUDIO ERRADO</div>
    </Fone>
    <Fone x={190} y={110} w={380} rot={-6} z={2}>
      <div style={{padding: '70px 30px 0', fontFamily: SANS, color: TXT}}>
        <div style={{fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em'}}>Animador <span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: ACC2}}>de Bolso</span></div>
        <div style={{marginTop: 18, height: 150, borderRadius: 18, overflow: 'hidden', position: 'relative'}}>
          <Img src={S('biel/em2_c1a.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <div style={{position: 'absolute', left: 12, bottom: 10, background: ACC, color: '#1a0d05', fontWeight: 800, fontSize: 15, padding: '4px 10px', borderRadius: 99}}>▶ Aula 1</div>
        </div>
        {['A fórmula do vídeo que prende', 'Personagem fixo com IA', 'Voz e narração', 'Animação com IA', 'Edição no CapCut', 'Série interativa', 'Como virar renda'].map((t, i) => (
          <div key={t} style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,.05)', fontSize: 17, fontWeight: 600}}>
            <span style={{width: 28, height: 28, borderRadius: 14, flex: 'none', background: i < 2 ? ACC : 'rgba(255,255,255,.1)', color: i < 2 ? '#1a0d05' : TXT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800}}>{i < 2 ? '✓' : i + 1}</span>{t}
          </div>
        ))}
      </div>
    </Fone>
    <div style={{position: 'absolute', left: 90, top: 820, zIndex: 3, background: TXT, color: BG, fontFamily: SANS, fontWeight: 800, fontSize: 34, padding: '14px 28px', borderRadius: 99, boxShadow: '0 20px 40px rgba(0,0,0,.4)', transform: 'rotate(-4deg)'}}>7 módulos + bônus</div>
  </AbsoluteFill>
);

const Ficha: React.FC<{titulo: string; gancho: string; x: number; y: number; rot: number; z: number}> = ({titulo, gancho, x, y, rot, z}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 520, height: 680, transform: `rotate(${rot}deg)`, zIndex: z, background: '#fbf8f1', borderRadius: 26, boxShadow: '0 40px 80px rgba(0,0,0,.45)', padding: '44px 42px', fontFamily: SANS, color: '#1a1714'}}>
    <div style={{fontSize: 16, fontWeight: 700, letterSpacing: '0.14em', color: ACC}}>ROTEIRO PRONTO</div>
    <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, lineHeight: 1, marginTop: 14}}>{titulo}</div>
    <div style={{marginTop: 26, fontSize: 15, fontWeight: 700, color: '#8a8378', letterSpacing: '0.1em'}}>GANCHO · 0 A 3 S</div>
    <div style={{marginTop: 8, fontSize: 24, fontWeight: 800, lineHeight: 1.25}}>{gancho}</div>
    {[92, 80, 86, 64, 74].map((w, k) => <div key={k} style={{marginTop: k === 0 ? 30 : 16, height: 14, borderRadius: 7, background: '#e8e2d6', width: `${w}%`}} />)}
    <div style={{position: 'absolute', left: 42, bottom: 40, display: 'flex', gap: 10}}>
      {['VOTA A', 'VOTA B'].map((t) => <span key={t} style={{fontSize: 15, fontWeight: 800, padding: '8px 14px', borderRadius: 99, border: '2px solid #1a1714'}}>{t}</span>)}
    </div>
  </div>
);

export const ProdRoteiros: React.FC = () => (
  <AbsoluteFill>
    <Fontes />
    <div style={{position: 'absolute', left: 140, top: 140, width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,92,.4), transparent 65%)'}} />
    <Ficha titulo="O Empréstimo" gancho="Seu amigo te deve R$ 500. E acabou de postar foto na praia." x={420} y={170} rot={10} z={1} />
    <Ficha titulo="O Pix Errado" gancho="Caiu R$ 3.889 na sua conta. Não é seu." x={290} y={190} rot={2} z={2} />
    <Ficha titulo="O Áudio Errado" gancho="Você mandou o áudio no grupo errado. E a tia tá online." x={140} y={220} rot={-7} z={3} />
    <div style={{position: 'absolute', right: 70, top: 80, zIndex: 4, width: 230, height: 230, borderRadius: '50%', background: `linear-gradient(135deg,${ACC},${ACC2})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, color: '#1a0d05', transform: 'rotate(10deg)', boxShadow: '0 20px 40px rgba(0,0,0,.4)'}}>
      <div style={{fontWeight: 900, fontSize: 96, lineHeight: 0.9, letterSpacing: '-0.05em'}}>30</div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 40}}>roteiros</div>
    </div>
  </AbsoluteFill>
);

const Carta: React.FC<{src: string; nome: string; x: number; y: number; rot: number; z: number}> = ({src, nome, x, y, rot, z}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 400, transform: `rotate(${rot}deg)`, zIndex: z, background: '#1d1a17', borderRadius: 30, padding: 16, boxShadow: '0 40px 80px rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.1)'}}>
    <Img src={S(src)} style={{width: '100%', height: 460, objectFit: 'cover', borderRadius: 20}} />
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 8px 6px', fontFamily: SANS, color: TXT}}>
      <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 40}}>{nome}</span>
      <span style={{fontSize: 15, fontWeight: 700, color: ACC2, letterSpacing: '0.1em'}}>+ EXPRESSÕES</span>
    </div>
  </div>
);

export const ProdPersonagens: React.FC = () => (
  <AbsoluteFill>
    <Fontes />
    <div style={{position: 'absolute', left: 140, top: 140, width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,61,.38), transparent 65%)'}} />
    <Carta src="prod/terno_ref.jpg" nome="O Chefe" x={600} y={250} rot={11} z={1} />
    <Carta src="prod/mae_ref.jpg" nome="A Mãe" x={80} y={250} rot={-11} z={1} />
    <Carta src="prod/biel_ref.jpg" nome="O Mecânico" x={340} y={170} rot={0} z={2} />
  </AbsoluteFill>
);

export const ProdMentoria: React.FC = () => (
  <AbsoluteFill>
    <Fontes />
    <div style={{position: 'absolute', left: 140, top: 140, width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,214,163,.3), transparent 65%)'}} />
    <Fone x={360} y={110} w={400} rot={-4} z={2}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 35%, #3a2a20, #0d0c0b 70%)'}} />
      <div style={{position: 'absolute', top: 210, left: '50%', marginLeft: -110, width: 220, height: 220, borderRadius: '50%', background: `linear-gradient(135deg,${ACC},${ACC2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 130, color: '#1a0d05'}}>K</div>
      <div style={{position: 'absolute', top: 460, width: '100%', textAlign: 'center', fontFamily: SANS, color: TXT}}>
        <div style={{fontWeight: 800, fontSize: 32}}>Kaic</div>
        <div style={{fontSize: 20, color: '#a8a196', marginTop: 4}}>mentoria ao vivo</div>
      </div>
      <div style={{position: 'absolute', bottom: 80, width: '100%', display: 'flex', justifyContent: 'center', gap: 26}}>
        {['#2a2724', '#2a2724', '#e5321f'].map((c, i) => <div key={i} style={{width: 80, height: 80, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, color: '#fff'}}>{['🎤', '📷', '✕'][i]}</div>)}
      </div>
      <div style={{position: 'absolute', right: 26, top: 80, width: 120, height: 170, borderRadius: 18, overflow: 'hidden', border: '2px solid rgba(255,255,255,.2)'}}><Img src={S('biel/avatar_biel.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>
    </Fone>
    <div style={{position: 'absolute', left: 60, top: 560, zIndex: 3, background: '#fbf8f1', borderRadius: 26, padding: '28px 30px', width: 420, boxShadow: '0 30px 60px rgba(0,0,0,.45)', fontFamily: SANS, color: '#1a1714', transform: 'rotate(-3deg)'}}>
      <div style={{fontSize: 15, fontWeight: 700, letterSpacing: '0.14em', color: ACC}}>NA MENTORIA</div>
      {['Revisão do seu perfil', 'Análise dos seus roteiros', 'Ajustes no primeiro vídeo'].map((t) => <div key={t} style={{display: 'flex', gap: 12, alignItems: 'center', marginTop: 16, fontSize: 22, fontWeight: 700}}><span style={{width: 28, height: 28, borderRadius: 14, background: '#2fd6a3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15}}>✓</span>{t}</div>)}
    </div>
  </AbsoluteFill>
);

// Capa quadrada do produto (Kiwify) e banner do checkout, com fundo escuro da marca
const FundoMarca: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 70% 40%, #3a2416 0%, #151311 45%, #0d0c0b 100%)'}} />
);
export const CapaKiwify: React.FC = () => (
  <AbsoluteFill>
    <Fontes /><FundoMarca />
    <div style={{position: 'absolute', left: 70, top: 90, fontFamily: SANS, color: TXT, zIndex: 5}}>
      <div style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.16em', color: ACC}}>CURSO PELO CELULAR</div>
      <div style={{fontWeight: 800, fontSize: 108, letterSpacing: '-0.05em', lineHeight: 0.95, marginTop: 16}}>Animador<br /><span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: ACC2, fontSize: 122}}>de Bolso</span></div>
      <div style={{marginTop: 22, fontSize: 28, color: '#c9c1b4', lineHeight: 1.3, maxWidth: 330}}>Desenhos animados que viralizam, só com o celular</div>
    </div>
    <div style={{position: 'absolute', left: 300, top: 150, width: 1080, height: 1080, transform: 'scale(.82)', transformOrigin: 'top left'}}><ProdCurso /></div>
  </AbsoluteFill>
);
export const BannerCheckout: React.FC = () => (
  <AbsoluteFill>
    <Fontes /><FundoMarca />
    <div style={{position: 'absolute', left: 70, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', fontFamily: SANS, color: TXT, zIndex: 5}}>
      <div style={{fontSize: 22, fontWeight: 700, letterSpacing: '0.16em', color: ACC}}>VOCÊ ESTÁ A UM PASSO</div>
      <div style={{fontWeight: 800, fontSize: 84, letterSpacing: '-0.05em', lineHeight: 1, marginTop: 10}}>Animador <span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: ACC2, fontSize: 94}}>de Bolso</span></div>
      <div style={{display: 'flex', gap: 26, marginTop: 22, fontSize: 24, color: '#c9c1b4'}}>
        {['Acesso imediato', 'Pagamento único', 'Garantia de 7 dias'].map((t) => <span key={t} style={{display: 'flex', alignItems: 'center', gap: 10}}><span style={{width: 10, height: 10, borderRadius: 5, background: '#2fd6a3'}} />{t}</span>)}
      </div>
    </div>
    <div style={{position: 'absolute', right: -60, top: -170, width: 1080, height: 1080, transform: 'scale(.72)', transformOrigin: 'top right'}}><ProdCurso /></div>
  </AbsoluteFill>
);
