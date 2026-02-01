import React, { useState, useEffect, useRef } from 'react';
import { YutResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getYutResultLabel } from '../i18n';
import soundManager from '../utils/SoundManager';

interface ThrowingSceneProps {
  targetSticks: boolean[];
  result: YutResult;
  teamColor: string;
  onComplete: () => void;
}

const ThrowingScene: React.FC<ThrowingSceneProps> = ({
  targetSticks,
  result,
  teamColor,
  onComplete
}) => {
  const { lang, t } = useLanguage();
  const [revealedCount, setRevealedCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    // 던지기 시작 사운드
    soundManager.play('throw');

    // 순차적으로 막대 공개
    const timers: NodeJS.Timeout[] = [];

    // 각 막대 공개 (0.5초 간격) + 착지 사운드
    for (let i = 0; i < 4; i++) {
      timers.push(setTimeout(() => {
        setRevealedCount(i + 1);
        soundManager.play('stick_land');
      }, 500 + i * 500));
    }

    // 모든 막대 공개 후 결과 표시 (2.5초 후)
    timers.push(setTimeout(() => {
      setShowResult(true);
      // 윷/모 특별 사운드
      if (result === YutResult.YUT || result === YutResult.MO) {
        soundManager.play('yut_mo');
      }
    }, 2500));

    // 결과 표시 후 완료 콜백 (4초 후)
    timers.push(setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, 4000));

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [onComplete, result]);

  const isSpecialResult = result === YutResult.YUT || result === YutResult.MO;
  const isBackDo = result === YutResult.BACK_DO;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-hidden">
      {/* 배경 이펙트 */}
      <div
        className="absolute inset-0 animate-[fadeIn_0.3s_ease-out]"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${teamColor}30 0%, transparent 60%)`
        }}
      />

      <div className="relative w-full max-w-xl px-4">
        {/* 윷 막대 컨테이너 */}
        <div className="flex justify-center items-end gap-4 mb-12">
          {targetSticks.map((isBelly, index) => (
            <YutStick
              key={index}
              index={index}
              isBelly={isBelly}
              isRevealed={index < revealedCount}
              isMarked={index === 3}
              teamColor={teamColor}
            />
          ))}
        </div>

        {/* 결과 표시 */}
        {showResult && (
          <div className="text-center animate-[bounceIn_0.6s_cubic-bezier(0.68,-0.55,0.265,1.55)]">
            {/* 파티클 효과 */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(isSpecialResult ? 20 : 8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-[particle_1.5s_ease-out_forwards]"
                  style={{
                    left: '50%',
                    top: '50%',
                    fontSize: isSpecialResult ? '2rem' : '1.5rem',
                    animationDelay: `${i * 0.05}s`,
                    transform: `rotate(${i * (360 / (isSpecialResult ? 20 : 8))}deg) translateY(-80px)`,
                  }}
                >
                  {isBackDo ? ['💨', '😅'][i % 2] :
                    isSpecialResult ? ['🎉', '🎊', '✨', '⭐', '🌟'][i % 5] : ['✨', '⭐'][i % 2]}
                </div>
              ))}
            </div>

            {/* 원형 링 이펙트 */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4 animate-[ringExpand_1s_ease-out_forwards]"
              style={{ borderColor: teamColor }}
            />

            {/* 메인 결과 텍스트 */}
            <div className="relative">
              <h1
                className="absolute inset-0 text-8xl font-black blur-lg animate-[pulse_0.5s_ease-in-out_infinite]"
                style={{ color: teamColor, opacity: 0.7 }}
              >
                {getYutResultLabel(result, lang)}
              </h1>
              <h1
                className="relative text-8xl font-black"
                style={{
                  color: isBackDo ? '#ef4444' : teamColor,
                  WebkitTextStroke: '2px white',
                  textShadow: `
                    0 0 20px ${isBackDo ? '#ef4444' : teamColor},
                    0 0 40px ${isBackDo ? '#ef4444' : teamColor},
                    0 4px 0 rgba(0,0,0,0.3)
                  `,
                }}
              >
                {getYutResultLabel(result, lang)}
              </h1>

              {/* 특별 결과 메시지 */}
              {isSpecialResult && (
                <p
                  className="mt-4 text-xl font-bold animate-[fadeInUp_0.5s_ease-out_0.3s_both]"
                  style={{ color: 'white', textShadow: `0 0 10px ${teamColor}` }}
                >
                  🎯 {t.oneMoreThrow}
                </p>
              )}
              {isBackDo && (
                <p
                  className="mt-4 text-xl font-bold animate-[fadeInUp_0.5s_ease-out_0.3s_both] text-red-400"
                  style={{ textShadow: '0 0 10px #ef4444' }}
                >
                  💨 {lang === 'ko' ? '뒤로 한 칸!' : 'Move back one!'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 개별 윷 막대 컴포넌트
interface YutStickProps {
  index: number;
  isBelly: boolean;
  isRevealed: boolean;
  isMarked: boolean;
  teamColor: string;
}

const YutStick: React.FC<YutStickProps> = ({
  index,
  isBelly,
  isRevealed,
  isMarked,
  teamColor
}) => {
  return (
    <div
      className="relative"
      style={{
        animationDelay: `${index * 0.1}s`
      }}
    >
      {/* 막대 본체 */}
      <div
        className={`
          relative w-12 h-40 rounded-lg transition-all duration-500
          ${isRevealed ? '' : 'animate-[spin_0.3s_linear_infinite]'}
        `}
        style={{
          transformStyle: 'preserve-3d',
          transform: isRevealed ? (isBelly ? 'rotateY(0deg)' : 'rotateY(180deg)') : undefined
        }}
      >
        {/* 배면 (앞면) */}
        <div
          className={`
            absolute inset-0 rounded-lg flex items-center justify-center
            transition-all duration-300
            ${isRevealed && isBelly ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            background: `linear-gradient(180deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)`,
            boxShadow: `
              inset 0 2px 10px rgba(255,255,255,0.5),
              inset 0 -2px 10px rgba(0,0,0,0.1),
              0 4px 15px rgba(0,0,0,0.3)
            `,
            border: '2px solid #d97706'
          }}
        >
          {/* 배면 무늬 - 마킹 막대는 X 패턴, 일반 막대는 동그라미 */}
          {isMarked ? (
            <div className="absolute inset-0 flex flex-col items-center justify-around py-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="text-amber-800/70 font-black text-lg"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                >
                  ✕
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-700/30" />
              <div className="w-4 h-4 rounded-full bg-amber-700/20" />
            </div>
          )}
        </div>

        {/* 등면 (뒷면) - 둥근 면 */}
        <div
          className={`
            absolute inset-0 rounded-lg flex items-center justify-center
            transition-all duration-300
            ${isRevealed && !isBelly ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            background: `linear-gradient(180deg, #a16207 0%, #854d0e 50%, #713f12 100%)`,
            boxShadow: `
              inset 0 2px 15px rgba(255,255,255,0.2),
              inset 0 -5px 15px rgba(0,0,0,0.3),
              0 4px 15px rgba(0,0,0,0.4)
            `,
            border: '2px solid #451a03',
            borderRadius: '0.5rem 0.5rem 2rem 2rem'
          }}
        >
          {/* 등면 - 마킹 막대는 X 패턴, 일반 막대는 나무결 */}
          {isMarked ? (
            <div className="absolute inset-0 flex flex-col items-center justify-around py-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="font-black text-lg"
                  style={{ color: '#fbbf24', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                >
                  ✕
                </div>
              ))}
            </div>
          ) : (
            <div className="absolute inset-2 opacity-30">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-full h-0.5 bg-amber-950/50 mb-3"
                  style={{ marginTop: i * 8 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 회전 중 표시 */}
        {!isRevealed && (
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background: `linear-gradient(90deg, #a16207 0%, #fde68a 50%, #a16207 100%)`,
              boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
              border: '2px solid #78350f'
            }}
          />
        )}
      </div>

      {/* 막대 번호 표시 */}
      <div
        className={`
          mt-2 text-center text-sm font-bold transition-all duration-300
          ${isRevealed ? 'opacity-100' : 'opacity-50'}
        `}
        style={{ color: isMarked ? '#fbbf24' : 'white' }}
      >
        {index + 1}
        {isMarked && <span className="ml-1">✕</span>}
      </div>

      {/* 결과 표시 - 배/등 글자 */}
      {isRevealed && (
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 animate-[bounceIn_0.3s_ease-out]"
        >
          <span
            className={`
              px-2 py-1 rounded-lg font-black text-lg
              ${isBelly
                ? 'bg-amber-400 text-amber-900'
                : 'bg-amber-900 text-amber-200'
              }
            `}
            style={{
              boxShadow: isBelly
                ? '0 2px 8px rgba(251, 191, 36, 0.5)'
                : '0 2px 8px rgba(0, 0, 0, 0.4)'
            }}
          >
            {isBelly ? '배' : '등'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ThrowingScene;
