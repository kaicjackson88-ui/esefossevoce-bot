import React from 'react';
import {Composition} from 'remotion';
import {BielHist, BielHistCapa, totalHist} from './BielHist';
import {EPS} from './eps';

export const Root: React.FC = () => (
  <>
    {Object.keys(EPS).map((e) => (
      <React.Fragment key={e}>
        <Composition id={`Hist-${e}`} component={BielHist} defaultProps={{ep: e}} durationInFrames={totalHist(e)} fps={30} width={1080} height={1920} />
        <Composition id={`Capa-${e}`} component={BielHistCapa} defaultProps={{ep: e}} durationInFrames={1} fps={30} width={1080} height={1920} />
      </React.Fragment>
    ))}
  </>
);
