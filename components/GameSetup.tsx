
import React, { useState } from 'react';
import { Team } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface GameSetupProps {
  onStartGame: (teams: Team[]) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
  const { t } = useLanguage();

  const DEFAULT_TEAMS = [
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
  const [teams, setTeams] = useState(
    DEFAULT_TEAMS.map((team, i) => ({ ...team, id: `team-${i + 1}` }))
  );

  const handleTeamCountChange = (count: number) => {
    setTeamCount(count);
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

  // 이미 선택된 색상 확인
  const getUsedColors = (exceptIndex: number) => {
    return teams
      .slice(0, teamCount)
      .filter((_, i) => i !== exceptIndex)
      .map(team => team.color);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-stone-100">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full">
        <h1 className="text-3xl font-black text-center text-stone-800 mb-2">
          KOREAN <span className="text-red-600">YUT</span>NORI
        </h1>
        <p className="text-stone-500 text-center mb-8">{t.gameSetup}</p>

        {/* 팀 수 선택 */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-stone-600 mb-3">
            {t.teamCount}
          </label>
          <div className="flex gap-2">
            {[2, 3, 4].map(count => (
              <button
                key={count}
                onClick={() => handleTeamCountChange(count)}
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
        <div className="space-y-4 mb-8">
          <label className="block text-sm font-bold text-stone-600">
            {t.teamSettings}
          </label>
          {teams.slice(0, teamCount).map((team, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200"
            >
              <div
                className="w-10 h-10 rounded-full border-2 border-white shadow-md flex-shrink-0"
                style={{ backgroundColor: team.color }}
              />
              <input
                type="text"
                value={team.name}
                onChange={e => handleNameChange(index, e.target.value)}
                placeholder={`Team ${index + 1}`}
                maxLength={10}
                className="flex-1 px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-800 font-medium"
              />
              <select
                value={team.color}
                onChange={e => handleColorChange(index, e.target.value)}
                className="px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-800 bg-white"
              >
                {COLOR_OPTIONS.map(option => {
                  const usedColors = getUsedColors(index);
                  const isUsed = usedColors.includes(option.value);
                  return (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={isUsed}
                    >
                      {option.name} {isUsed ? t.inUse : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          ))}
        </div>

        {/* 게임 시작 버튼 */}
        <button
          onClick={handleStartGame}
          className="w-full py-4 bg-stone-900 text-white font-bold text-lg rounded-2xl hover:bg-stone-800 active:scale-[0.98] transition-all shadow-xl"
        >
          {t.startGame}
        </button>
      </div>

      <p className="mt-8 text-stone-400 text-sm">
        {t.appSubtitle}
      </p>
    </div>
  );
};

export default GameSetup;
