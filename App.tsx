
import React, { useState, useEffect, useCallback } from 'react';
import { YutResult, GameState, Team, Piece, TeamId } from './types';
import { throwYut, isExtraTurnResult } from './yutLogic';
import { calculateMove } from './gameEngine';
import Board from './components/Board';
import YutControls from './components/YutControls';
import GameLog from './components/GameLog';

const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: '청룡',
    color: '#3b82f6',
    finishedCount: 0,
    pieces: Array.from({ length: 4 }).map((_, i) => ({
      id: `t1-p${i}`,
      teamId: 'team-1',
      nodeIndex: null,
      isFinished: false,
      stackedCount: 1,
      stackedPieceIds: []
    }))
  },
  {
    id: 'team-2',
    name: '백호',
    color: '#ef4444',
    finishedCount: 0,
    pieces: Array.from({ length: 4 }).map((_, i) => ({
      id: `t2-p${i}`,
      teamId: 'team-2',
      nodeIndex: null,
      isFinished: false,
      stackedCount: 1,
      stackedPieceIds: []
    }))
  }
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    id: 'local-game',
    teams: INITIAL_TEAMS,
    currentTeamIndex: 0,
    throwBuffer: [],
    turnBonus: 0,
    isGameOver: false,
    winnerTeamId: null,
    lastUpdate: Date.now(),
    logs: ['게임을 시작합니다!']
  });

  const [isThrowing, setIsThrowing] = useState(false);
  const [lastThrowResult, setLastThrowResult] = useState<YutResult | null>(null);

  const currentTeam = gameState.teams[gameState.currentTeamIndex];

  const handleThrow = () => {
    if (gameState.isGameOver) return;
    
    setIsThrowing(true);
    // Simulate animation delay
    setTimeout(() => {
      const { result } = throwYut();
      setLastThrowResult(result);
      setIsThrowing(false);

      setGameState(prev => {
        const newBuffer = [...prev.throwBuffer, result];
        const hasExtra = isExtraTurnResult(result);
        
        return {
          ...prev,
          throwBuffer: newBuffer,
          logs: [...prev.logs, `${prev.teams[prev.currentTeamIndex].name} 팀이 던져서 '${result}'이(가) 나왔습니다!`]
        };
      });
    }, 600);
  };

  const handlePieceMove = (pieceId: string, result: YutResult) => {
    if (gameState.isGameOver) return;

    const { updatedGameState, caughtEnemy } = calculateMove(gameState, pieceId, result);
    
    // Remove the used result from buffer
    const resultIndex = updatedGameState.throwBuffer.indexOf(result);
    if (resultIndex > -1) {
      updatedGameState.throwBuffer.splice(resultIndex, 1);
    }

    // Handle turn logic
    let nextTeamIndex = updatedGameState.currentTeamIndex;
    let nextBuffer = updatedGameState.throwBuffer;

    const canThrowMore = nextBuffer.some(r => isExtraTurnResult(r)) || caughtEnemy;
    
    // If caught enemy, player gets one more throw added automatically (implicitly by logic or explicitly)
    // Actually, in Yutnori, if you catch, you "get a turn back".
    
    if (nextBuffer.length === 0 && !caughtEnemy) {
        // Turn ends
        nextTeamIndex = (updatedGameState.currentTeamIndex + 1) % updatedGameState.teams.length;
        updatedGameState.logs.push(`${updatedGameState.teams[nextTeamIndex].name} 팀의 차례입니다.`);
    }

    setGameState({
      ...updatedGameState,
      currentTeamIndex: nextTeamIndex,
      throwBuffer: nextBuffer,
      lastUpdate: Date.now()
    });
  };

  const resetGame = () => {
    setGameState({
      id: 'local-game',
      teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
      currentTeamIndex: 0,
      throwBuffer: [],
      turnBonus: 0,
      isGameOver: false,
      winnerTeamId: null,
      lastUpdate: Date.now(),
      logs: ['게임을 초기화했습니다.']
    });
    setLastThrowResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 md:p-8 gap-6">
      <header className="text-center">
        <h1 className="text-4xl font-black text-stone-800 tracking-tight mb-2">
          KOREAN <span className="text-red-600">YUT</span>NORI
        </h1>
        <p className="text-stone-500 font-medium italic">Traditional Real-time Board Game</p>
      </header>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Game Info & Log */}
        <div className="lg:col-span-3 flex flex-col gap-4 order-2 lg:order-1">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-stone-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              게임 상태
            </h2>
            <div className="space-y-4">
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

          <GameLog logs={gameState.logs} />
          
          <button 
            onClick={resetGame}
            className="mt-2 text-sm text-stone-400 hover:text-red-500 transition-colors py-2"
          >
            게임 초기화
          </button>
        </div>

        {/* Center: Board */}
        <div className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
          <Board 
            gameState={gameState} 
            onPieceMove={handlePieceMove}
          />
        </div>

        {/* Right: Controls */}
        <div className="lg:col-span-3 flex flex-col gap-4 order-3">
          <YutControls 
            currentTeam={currentTeam}
            throwBuffer={gameState.throwBuffer}
            onThrow={handleThrow}
            isThrowing={isThrowing}
            isGameOver={gameState.isGameOver}
          />
          
          {gameState.isGameOver && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl animate-bounce-subtle">
                <div className="text-6xl mb-6">🏆</div>
                <h2 className="text-3xl font-black mb-2">승리!</h2>
                <p className="text-lg text-stone-600 mb-8">
                   <span className="font-bold underline decoration-4 underline-offset-4" style={{ color: gameState.teams.find(t => t.id === gameState.winnerTeamId)?.color }}>
                    {gameState.teams.find(t => t.id === gameState.winnerTeamId)?.name}
                  </span> 팀이 영광의 승리를 차지했습니다!
                </p>
                <button 
                  onClick={resetGame}
                  className="w-full py-4 bg-stone-900 text-white font-bold rounded-2xl hover:bg-stone-800 transition-transform active:scale-95"
                >
                  새 게임 시작
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <footer className="mt-auto pt-12 pb-6 text-stone-400 text-sm">
        &copy; 2024 Traditional Yutnori - Senior Dev Project
      </footer>
    </div>
  );
};

export default App;
