
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Team, Room, Player } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface TeamSetting {
  name: string;
  color: string;
}

interface HostLobbyProps {
  room: Room | null;
  roomCode: string | null;
  loading: boolean;
  error: string | null;
  onCreateRoom: (teams: Team[]) => Promise<string>;
  onStartGame: (teams: Team[]) => void;
  onClose: () => void;
}

const HostLobby: React.FC<HostLobbyProps> = ({
  room,
  roomCode,
  loading,
  error,
  onCreateRoom,
  onStartGame,
  onClose
}) => {
  const { t } = useLanguage();

  const DEFAULT_TEAMS: TeamSetting[] = [
    { name: t.team1, color: '#3b82f6' },
    { name: t.team2, color: '#ef4444' },
    { name: t.team3, color: '#f59e0b' },
    { name: t.team4, color: '#10b981' },
  ];

  const COLOR_OPTIONS = [
    { name: t.blue, value: '#3b82f6' },
    { name: t.red, value: '#ef4444' },
    { name: t.yellow, value: '#f59e0b' },
    { name: t.green, value: '#10b981' },
    { name: t.purple, value: '#8b5cf6' },
    { name: t.pink, value: '#ec4899' },
    { name: t.cyan, value: '#06b6d4' },
    { name: t.orange, value: '#f97316' },
  ];

  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<TeamSetting[]>(DEFAULT_TEAMS);
  const [isCreated, setIsCreated] = useState(false);

  const handleCreateRoom = async () => {
    const selectedTeams: Team[] = teams.slice(0, teamCount).map((team, i) => ({
      id: `team-${i + 1}`,
      name: team.name,
      color: team.color,
      finishedCount: 0,
      pieces: Array.from({ length: 4 }).map((_, j) => ({
        id: `t${i + 1}-p${j}`,
        teamId: `team-${i + 1}`,
        nodeIndex: null,
        isFinished: false,
        stackedCount: 1,
        stackedPieceIds: [],
        currentPath: 'outer' as const,
      })),
    }));

    await onCreateRoom(selectedTeams);
    setIsCreated(true);
  };

  const handleNameChange = (index: number, name: string) => {
    const newTeams = [...teams];
    newTeams[index] = { ...newTeams[index], name };
    setTeams(newTeams);
  };

  const handleColorChange = (index: number, color: string) => {
    const newTeams = [...teams];
    newTeams[index] = { ...newTeams[index], color };
    setTeams(newTeams);
  };

  const getUsedColors = (exceptIndex: number) => {
    return teams
      .slice(0, teamCount)
      .filter((_, i) => i !== exceptIndex)
      .map(team => team.color);
  };

  const players: Player[] = room?.players ? Object.values(room.players) : [];
  const playersPerTeam = teams.slice(0, teamCount).map((_, teamIdx) =>
    players.filter(p => Number(p.teamIndex) === teamIdx)
  );

  const canStartGame = players.length > 0 && players.every(p => Number(p.teamIndex) >= 0);

  const handleStartGame = () => {
    const selectedTeams: Team[] = teams.slice(0, teamCount).map((team, i) => ({
      id: `team-${i + 1}`,
      name: team.name,
      color: team.color,
      finishedCount: 0,
      pieces: Array.from({ length: 4 }).map((_, j) => ({
        id: `t${i + 1}-p${j}`,
        teamId: `team-${i + 1}`,
        nodeIndex: null,
        isFinished: false,
        stackedCount: 1,
        stackedPieceIds: [],
        currentPath: 'outer' as const,
      })),
    }));
    onStartGame(selectedTeams);
  };

  // 방 생성 전 설정 화면
  if (!isCreated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-stone-100">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full">
          <h1 className="text-2xl font-black text-center text-stone-800 mb-6">
            {t.multiplayerSetup}
          </h1>

          {/* 팀 수 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-stone-600 mb-3">
              {t.teamCount}
            </label>
            <div className="flex gap-2">
              {[2, 3, 4].map(count => (
                <button
                  key={count}
                  onClick={() => setTeamCount(count)}
                  className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                    teamCount === count
                      ? 'bg-stone-800 text-white shadow-lg'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* 팀 설정 */}
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-bold text-stone-600">
              {t.teamSettings}
            </label>
            {teams.slice(0, teamCount).map((team, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200"
              >
                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow-md flex-shrink-0"
                  style={{ backgroundColor: team.color }}
                />
                <input
                  type="text"
                  value={team.name}
                  onChange={e => handleNameChange(index, e.target.value)}
                  maxLength={10}
                  className="flex-1 px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
                <select
                  value={team.color}
                  onChange={e => handleColorChange(index, e.target.value)}
                  className="px-2 py-2 rounded-lg border border-stone-200 bg-white"
                >
                  {COLOR_OPTIONS.map(option => {
                    const usedColors = getUsedColors(index);
                    const isUsed = usedColors.includes(option.value);
                    return (
                      <option key={option.value} value={option.value} disabled={isUsed}>
                        {option.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-stone-100 text-stone-600 font-bold rounded-xl hover:bg-stone-200"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? t.creating : t.createRoom}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 방 생성 후 대기실
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-stone-100">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full">
        <h1 className="text-2xl font-black text-center text-stone-800 mb-2">
          {t.lobby}
        </h1>

        {/* 룸 코드 + QR 코드 */}
        <div className="bg-stone-800 text-white rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            {/* QR 코드 */}
            <div className="bg-white p-2 rounded-xl flex-shrink-0">
              <QRCodeSVG
                value={`${window.location.origin}${window.location.pathname}?join=${roomCode}`}
                size={100}
                level="M"
              />
            </div>
            {/* 코드 정보 */}
            <div className="flex-1 text-center">
              <p className="text-sm text-stone-400 mb-1">{t.joinCode}</p>
              <p className="text-3xl font-black tracking-widest">{roomCode}</p>
              <p className="text-xs text-stone-400 mt-2">{t.scanQR}</p>
            </div>
          </div>
        </div>

        {/* 팀별 참가자 목록 */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-bold text-stone-600">{t.participants} ({players.length})</p>
          {teams.slice(0, teamCount).map((team, teamIdx) => (
            <div
              key={teamIdx}
              className="p-3 bg-stone-50 rounded-xl border border-stone-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: team.color }}
                />
                <span className="font-bold text-sm" style={{ color: team.color }}>
                  {team.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {playersPerTeam[teamIdx].length > 0 ? (
                  playersPerTeam[teamIdx].map(player => (
                    <span
                      key={player.id}
                      className="px-2 py-1 bg-white rounded-lg text-xs font-medium border"
                    >
                      {player.name}
                      {!player.connected && <span className="text-red-500 ml-1">(offline)</span>}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-stone-400">{t.waiting}...</span>
                )}
              </div>
            </div>
          ))}

          {/* 미배정 참가자 */}
          {players.filter(p => Number(p.teamIndex) < 0).length > 0 && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-600 mb-2">{t.waitingForTeam}</p>
              <div className="flex flex-wrap gap-2">
                {players.filter(p => Number(p.teamIndex) < 0).map(player => (
                  <span
                    key={player.id}
                    className="px-2 py-1 bg-white rounded-lg text-xs font-medium border border-amber-200"
                  >
                    {player.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-stone-100 text-stone-600 font-bold rounded-xl hover:bg-stone-200"
          >
            {t.closeRoom}
          </button>
          <button
            onClick={handleStartGame}
            disabled={!canStartGame}
            className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.startGame}
          </button>
        </div>

        {!canStartGame && (
          <p className="text-xs text-center text-stone-400 mt-3">
            {players.length === 0
              ? t.noParticipants
              : `${players.filter(p => Number(p.teamIndex) < 0).length}${t.selectTeamRequired}`
            }
          </p>
        )}
      </div>
    </div>
  );
};

export default HostLobby;
