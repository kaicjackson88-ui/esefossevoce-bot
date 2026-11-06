import React from 'react';
import {Composition} from 'remotion';
import {BielHist, BielHistCapa, totalHist} from './BielHist';
import {EPS} from './eps';
import {AdTeste, AD_DUR} from './Motion';
import {AdV2, AD2_DUR} from './AdV2';

export const Root: React.FC = () => (
  <>
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
