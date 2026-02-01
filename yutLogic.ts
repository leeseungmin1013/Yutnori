
import { YutResult } from './types';

/**
 * 윷 던지기 시뮬레이션
 * 4개의 윷가락 (true: 배/앞면, false: 등/뒷면)
 *
 * 규칙:
 * - 배 1개 = 도 (1칸)
 * - 배 2개 = 개 (2칸)
 * - 배 3개 = 걸 (3칸)
 * - 배 4개 = 윷 (4칸, 한번 더)
 * - 배 0개 = 모 (5칸, 한번 더)
 * - 빽도: 배 1개이고 그것이 4번째 막대(마킹된 막대)일 때 (-1칸)
 */
export const throwYut = (): { result: YutResult; sticks: boolean[] } => {
  // 4개의 독립적인 윷 막대 시뮬레이션
  const sticks = [
    Math.random() < 0.5,
    Math.random() < 0.5,
    Math.random() < 0.5,
    Math.random() < 0.5
  ];

  // 배면(앞면)이 위로 온 개수
  const bellyCount = sticks.filter(s => s).length;

  let result: YutResult;

  if (bellyCount === 0) {
    // 모: 모두 등
    result = YutResult.MO;
  } else if (bellyCount === 1) {
    // 도 또는 빽도: 배 1개
    // 빽도 조건: 4번째 막대(인덱스 3)만 배면일 때
    if (sticks[3] === true && sticks[0] === false && sticks[1] === false && sticks[2] === false) {
      result = YutResult.BACK_DO;
    } else {
      result = YutResult.DO;
    }
  } else if (bellyCount === 2) {
    result = YutResult.GAE;
  } else if (bellyCount === 3) {
    result = YutResult.GEOL;
  } else {
    // bellyCount === 4
    result = YutResult.YUT;
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
