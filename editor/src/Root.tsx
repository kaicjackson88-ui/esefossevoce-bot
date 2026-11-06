import React from 'react';
import {Composition} from 'remotion';
import {BielHist, BielHistCapa, totalHist} from './BielHist';
import {EPS} from './eps';
import {AdTeste, AD_DUR} from './Motion';
import {AdV2, AD2_DUR} from './AdV2';
import {ProvaV3, PROVA3_DUR} from './ProvaV3';
import {PrecoV3, PRECO3_DUR} from './PrecoV3';
import {MobilV3, MOBIL3_DUR} from './MobilV3';
import {RendaV3, RENDA3_DUR} from './RendaV3';
import {CriPreco, CriMobil, CriRenda, CriRosto, CriProva, TEMPOS} from './Campanha';

const CRIATIVOS = {Preco: CriPreco, Mobil: CriMobil, Prova: CriProva, Renda: CriRenda, Rosto: CriRosto};

export const Root: React.FC = () => (
  <>
    {Object.entries(CRIATIVOS).map(([k, C]) => (
      <Composition key={k} id={`Cri-${k}`} component={C} durationInFrames={TEMPOS[k].total} fps={30} width={1080} height={1920} />
    ))}
    <Composition id="Cri-Renda3" component={RendaV3} durationInFrames={RENDA3_DUR} fps={30} width={1080} height={1920} />
    <Composition id="Cri-Mobil3" component={MobilV3} durationInFrames={MOBIL3_DUR} fps={30} width={1080} height={1920} />
    <Composition id="Cri-Preco3" component={PrecoV3} durationInFrames={PRECO3_DUR} fps={30} width={1080} height={1920} />
    <Composition id="Cri-Prova3" component={ProvaV3} durationInFrames={PROVA3_DUR} fps={30} width={1080} height={1920} />
    <Composition id="Ad-v2" component={AdV2} durationInFrames={AD2_DUR} fps={30} width={1080} height={1920} />
    <Composition id="Ad-teste" component={AdTeste} durationInFrames={AD_DUR} fps={30} width={1080} height={1920} />
    {Object.keys(EPS).map((e) => (
      <React.Fragment key={e}>
        <Composition id={`Hist-${e}`} component={BielHist} defaultProps={{ep: e}} durationInFrames={totalHist(e)} fps={30} width={1080} height={1920} />
        <Composition id={`Capa-${e}`} component={BielHistCapa} defaultProps={{ep: e}} durationInFrames={1} fps={30} width={1080} height={1920} />
      </React.Fragment>
    ))}
  </>
);
