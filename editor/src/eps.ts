import {AM, AZUL, VERDE, VERM} from './cores';
import type {Cena, Cfg} from './BielHist';
import EM2 from './biel_em2.json';
import AU2 from './biel_au2.json';

export const EPS: Record<string, Cfg> = {
  em2: {
    cenas: (EM2 as {cenas: Cena[]}).cenas, parte: 2, nomes: {Leo: 'LÉO'}, cores: {Narrador: AM, Leo: '#4fd1ff'},
    placar: [{rot: 'ELE TE DEVE', de: 'R$ 500', cor: VERM}, {rot: 'CURTIDAS', de: 0, para: 300, em: [1, 'trezentas'], cor: '#fff', corDepois: VERDE, num: true}],
    perigo: [[2, 'leo'], [4, 'metade'], [5, 'pix'], [6, 'perdoa']],
    ovs: [
      {t: 'decidiram', venc: 'COBRA', de: 'em1', cor: VERDE},
      {t: 'ranking', cena: 1},
      {t: 'notif', de: 'Léo 🏖️', txt: 'respondeu: "me expor por 500 reais, mano?" 😤', em: [2, 'respondeu'], ate: 3, cor: '#e1306c', icone: '💬'},
      {t: 'selo', txt: 'METADE CONTRA VOCÊ', em: [4, 'metade'], ate: 5, cor: VERM, top: 230},
      {t: 'card', rot: 'PIX RECEBIDO DE LÉO', big: 'R$ 250', sub: '"o resto, se ainda for meu amigo"', em: [5, 'caiu'], ate: 6, cor: VERDE, top: 830},
    ],
    voto: [['PERDOA', VERDE, 'pega os 250 e faz as pazes'], ['COBRA', VERM, 'cobra até o último centavo']],
    votoCena: 6, votoAtraso: 75, trilha: 'musica_bl1.wav',
    sons: [[[1, 'trezentas'], 'pop.wav', 0.5], [[2, 'respondeu'], 'noti.wav', 0.6], [[4, 'metade'], 'boom.wav', 0.8], [[5, 'pix'], 'noti.wav', 0.6]],
  },
  au2: {
    cenas: (AU2 as {cenas: Cena[]}).cenas, parte: 2, nomes: {Rose: 'TIA ROSE'}, cores: {Narrador: AM, Rose: '#ff7ab8'},
    placar: [{rot: 'NO GRUPO', de: '43 PESSOAS'}, {rot: 'O ÁUDIO', de: 'COM O PRIMO 😬', cor: VERM}],
    perigo: [[1, 'grupo'], [3, 'primo'], [5, 'manda'], [6, 'implora']],
    ovs: [
      {t: 'decidiram', venc: 'APAGA', de: 'au1', cor: VERM},
      {t: 'ranking', cena: 1},
      {t: 'notif', de: 'Tia Rose 🌹', txt: 'Apagou por quê, meu filho? Era sobre a tia? 🤨', em: [2, 'apagou'], ate: 3, cor: '#25d366', icone: '💬'},
      {t: 'notif', de: 'Juninho 😈', txt: 'Relaxa, tia. Ele mandou pra mim também. Tá tudo aqui.', em: [4, 'relaxa'], ate: 5, cor: '#25d366', icone: '💬'},
      {t: 'notif', de: 'Tia Rose 🌹', txt: 'Manda pra mim, Juninho. 🙂', em: [5, 'manda'], ate: 6, cor: '#25d366', icone: '💬'},
    ],
    voto: [['IMPLORA', AZUL, 'liga pro primo e implora pra ele apagar'], ['CONTA', VERDE, 'conta tudo pra tia antes dele']],
    votoCena: 6, votoAtraso: 80, trilha: 'musica_pr1.wav',
    sons: [[[1, 'grupo'], 'vibra.wav', 0.6], [[2, 'apagou'], 'noti.wav', 0.6], [[4, 'relaxa'], 'noti.wav', 0.6], [[5, 'manda'], 'boom.wav', 0.8]],
  },
};
