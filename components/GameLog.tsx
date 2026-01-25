
import React, { useRef, useEffect } from 'react';

interface GameLogProps {
  logs: string[];
}

const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-stone-200 flex flex-col h-[200px] lg:h-[300px]">
      <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-3 shrink-0">Game History</h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {logs.map((log, i) => (
          <div key={i} className="text-sm font-medium text-stone-600 border-l-2 border-stone-100 pl-3 py-1 animate-in slide-in-from-left duration-300">
            {log}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default GameLog;
