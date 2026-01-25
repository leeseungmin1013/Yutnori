
import React from 'react';
import { Team, YutResult } from '../types';

interface YutControlsProps {
  currentTeam: Team;
  throwBuffer: YutResult[];
  onThrow: () => void;
  isThrowing: boolean;
  isGameOver: boolean;
}

const YutControls: React.FC<YutControlsProps> = ({ 
  currentTeam, 
  throwBuffer, 
  onThrow, 
  isThrowing,
  isGameOver
}) => {
  const canThrow = !isGameOver && (throwBuffer.length === 0 || throwBuffer.some(r => r === YutResult.YUT || r === YutResult.MO));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-stone-200 flex flex-col gap-6">
      <div className="text-center">
        <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">Available Moves</h3>
        <div className="flex flex-wrap justify-center gap-2 min-h-[44px]">
          {throwBuffer.length === 0 ? (
            <span className="text-stone-300 italic text-sm self-center">윷을 던져주세요...</span>
          ) : (
            throwBuffer.map((res, i) => (
              <span 
                key={i} 
                className="px-4 py-2 bg-stone-100 text-stone-800 rounded-lg font-black border-b-4 border-stone-300 text-sm animate-in fade-in zoom-in duration-300"
              >
                {res}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="relative group">
        <button
          onClick={onThrow}
          disabled={!canThrow || isThrowing}
          className={`w-full py-6 rounded-2xl font-black text-xl tracking-tight transition-all relative overflow-hidden flex flex-col items-center justify-center gap-1 ${
            canThrow && !isThrowing 
              ? 'bg-stone-900 text-white hover:-translate-y-1 active:translate-y-0 active:scale-95 shadow-xl hover:shadow-2xl' 
              : 'bg-stone-100 text-stone-300 cursor-not-allowed border-2 border-stone-200'
          }`}
        >
          {isThrowing ? (
            <div className="flex gap-2">
              <div className="w-3 h-10 bg-white/20 rounded-full animate-bounce delay-0" />
              <div className="w-3 h-10 bg-white/40 rounded-full animate-bounce delay-75" />
              <div className="w-3 h-10 bg-white/60 rounded-full animate-bounce delay-150" />
              <div className="w-3 h-10 bg-white/20 rounded-full animate-bounce delay-225" />
            </div>
          ) : (
            <>
              <span className="text-sm font-bold uppercase tracking-tighter opacity-60">
                {currentTeam.name} Turn
              </span>
              <span>윷 던지기</span>
            </>
          )}
        </button>
        {canThrow && !isThrowing && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-2 border-white animate-ping pointer-events-none" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold text-stone-400">
        <div className="p-2 border border-stone-100 rounded-lg">
          <p className="mb-1">팁</p>
          <p className="text-stone-600">윷/모가 나오면 한 번 더!</p>
        </div>
        <div className="p-2 border border-stone-100 rounded-lg">
          <p className="mb-1">팁</p>
          <p className="text-stone-600">상대 말을 잡아도 한 번 더!</p>
        </div>
      </div>
    </div>
  );
};

export default YutControls;
