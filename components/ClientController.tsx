
import React, { useState, useEffect, useCallback } from 'react';
import { Room } from '../types';
import { useMotionDetector } from '../hooks/useMotionDetector';
import { useLanguage } from '../contexts/LanguageContext';

interface ClientControllerProps {
  room: Room;
  playerId: string;
  onSubmitSignal: (teamIndex: number) => Promise<void>;
  onLeave: () => void;
}

const ClientController: React.FC<ClientControllerProps> = ({
  room,
  playerId,
  onSubmitSignal,
  onLeave
}) => {
  const { lang, t } = useLanguage();
  const { motionState, requestPermission, startDetecting, stopDetecting, onThrowDetected } = useMotionDetector();
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [throwMode, setThrowMode] = useState<'motion' | 'button'>('button');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPlayer = room.players?.[playerId];
  const myTeamIndex = currentPlayer?.teamIndex ?? -1;
  const throwRequest = room.throwRequest;

  // 내 차례인지 확인 (throwRequest가 있고 내 팀 인덱스와 일치할 때만)
  useEffect(() => {
    const isCurrentlyMyTurn = throwRequest &&
                              throwRequest.teamIndex === myTeamIndex &&
                              myTeamIndex >= 0;

    if (isCurrentlyMyTurn && !isMyTurn) {
      // 새로운 턴 시작
      setIsMyTurn(true);
      setIsSubmitting(false);
    } else if (!isCurrentlyMyTurn && isMyTurn) {
      // 턴 종료
      setIsMyTurn(false);
    }
  }, [throwRequest, myTeamIndex, isMyTurn]);

  // 모션 감지 시 신호 전송
  useEffect(() => {
    onThrowDetected(() => {
      handleSubmitSignal();
    });
  }, [onThrowDetected, myTeamIndex]);

  // 신호 전송 (호스트가 실제 결과 생성)
  const handleSubmitSignal = useCallback(async () => {
    // 내 턴이 아니거나 이미 전송 중이면 무시
    if (!isMyTurn || isSubmitting || myTeamIndex < 0) {
      console.warn('Cannot submit signal: not my turn or already submitting');
      return;
    }

    // throwRequest가 없거나 내 팀이 아니면 무시
    if (!throwRequest || throwRequest.teamIndex !== myTeamIndex) {
      console.warn('Cannot submit signal: no throw request for my team');
      return;
    }

    setIsSubmitting(true);
    stopDetecting();

    try {
      await onSubmitSignal(myTeamIndex);
      setIsMyTurn(false);
    } catch (err) {
      console.error('Signal submit failed:', err);
      setIsSubmitting(false);
    }
  }, [onSubmitSignal, myTeamIndex, isSubmitting, stopDetecting, isMyTurn, throwRequest]);

  // 버튼으로 던지기
  const handleButtonThrow = () => {
    if (!isMyTurn || isSubmitting) return;
    handleSubmitSignal();
  };

  // 모션으로 던지기 시작
  const handleStartMotionThrow = async () => {
    if (!isMyTurn || isSubmitting) return;

    if (!motionState.hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        alert(lang === 'ko' ? '모션 센서 권한이 필요합니다. 버튼 모드를 사용해주세요.' : 'Motion sensor permission required. Please use button mode.');
        setThrowMode('button');
        return;
      }
    }
    startDetecting();
  };

  const teamSettings = (room as any)?.teamSettings || [];
  const myTeam = teamSettings[myTeamIndex];
  const currentTurnTeam = room.gameState?.teams?.[room.gameState.currentTeamIndex];

  return (
    <div className="min-h-screen flex flex-col bg-stone-100">
      {/* 헤더 */}
      <div className="bg-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {myTeam && (
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: myTeam.color }}
              />
            )}
            <span className="font-bold">{currentPlayer?.name}</span>
          </div>
          <button
            onClick={onLeave}
            className="text-sm text-stone-400 hover:text-red-500"
          >
            {t.leave}
          </button>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {isMyTurn ? (
          // 내 차례
          <div className="w-full max-w-sm">
            {motionState.isDetecting ? (
              // 모션 감지 중
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-green-100 border-4 border-green-500 flex items-center justify-center animate-pulse">
                  <span className="text-4xl">📱</span>
                </div>
                <p className="text-xl font-bold text-green-600 mb-2">
                  {lang === 'ko' ? '휴대폰을 흔드세요!' : 'Shake your phone!'}
                </p>
                <p className="text-stone-500 text-sm mb-6">
                  {lang === 'ko' ? '위아래로 힘차게 던지는 동작을 하세요' : 'Make a throwing motion up and down'}
                </p>
                <button
                  onClick={stopDetecting}
                  className="px-6 py-2 bg-stone-200 text-stone-600 rounded-xl"
                >
                  {t.cancel}
                </button>
              </div>
            ) : (
              // 던지기 선택
              <div className="text-center">
                <p className="text-2xl font-black mb-2" style={{ color: myTeam?.color }}>
                  {lang === 'ko' ? '당신의 차례입니다!' : "It's your turn!"}
                </p>
                <p className="text-stone-500 mb-8">
                  {lang === 'ko' ? '윷을 던져주세요' : 'Throw the yut'}
                </p>

                {/* 모드 선택 */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setThrowMode('button')}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                      throwMode === 'button'
                        ? 'bg-stone-800 text-white'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {lang === 'ko' ? '버튼' : 'Button'}
                  </button>
                  <button
                    onClick={() => setThrowMode('motion')}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                      throwMode === 'motion'
                        ? 'bg-stone-800 text-white'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {lang === 'ko' ? '모션' : 'Motion'}
                  </button>
                </div>

                {throwMode === 'button' ? (
                  <button
                    onClick={handleButtonThrow}
                    disabled={isSubmitting}
                    className="w-full py-8 bg-gradient-to-b from-stone-700 to-stone-900 text-white text-2xl font-black rounded-3xl shadow-xl active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {isSubmitting ? (lang === 'ko' ? '전송 중...' : 'Sending...') : t.throwYut}
                  </button>
                ) : (
                  <button
                    onClick={handleStartMotionThrow}
                    disabled={isSubmitting}
                    className="w-full py-8 bg-gradient-to-b from-green-500 to-green-700 text-white text-2xl font-black rounded-3xl shadow-xl active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {isSubmitting
                      ? (lang === 'ko' ? '전송 중...' : 'Sending...')
                      : (motionState.hasPermission
                          ? (lang === 'ko' ? '준비 완료 - 탭하세요' : 'Ready - Tap to start')
                          : (lang === 'ko' ? '모션 권한 허용' : 'Allow Motion')
                        )
                    }
                  </button>
                )}

                {throwMode === 'motion' && !motionState.isSupported && (
                  <p className="mt-4 text-sm text-red-500">
                    {lang === 'ko' ? '이 기기는 모션 센서를 지원하지 않습니다' : 'This device does not support motion sensors'}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          // 다른 팀 차례
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-stone-200 flex items-center justify-center">
              <span className="text-4xl">⏳</span>
            </div>
            <p className="text-xl font-bold text-stone-600 mb-2">
              {t.waiting}
            </p>
            {currentTurnTeam && (
              <p className="text-stone-500">
                <span style={{ color: currentTurnTeam.color, fontWeight: 'bold' }}>
                  {currentTurnTeam.name}
                </span>{t.yourTurn}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 게임 상태 미니뷰 */}
      {room.gameState && (
        <div className="bg-white p-4 border-t border-stone-200">
          <div className="flex justify-around">
            {room.gameState.teams.map((team, idx) => (
              <div key={team.id} className="text-center">
                <div
                  className={`w-8 h-8 mx-auto rounded-full border-2 ${
                    room.gameState?.currentTeamIndex === idx
                      ? 'border-stone-800 scale-110'
                      : 'border-transparent opacity-60'
                  }`}
                  style={{ backgroundColor: team.color }}
                />
                <p className="text-xs mt-1 text-stone-500">{team.finishedCount}/4</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientController;
