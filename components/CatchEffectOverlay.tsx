import React, { useState, useEffect } from 'react';
import { Team } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import soundManager from '../utils/SoundManager';

interface CatchEffectOverlayProps {
  predatorTeam: Team;
  preyTeam: Team;
  count: number;
  onComplete: () => void;
}

const CatchEffectOverlay: React.FC<CatchEffectOverlayProps> = ({
  predatorTeam,
  preyTeam,
  count,
  onComplete
}) => {
  const { lang } = useLanguage();
  const [phase, setPhase] = useState<'impact' | 'catch' | 'reward'>('impact');

  useEffect(() => {
    // 잡기 임팩트 사운드
    soundManager.play('catch');

    const timers: NodeJS.Timeout[] = [];

    // Phase 1: Impact (0-800ms)
    // Phase 2: Catch (800-1800ms)
    timers.push(setTimeout(() => setPhase('catch'), 800));

    // Phase 3: Reward (1800-2500ms)
    timers.push(setTimeout(() => {
      setPhase('reward');
      soundManager.play('yut_mo'); // 보상 사운드
    }, 1800));

    // Complete (2500ms)
    timers.push(setTimeout(() => onComplete(), 2500));

    return () => timers.forEach(t => clearTimeout(t));
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden ${phase === 'impact' ? 'animate-[shake_0.5s_ease-in-out]' : ''
        }`}
    >
      {/* Phase 1: Impact - 배경 폭발 효과 */}
      {phase === 'impact' && (
        <>
          {/* 공격적인 배경 확장 */}
          <div
            className="absolute inset-0 animate-[fadeIn_0.2s_ease-out]"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${predatorTeam.color} 0%, ${predatorTeam.color}90 30%, rgba(0,0,0,0.9) 70%)`
            }}
          />

          {/* 충격파 링 */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-32 h-32 rounded-full border-8 animate-[ringExpand_0.8s_ease-out_forwards]"
              style={{
                borderColor: predatorTeam.color,
                animationDelay: `${i * 0.15}s`,
                opacity: 1 - i * 0.3
              }}
            />
          ))}

          {/* BANG 텍스트 */}
          <div className="relative">
            <h1
              className="text-8xl font-black animate-[bounceIn_0.4s_cubic-bezier(0.68,-0.55,0.265,1.55)]"
              style={{
                color: 'white',
                WebkitTextStroke: `4px ${predatorTeam.color}`,
                textShadow: `
                  0 0 30px ${predatorTeam.color},
                  0 0 60px ${predatorTeam.color},
                  0 6px 0 rgba(0,0,0,0.4)
                `,
                filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))'
              }}
            >
              BANG!
            </h1>
          </div>

          {/* 스파크 효과 */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-[particle_0.6s_ease-out_forwards]"
              style={{
                left: '50%',
                top: '50%',
                fontSize: '2rem',
                animationDelay: `${i * 0.03}s`,
                transform: `rotate(${i * 30}deg) translateY(-60px)`,
              }}
            >
              💥
            </div>
          ))}
        </>
      )}

      {/* Phase 2: Catch - 잡기 애니메이션 */}
      {phase === 'catch' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${predatorTeam.color}40 0%, rgba(0,0,0,0.85) 50%, ${preyTeam.color}20 100%)`
            }}
          />

          {/* 포식자 말 */}
          <div
            className="absolute animate-[smashIn_0.5s_cubic-bezier(0.36,0.07,0.19,0.97)_forwards]"
            style={{
              left: '30%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-2xl"
              style={{
                backgroundColor: predatorTeam.color,
                boxShadow: `0 0 40px ${predatorTeam.color}, 0 0 80px ${predatorTeam.color}50`
              }}
            >
              {predatorTeam.name.charAt(0)}
            </div>
          </div>

          {/* VS 또는 화살표 */}
          <div className="absolute text-6xl font-black text-white animate-[pulse_0.3s_ease-in-out_infinite]">
            ➔
          </div>

          {/* 피식자 말 - 산산조각 */}
          <div
            className="absolute animate-[shatter_0.5s_ease-out_forwards]"
            style={{
              left: '70%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-xl relative"
              style={{
                backgroundColor: preyTeam.color,
                opacity: 0.8
              }}
            >
              {preyTeam.name.charAt(0)}
              {/* 글리치 효과 */}
              <div className="absolute inset-0 rounded-full animate-[glitch_0.2s_ease-in-out_infinite]"
                style={{ backgroundColor: preyTeam.color, opacity: 0.5 }}
              />
            </div>
            {/* 파편 */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 rounded-sm"
                style={{
                  backgroundColor: preyTeam.color,
                  left: '50%',
                  top: '50%',
                  animation: `scatter${i} 0.5s ease-out forwards`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>

          {/* 잡기 텍스트 */}
          <div className="absolute bottom-1/4 text-center animate-[fadeInUp_0.4s_ease-out_0.3s_both]">
            <p className="text-3xl font-black text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {lang === 'ko' ? (
                <>
                  <span style={{ color: preyTeam.color }}>{preyTeam.name}</span>
                  <span className="mx-2">{count > 1 ? `${count}개를` : '을(를)'}</span>
                  <span className="text-red-400">잡았다!</span>
                </>
              ) : (
                <>
                  <span className="text-red-400">Caught </span>
                  <span style={{ color: preyTeam.color }}>{preyTeam.name}</span>
                  <span>{count > 1 ? ` x${count}` : ''}!</span>
                </>
              )}
            </p>
          </div>
        </>
      )}

      {/* Phase 3: Reward - 보상 */}
      {phase === 'reward' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${predatorTeam.color}50 0%, rgba(0,0,0,0.8) 70%)`
            }}
          />

          {/* 파티클 폭발 */}
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-[particle_1s_ease-out_forwards]"
              style={{
                left: '50%',
                top: '50%',
                fontSize: '1.5rem',
                animationDelay: `${i * 0.03}s`,
                transform: `rotate(${i * 22.5}deg) translateY(-100px)`,
              }}
            >
              {['🎯', '✨', '⭐', '🔥'][i % 4]}
            </div>
          ))}

          {/* 원형 링 */}
          <div
            className="absolute w-48 h-48 rounded-full border-4 animate-[ringExpand_0.8s_ease-out_forwards]"
            style={{ borderColor: predatorTeam.color }}
          />

          {/* 보상 텍스트 */}
          <div className="relative text-center">
            <h1
              className="text-6xl font-black animate-[pulse_0.4s_ease-in-out_infinite]"
              style={{
                color: predatorTeam.color,
                WebkitTextStroke: '2px white',
                textShadow: `
                  0 0 20px ${predatorTeam.color},
                  0 0 40px ${predatorTeam.color},
                  0 4px 0 rgba(0,0,0,0.3)
                `
              }}
            >
              {lang === 'ko' ? '한 번 더!' : 'One More!'}
            </h1>
            <p
              className="mt-4 text-xl font-bold text-white animate-[fadeInUp_0.3s_ease-out_both]"
              style={{ textShadow: `0 0 10px ${predatorTeam.color}` }}
            >
              🎯 {lang === 'ko' ? '추가 던지기 기회!' : 'Extra throw chance!'}
            </p>
          </div>
        </>
      )}

      {/* 커스텀 애니메이션 스타일 */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        @keyframes smashIn {
          0% { transform: translate(-200%, -50%) scale(2); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(20%, -50%) scale(1); opacity: 1; }
        }

        @keyframes shatter {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        }

        @keyframes scatter0 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + 70px), calc(-50% - 60px)) scale(0) rotate(720deg); opacity: 0; }
        }
        @keyframes scatter1 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% - 80px), calc(-50% + 50px)) scale(0) rotate(720deg); opacity: 0; }
        }
        @keyframes scatter2 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + 60px), calc(-50% + 70px)) scale(0) rotate(720deg); opacity: 0; }
        }
        @keyframes scatter3 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% - 55px), calc(-50% - 75px)) scale(0) rotate(720deg); opacity: 0; }
        }
        @keyframes scatter4 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + 85px), calc(-50% + 40px)) scale(0) rotate(720deg); opacity: 0; }
        }
        @keyframes scatter5 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% - 70px), calc(-50% - 55px)) scale(0) rotate(720deg); opacity: 0; }
        }
        @keyframes scatter6 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + 50px), calc(-50% - 80px)) scale(0) rotate(720deg); opacity: 0; }
        }
        @keyframes scatter7 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% - 65px), calc(-50% + 65px)) scale(0) rotate(720deg); opacity: 0; }
        }

        @keyframes glitch {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-3px, 2px); }
          50% { transform: translate(3px, -2px); }
          75% { transform: translate(-2px, -3px); }
        }
      `}</style>
    </div>
  );
};

export default CatchEffectOverlay;
