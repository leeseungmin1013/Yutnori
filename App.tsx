
import React, { useState, useEffect, useCallback } from 'react';
import { YutResult, GameState, Team, GameMode } from './types';
import { throwYut, isExtraTurnResult } from './yutLogic';
import { calculateMove, canPieceMove } from './gameEngine';
import Board from './components/Board';
import YutControls from './components/YutControls';
import GameLog from './components/GameLog';
import GameSetup from './components/GameSetup';
import ModeSelect from './components/ModeSelect';
import HostLobby from './components/HostLobby';
import ClientJoin from './components/ClientJoin';
import ClientController from './components/ClientController';
import { useFirebaseRoom } from './hooks/useFirebaseRoom';

type AppPhase = 'mode-select' | 'setup' | 'host-lobby' | 'client-join' | 'client-playing' | 'playing';

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('local');
  const [appPhase, setAppPhase] = useState<AppPhase>('mode-select');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isThrowing, setIsThrowing] = useState(false);
  const [canThrowAgain, setCanThrowAgain] = useState(false);
  const [usedExtraThrow, setUsedExtraThrow] = useState(false); // 추가 던지기 사용 여부

  const firebase = useFirebaseRoom();

  // Firebase 룸 상태 변경 감지 (호스트)
  useEffect(() => {
    if (gameMode === 'host' && firebase.room?.throwResult && gameState) {
      // 클라이언트로부터 던지기 결과 수신
      const result = firebase.room.throwResult.result;
      handleThrowResult(result);
      firebase.clearThrowResult();
    }
  }, [firebase.room?.throwResult, gameMode]);

  // Firebase 게임 상태 동기화 (클라이언트)
  useEffect(() => {
    if (gameMode === 'client' && firebase.room?.status === 'playing') {
      if (appPhase === 'client-join') {
        setAppPhase('client-playing');
      }
      if (firebase.room.gameState) {
        setGameState(firebase.room.gameState);
      }
    }
  }, [firebase.room?.status, firebase.room?.gameState, gameMode, appPhase]);

  // 모드 선택
  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'local') {
      setAppPhase('setup');
    } else if (mode === 'host') {
      setAppPhase('host-lobby');
    } else if (mode === 'client') {
      setAppPhase('client-join');
    }
  };

  // 로컬 게임 시작
  const handleLocalStartGame = (selectedTeams: Team[]) => {
    setTeams(selectedTeams);
    setGameState({
      id: 'local-game',
      teams: selectedTeams,
      currentTeamIndex: 0,
      throwBuffer: [],
      turnBonus: 0,
      isGameOver: false,
      winnerTeamId: null,
      lastUpdate: Date.now(),
      logs: [`게임 시작! ${selectedTeams.length}팀이 참가합니다.`, `${selectedTeams[0].name} 팀의 차례입니다.`]
    });
    setAppPhase('playing');
    setCanThrowAgain(false);
  };

  // 호스트: 룸 생성
  const handleCreateRoom = async (selectedTeams: Team[]): Promise<string> => {
    setTeams(selectedTeams);
    return await firebase.createRoom(selectedTeams);
  };

  // 호스트: 게임 시작
  const handleHostStartGame = (selectedTeams: Team[]) => {
    const initialState: GameState = {
      id: firebase.room?.code || 'game',
      teams: selectedTeams,
      currentTeamIndex: 0,
      throwBuffer: [],
      turnBonus: 0,
      isGameOver: false,
      winnerTeamId: null,
      lastUpdate: Date.now(),
      logs: [`게임 시작! ${selectedTeams.length}팀이 참가합니다.`, `${selectedTeams[0].name} 팀의 차례입니다.`]
    };
    setTeams(selectedTeams);
    setGameState(initialState);
    firebase.startGame();
    firebase.updateGameState(initialState);
    setAppPhase('playing');

    // 첫 팀에게 던지기 요청
    firebase.requestThrow(0);
  };

  // 클라이언트: 참가
  const handleClientJoin = async (roomCode: string, playerName: string): Promise<boolean> => {
    return await firebase.joinRoom(roomCode, playerName);
  };

  // 클라이언트: 결과 제출
  const handleClientSubmitResult = async (result: YutResult) => {
    await firebase.submitThrowResult(result);
  };

  // 던지기 결과 처리 (호스트/로컬 공통)
  const handleThrowResult = useCallback((result: YutResult, isExtraThrow: boolean = false) => {
    if (!gameState) return;

    const hasExtraTurn = isExtraTurnResult(result);

    // 윷/모가 나왔고, 아직 추가 던지기를 사용하지 않은 경우에만 추가 던지기 허용
    if (hasExtraTurn && !isExtraThrow) {
      setCanThrowAgain(true);
    }

    setGameState(prev => {
      if (!prev) return prev;
      const newBuffer = [...(prev.throwBuffer || []), result];
      const extraMsg = (hasExtraTurn && !isExtraThrow) ? ' 한 번 더 던지세요!' : '';

      const newState = {
        ...prev,
        throwBuffer: newBuffer,
        logs: [...(prev.logs || []), `${prev.teams[prev.currentTeamIndex].name} 팀이 '${result}'을(를) 던졌습니다!${extraMsg}`]
      };

      // 호스트 모드면 Firebase 업데이트
      if (gameMode === 'host') {
        firebase.updateGameState(newState);
        // 추가 던지기 요청 (아직 추가 던지기를 사용하지 않은 경우만)
        if (hasExtraTurn && !isExtraThrow) {
          firebase.requestThrow(prev.currentTeamIndex);
        }
      }

      return newState;
    });

    setIsThrowing(false);
  }, [gameState, gameMode, firebase]);

  // 로컬 던지기
  const handleLocalThrow = () => {
    if (!gameState || gameState.isGameOver || isThrowing) return;

    const bufferLength = gameState.throwBuffer?.length ?? 0;
    const canThrow = bufferLength === 0 || canThrowAgain;
    if (!canThrow) return;

    // 추가 던지기를 사용하는 경우인지 확인
    const isUsingExtraThrow = canThrowAgain && bufferLength > 0;

    setIsThrowing(true);
    setCanThrowAgain(false);

    setTimeout(() => {
      const { result } = throwYut();
      handleThrowResult(result, isUsingExtraThrow);
    }, 600);
  };

  // 특정 결과로 이동 가능한 말이 있는지 확인
  const hasMovablePiece = useCallback((result: YutResult): boolean => {
    if (!gameState) return false;
    const currentTeam = gameState.teams[gameState.currentTeamIndex];
    return currentTeam.pieces.some(p => !p.isFinished && canPieceMove(p, result));
  }, [gameState]);

  // 결과 스킵 (이동 가능한 말이 없을 때)
  const handleSkipResult = (result: YutResult) => {
    if (!gameState) return;

    const newBuffer = [...(gameState.throwBuffer || [])];
    const resultIndex = newBuffer.indexOf(result);
    if (resultIndex > -1) {
      newBuffer.splice(resultIndex, 1);
    }

    let nextTeamIndex = gameState.currentTeamIndex;
    const newLogs = [...(gameState.logs || [])];
    newLogs.push(`'${result}'로 이동할 수 있는 말이 없어 스킵합니다.`);

    // 버퍼가 비었고 추가 던지기도 없으면 턴 넘김
    if (newBuffer.length === 0 && !canThrowAgain) {
      nextTeamIndex = (gameState.currentTeamIndex + 1) % gameState.teams.length;
      newLogs.push(`${gameState.teams[nextTeamIndex].name} 팀의 차례입니다.`);
      setCanThrowAgain(false);
    }

    const newState = {
      ...gameState,
      currentTeamIndex: nextTeamIndex,
      throwBuffer: newBuffer,
      logs: newLogs,
      lastUpdate: Date.now()
    };

    setGameState(newState);

    if (gameMode === 'host') {
      firebase.updateGameState(newState);
      if (newBuffer.length === 0 && !canThrowAgain) {
        firebase.requestThrow(nextTeamIndex);
      }
    }
  };

  // 말 이동 (호스트/로컬 공통)
  const handlePieceMove = (pieceId: string, result: YutResult) => {
    if (!gameState || gameState.isGameOver) return;

    // 이동 가능 여부 확인
    const currentTeam = gameState.teams[gameState.currentTeamIndex];
    const piece = currentTeam.pieces.find(p => p.id === pieceId);
    if (piece && !canPieceMove(piece, result)) {
      // 이 말은 이 결과로 이동할 수 없음
      return;
    }

    const { updatedGameState, caughtEnemy } = calculateMove(gameState, pieceId, result);

    const newBuffer = [...(updatedGameState.throwBuffer || [])];
    const resultIndex = newBuffer.indexOf(result);
    if (resultIndex > -1) {
      newBuffer.splice(resultIndex, 1);
    }

    let nextTeamIndex = updatedGameState.currentTeamIndex;

    if (caughtEnemy) {
      setCanThrowAgain(true);
    }

    if (newBuffer.length === 0 && !caughtEnemy && !canThrowAgain) {
      nextTeamIndex = (updatedGameState.currentTeamIndex + 1) % updatedGameState.teams.length;
      if (!updatedGameState.logs) updatedGameState.logs = [];
      updatedGameState.logs.push(`${updatedGameState.teams[nextTeamIndex].name} 팀의 차례입니다.`);
      setCanThrowAgain(false);
    }

    const newState = {
      ...updatedGameState,
      currentTeamIndex: nextTeamIndex,
      throwBuffer: newBuffer,
      lastUpdate: Date.now()
    };

    setGameState(newState);

    // 호스트 모드면 Firebase 업데이트 및 다음 던지기 요청
    if (gameMode === 'host') {
      firebase.updateGameState(newState);

      if (!newState.isGameOver && newBuffer.length === 0) {
        const needsThrow = canThrowAgain || caughtEnemy;
        if (needsThrow) {
          firebase.requestThrow(nextTeamIndex);
        }
      }
    }
  };

  // 게임 초기화
  const resetGame = () => {
    if (!gameState) return;

    const resetTeams = gameState.teams.map(team => ({
      ...team,
      finishedCount: 0,
      pieces: team.pieces.map(p => ({
        ...p,
        nodeIndex: null,
        isFinished: false,
        stackedCount: 1,
        stackedPieceIds: [],
        currentPath: 'outer' as const,
      }))
    }));

    const newState = {
      ...gameState,
      teams: resetTeams,
      currentTeamIndex: 0,
      throwBuffer: [],
      turnBonus: 0,
      isGameOver: false,
      winnerTeamId: null,
      lastUpdate: Date.now(),
      logs: ['게임을 초기화했습니다.', `${resetTeams[0].name} 팀의 차례입니다.`]
    };

    setGameState(newState);
    setCanThrowAgain(false);

    if (gameMode === 'host') {
      firebase.updateGameState(newState);
      firebase.requestThrow(0);
    }
  };

  // 뒤로가기
  const handleBack = () => {
    if (gameMode === 'host') {
      firebase.closeRoom();
    } else if (gameMode === 'client') {
      firebase.leaveRoom();
    }
    setAppPhase('mode-select');
    setGameMode('local');
    setGameState(null);
    setTeams([]);
  };

  // 던지기 가능 여부
  const canThrow = gameState && !gameState.isGameOver && !isThrowing && (
    (gameState.throwBuffer?.length ?? 0) === 0 || canThrowAgain
  );

  // === 렌더링 ===

  // 모드 선택
  if (appPhase === 'mode-select') {
    return <ModeSelect onSelectMode={handleModeSelect} />;
  }

  // 로컬 게임 설정
  if (appPhase === 'setup' && gameMode === 'local') {
    return <GameSetup onStartGame={handleLocalStartGame} />;
  }

  // 호스트 대기실
  if (appPhase === 'host-lobby' && gameMode === 'host') {
    return (
      <HostLobby
        room={firebase.room}
        roomCode={firebase.room?.code || null}
        loading={firebase.loading}
        error={firebase.error}
        onCreateRoom={handleCreateRoom}
        onStartGame={handleHostStartGame}
        onClose={handleBack}
      />
    );
  }

  // 클라이언트 참가
  if (appPhase === 'client-join' && gameMode === 'client') {
    return (
      <ClientJoin
        room={firebase.room}
        playerId={firebase.playerId}
        loading={firebase.loading}
        error={firebase.error}
        onJoin={handleClientJoin}
        onSelectTeam={firebase.selectTeam}
        onLeave={handleBack}
        onReady={() => setAppPhase('client-playing')}
      />
    );
  }

  // 클라이언트 게임 중
  if (appPhase === 'client-playing' && gameMode === 'client' && firebase.room) {
    return (
      <ClientController
        room={firebase.room}
        playerId={firebase.playerId}
        onSubmitResult={handleClientSubmitResult}
        onLeave={handleBack}
      />
    );
  }

  // 게임 플레이 화면 (로컬/호스트)
  if (appPhase === 'playing' && gameState) {
    const currentTeam = gameState.teams[gameState.currentTeamIndex];

    return (
      <div className="min-h-screen flex flex-col items-center justify-start p-4 md:p-8 gap-6">
        <header className="text-center">
          <h1 className="text-4xl font-black text-stone-800 tracking-tight mb-2">
            KOREAN <span className="text-red-600">YUT</span>NORI
          </h1>
          <p className="text-stone-500 font-medium italic">
            {gameMode === 'host' && firebase.room?.code && (
              <span className="bg-stone-800 text-white px-3 py-1 rounded-lg text-sm mr-2">
                코드: {firebase.room.code}
              </span>
            )}
            Traditional Real-time Board Game
          </p>
        </header>

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Game Info & Log */}
          <div className="lg:col-span-3 flex flex-col gap-4 order-2 lg:order-1">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-stone-200">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                게임 상태
              </h2>
              <div className="space-y-3">
                {gameState.teams.map((team, idx) => (
                  <div
                    key={team.id}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      gameState.currentTeamIndex === idx
                        ? 'border-stone-800 bg-stone-50 scale-105 shadow-md'
                        : 'border-transparent opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold flex items-center gap-2" style={{ color: team.color }}>
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }} />
                        {team.name}
                      </span>
                      <span className="text-xs font-mono bg-stone-200 px-2 py-0.5 rounded uppercase">
                        {gameState.currentTeamIndex === idx ? 'Playing' : 'Waiting'}
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          backgroundColor: team.color,
                          width: `${(team.finishedCount / 4) * 100}%`
                        }}
                      />
                    </div>
                    <p className="text-xs mt-1 text-stone-500 text-right">
                      완료: {team.finishedCount} / 4
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <GameLog logs={gameState.logs || []} />

            <div className="flex flex-col gap-2">
              <button
                onClick={resetGame}
                className="text-sm text-stone-400 hover:text-stone-600 transition-colors py-2"
              >
                게임 초기화
              </button>
              <button
                onClick={handleBack}
                className="text-sm text-stone-400 hover:text-red-500 transition-colors py-2"
              >
                {gameMode === 'host' ? '방 닫기' : '메인으로'}
              </button>
            </div>
          </div>

          {/* Center: Board */}
          <div className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
            <Board
              gameState={gameState}
              onPieceMove={handlePieceMove}
              onSkipResult={handleSkipResult}
            />
          </div>

          {/* Right: Controls */}
          <div className="lg:col-span-3 flex flex-col gap-4 order-3">
            {gameMode === 'local' ? (
              <YutControls
                currentTeam={currentTeam}
                throwBuffer={gameState.throwBuffer || []}
                onThrow={handleLocalThrow}
                isThrowing={isThrowing}
                isGameOver={gameState.isGameOver}
                canThrow={canThrow || false}
              />
            ) : (
              // 호스트 모드: 클라이언트 대기 표시
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-stone-200">
                <h3 className="text-lg font-bold mb-4 text-center">
                  {currentTeam.name} 팀 차례
                </h3>
                <div className="text-center py-8">
                  {(gameState.throwBuffer?.length ?? 0) === 0 ? (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center animate-pulse">
                        <span className="text-2xl">📱</span>
                      </div>
                      <p className="text-stone-500">참가자가 윷을 던지는 중...</p>
                    </>
                  ) : (
                    <>
                      <p className="text-stone-600 mb-2">던진 결과:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {(gameState.throwBuffer || []).map((res, i) => (
                          <span
                            key={i}
                            className="px-4 py-2 bg-stone-100 text-stone-800 rounded-lg font-black"
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-stone-400 mt-4">말을 선택하세요</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {gameState.isGameOver && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
                  <div className="text-6xl mb-6">🏆</div>
                  <h2 className="text-3xl font-black mb-2">승리!</h2>
                  <p className="text-lg text-stone-600 mb-8">
                    <span
                      className="font-bold underline decoration-4 underline-offset-4"
                      style={{ color: gameState.teams.find(t => t.id === gameState.winnerTeamId)?.color }}
                    >
                      {gameState.teams.find(t => t.id === gameState.winnerTeamId)?.name}
                    </span> 팀이 영광의 승리를 차지했습니다!
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={resetGame}
                      className="w-full py-4 bg-stone-900 text-white font-bold rounded-2xl hover:bg-stone-800"
                    >
                      다시 시작
                    </button>
                    <button
                      onClick={handleBack}
                      className="w-full py-3 bg-stone-100 text-stone-600 font-bold rounded-2xl hover:bg-stone-200"
                    >
                      메인으로
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-auto pt-12 pb-6 text-stone-400 text-sm">
          &copy; 2024 Traditional Yutnori
        </footer>
      </div>
    );
  }

  // 기본 로딩
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <p className="text-stone-500">로딩 중...</p>
    </div>
  );
};

export default App;
