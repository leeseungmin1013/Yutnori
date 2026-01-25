
import React from 'react';
import { GameMode } from '../types';

interface ModeSelectProps {
  onSelectMode: (mode: GameMode) => void;
}

const ModeSelect: React.FC<ModeSelectProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-stone-100">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-black text-center text-stone-800 mb-2">
          KOREAN <span className="text-red-600">YUT</span>NORI
        </h1>
        <p className="text-stone-500 text-center mb-8">게임 모드를 선택하세요</p>

        <div className="space-y-4">
          {/* 로컬 모드 */}
          <button
            onClick={() => onSelectMode('local')}
            className="w-full p-6 bg-stone-50 hover:bg-stone-100 border-2 border-stone-200 hover:border-stone-400 rounded-2xl transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-stone-200 rounded-xl flex items-center justify-center text-2xl group-hover:bg-stone-300 transition-colors">
                🎮
              </div>
              <div>
                <h3 className="font-bold text-lg text-stone-800">로컬 플레이</h3>
                <p className="text-sm text-stone-500">한 기기에서 버튼으로 플레이</p>
              </div>
            </div>
          </button>

          {/* 호스트 모드 */}
          <button
            onClick={() => onSelectMode('host')}
            className="w-full p-6 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 rounded-2xl transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-200 rounded-xl flex items-center justify-center text-2xl group-hover:bg-blue-300 transition-colors">
                📺
              </div>
              <div>
                <h3 className="font-bold text-lg text-stone-800">호스트로 시작</h3>
                <p className="text-sm text-stone-500">게임을 생성하고 참가자를 기다립니다</p>
              </div>
            </div>
          </button>

          {/* 클라이언트 모드 */}
          <button
            onClick={() => onSelectMode('client')}
            className="w-full p-6 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 rounded-2xl transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-200 rounded-xl flex items-center justify-center text-2xl group-hover:bg-green-300 transition-colors">
                📱
              </div>
              <div>
                <h3 className="font-bold text-lg text-stone-800">참가자로 입장</h3>
                <p className="text-sm text-stone-500">휴대폰으로 윷을 던집니다</p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-800">
            <span className="font-bold">💡 멀티플레이어 모드</span><br />
            호스트는 TV/PC에서 게임 보드를 표시하고, 참가자들은 휴대폰으로 윷을 던집니다.
          </p>
        </div>
      </div>

      <p className="mt-8 text-stone-400 text-sm">
        Traditional Korean Board Game
      </p>
    </div>
  );
};

export default ModeSelect;
