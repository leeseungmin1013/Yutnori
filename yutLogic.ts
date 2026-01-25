
import { YutResult } from './types';

/**
 * 윷 던지기 시뮬레이션
 * 4개의 윷가락 (true: 배, false: 등)
 */
export const throwYut = (): { result: YutResult; sticks: boolean[] } => {
  const sticks = [Math.random() < 0.5, Math.random() < 0.5, Math.random() < 0.5, Math.random() < 0.5];
  const bellyCount = sticks.filter(s => s).length;
  
  // Specific marked stick for Back-do (assume the first stick is the marked one)
  const isBackDo = bellyCount === 1 && sticks[0] === true && Math.random() < 0.25; // 25% chance of Back-do when 1 belly is up

  let result: YutResult;
  if (isBackDo) {
    result = YutResult.BACK_DO;
  } else if (bellyCount === 1) {
    result = YutResult.DO;
  } else if (bellyCount === 2) {
    result = YutResult.GAE;
  } else if (bellyCount === 3) {
    result = YutResult.GEOL;
  } else if (bellyCount === 4) {
    result = YutResult.YUT;
  } else {
    result = YutResult.MO;
  }

  return { result, sticks };
};

export const getYutDistance = (result: YutResult): number => {
  switch (result) {
    case YutResult.BACK_DO: return -1;
    case YutResult.DO: return 1;
    case YutResult.GAE: return 2;
    case YutResult.GEOL: return 3;
    case YutResult.YUT: return 4;
    case YutResult.MO: return 5;
    default: return 0;
  }
};

export const isExtraTurnResult = (result: YutResult): boolean => {
  return result === YutResult.YUT || result === YutResult.MO;
};
