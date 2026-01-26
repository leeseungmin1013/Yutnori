
import React, { useState } from 'react';
import { Room } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ClientJoinProps {
  room: Room | null;
  playerId: string;
  loading: boolean;
  error: string | null;
  onJoin: (roomCode: string, playerName: string) => Promise<boolean>;
  onSelectTeam: (teamIndex: number) => Promise<void>;
  onLeave: () => void;
  onReady: () => void;
}

const ClientJoin: React.FC<ClientJoinProps> = ({
  room,
  playerId,
  loading,
  error,
  onJoin,
  onSelectTeam,
  onLeave,
  onReady
}) => {
  const { t } = useLanguage();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const handleJoin = async () => {
    if (!roomCode.trim() || !playerName.trim()) return;
    const success = await onJoin(roomCode.toUpperCase(), playerName);
    if (success) {
      setIsJoined(true);
    }
  };

  const currentPlayer = room?.players?.[playerId];
  const teamSettings = room?.teamSettings || [];

  // 참가 전 화면
  if (!isJoined || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-stone-100">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-black text-center text-stone-800 mb-6">
            {t.joinGame}
          </h1>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-2">
                {t.joinCode}
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                placeholder={t.enterCode}
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest rounded-xl border-2 border-stone-200 focus:border-stone-400 focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-600 mb-2">
                {t.nickname}
              </label>
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder={t.enterNickname}
                maxLength={10}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-stone-400 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onLeave}
              className="flex-1 py-3 bg-stone-100 text-stone-600 font-bold rounded-xl hover:bg-stone-200"
            >
              {t.back}
            </button>
            <button
              onClick={handleJoin}
              disabled={loading || !roomCode.trim() || !playerName.trim()}
              className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? t.joining : t.join}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 참가 후 팀 선택 화면
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-stone-100">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
        <h1 className="text-2xl font-black text-center text-stone-800 mb-2">
          {t.selectTeam}
        </h1>
        <p className="text-center text-stone-500 mb-6">
          {currentPlayer?.name}{t.selectYourTeam}
        </p>

        <div className="space-y-3 mb-6">
          {teamSettings.map((team: { name: string; color: string }, idx: number) => {
            const isSelected = Number(currentPlayer?.teamIndex) === idx;
            const teamPlayers = Object.values(room.players || {}).filter(
              (p: any) => Number(p.teamIndex) === idx && p.id !== playerId
            );

            return (
              <button
                key={idx}
                onClick={() => onSelectTeam(idx)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-stone-800 bg-stone-50 shadow-md'
                    : 'border-stone-200 hover:border-stone-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: team.color }}
                  />
                  <div className="flex-1">
                    <p className="font-bold" style={{ color: team.color }}>
                      {team.name}
                    </p>
                    {teamPlayers.length > 0 && (
                      <p className="text-xs text-stone-400">
                        {teamPlayers.map((p: any) => p.name).join(', ')}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {room.status === 'waiting' ? (
          <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-amber-800 font-medium">{t.waitingForHost}</p>
            <p className="text-amber-800 font-medium">{t.autoStart}</p>
          </div>
        ) : (
          <button
            onClick={onReady}
            className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600"
          >
            {t.joinGameBtn}
          </button>
        )}

        <button
          onClick={onLeave}
          className="w-full mt-3 py-2 text-stone-400 hover:text-red-500 text-sm"
        >
          {t.leave}
        </button>
      </div>
    </div>
  );
};

export default ClientJoin;
