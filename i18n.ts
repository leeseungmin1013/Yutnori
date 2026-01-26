
export type Language = 'ko' | 'en';

export const translations = {
  ko: {
    // 공통
    appTitle: 'KOREAN YUTNORI',
    appSubtitle: '전통 실시간 보드게임',
    back: '뒤로',
    cancel: '취소',
    close: '닫기',
    start: '시작',
    waiting: '대기',
    playing: '플레이 중',
    finished: '완료',

    // 모드 선택
    selectMode: '게임 모드를 선택하세요',
    localPlay: '로컬 플레이',
    localPlayDesc: '한 기기에서 버튼으로 플레이',
    hostStart: '호스트로 시작',
    hostStartDesc: '게임을 생성하고 참가자를 기다립니다',
    joinAsPlayer: '참가자로 입장',
    joinAsPlayerDesc: '휴대폰으로 윷을 던집니다',
    multiplayerTip: '호스트는 TV/PC에서 게임 보드를 표시하고, 참가자들은 휴대폰으로 윷을 던집니다.',

    // 게임 설정
    gameSetup: '게임 설정',
    teamCount: '참가 팀 수',
    teamSettings: '팀 설정',
    startGame: '게임 시작',

    // 호스트 로비
    multiplayerSetup: '멀티플레이어 게임 설정',
    createRoom: '방 만들기',
    creating: '생성 중...',
    lobby: '대기실',
    joinCode: '참가 코드',
    shareCode: '참가자에게 이 코드를 알려주세요',
    participants: '참가자',
    waitingForTeam: '팀 선택 대기 중',
    closeRoom: '방 닫기',
    noParticipants: '참가자가 없습니다. 참가자를 기다려주세요.',
    selectTeamRequired: '명이 팀을 선택하지 않았습니다.',

    // 클라이언트 참가
    joinGame: '게임 참가',
    enterCode: '6자리 코드 입력',
    nickname: '닉네임',
    enterNickname: '닉네임을 입력하세요',
    join: '참가',
    joining: '참가 중...',
    selectTeam: '팀 선택',
    selectYourTeam: '님, 팀을 선택하세요',
    waitingForHost: '호스트가 게임을 시작하면',
    autoStart: '자동으로 게임이 시작됩니다',
    joinGameBtn: '게임 참가',
    leave: '나가기',

    // 게임 플레이
    gameStatus: '게임 상태',
    yourTurn: '차례',
    resetGame: '게임 초기화',
    toMain: '메인으로',
    throwYut: '윷 던지기',
    throwing: '던지는 중...',
    throwResults: '던진 결과',
    selectPiece: '말을 선택하세요',
    waitingForThrow: '참가자가 윷을 던지는 중...',
    oneMoreThrow: '한 번 더!',
    victory: '승리!',
    teamWon: '팀이 영광의 승리를 차지했습니다!',
    playAgain: '다시 시작',

    // 윷 결과
    do: '도',
    gae: '개',
    geol: '걸',
    yut: '윷',
    mo: '모',
    backDo: '빽도',

    // 보드
    selectResult: '어떤 결과를 사용할까요?',
    noMovablePiece: '이동 가능한 말이 없습니다:',
    skip: '스킵',

    // 색상
    blue: '파랑',
    red: '빨강',
    yellow: '노랑',
    green: '초록',
    purple: '보라',
    pink: '분홍',
    cyan: '하늘',
    orange: '주황',
    inUse: '(사용중)',

    // 기본 팀 이름
    team1: '청룡',
    team2: '백호',
    team3: '주작',
    team4: '현무',
  },
  en: {
    // Common
    appTitle: 'KOREAN YUTNORI',
    appSubtitle: 'Traditional Real-time Board Game',
    back: 'Back',
    cancel: 'Cancel',
    close: 'Close',
    start: 'Start',
    waiting: 'Waiting',
    playing: 'Playing',
    finished: 'Finished',

    // Mode Select
    selectMode: 'Select Game Mode',
    localPlay: 'Local Play',
    localPlayDesc: 'Play on one device with buttons',
    hostStart: 'Start as Host',
    hostStartDesc: 'Create a game and wait for players',
    joinAsPlayer: 'Join as Player',
    joinAsPlayerDesc: 'Throw yut with your phone',
    multiplayerTip: 'Host displays the game board on TV/PC, and players throw yut with their phones.',

    // Game Setup
    gameSetup: 'Game Setup',
    teamCount: 'Number of Teams',
    teamSettings: 'Team Settings',
    startGame: 'Start Game',

    // Host Lobby
    multiplayerSetup: 'Multiplayer Game Setup',
    createRoom: 'Create Room',
    creating: 'Creating...',
    lobby: 'Lobby',
    joinCode: 'Join Code',
    shareCode: 'Share this code with players',
    participants: 'Participants',
    waitingForTeam: 'Waiting for team selection',
    closeRoom: 'Close Room',
    noParticipants: 'No participants. Waiting for players...',
    selectTeamRequired: ' player(s) haven\'t selected a team.',

    // Client Join
    joinGame: 'Join Game',
    enterCode: 'Enter 6-digit code',
    nickname: 'Nickname',
    enterNickname: 'Enter your nickname',
    join: 'Join',
    joining: 'Joining...',
    selectTeam: 'Select Team',
    selectYourTeam: ', select your team',
    waitingForHost: 'When the host starts the game,',
    autoStart: 'it will begin automatically',
    joinGameBtn: 'Join Game',
    leave: 'Leave',

    // Game Play
    gameStatus: 'Game Status',
    yourTurn: '\'s Turn',
    resetGame: 'Reset Game',
    toMain: 'Main Menu',
    throwYut: 'Throw Yut',
    throwing: 'Throwing...',
    throwResults: 'Throw Results',
    selectPiece: 'Select a piece',
    waitingForThrow: 'Waiting for player to throw...',
    oneMoreThrow: 'One More!',
    victory: 'Victory!',
    teamWon: 'team has won the game!',
    playAgain: 'Play Again',

    // Yut Results
    do: 'Do',
    gae: 'Gae',
    geol: 'Geol',
    yut: 'Yut',
    mo: 'Mo',
    backDo: 'Back-Do',

    // Board
    selectResult: 'Which result to use?',
    noMovablePiece: 'No movable pieces:',
    skip: 'Skip',

    // Colors
    blue: 'Blue',
    red: 'Red',
    yellow: 'Yellow',
    green: 'Green',
    purple: 'Purple',
    pink: 'Pink',
    cyan: 'Cyan',
    orange: 'Orange',
    inUse: '(In use)',

    // Default team names
    team1: 'Blue Dragon',
    team2: 'White Tiger',
    team3: 'Vermilion Bird',
    team4: 'Black Tortoise',
  }
};

export const getYutResultLabel = (result: string, lang: Language): string => {
  const t = translations[lang];
  switch (result) {
    case 'DO': return t.do;
    case 'GAE': return t.gae;
    case 'GEOL': return t.geol;
    case 'YUT': return t.yut;
    case 'MO': return t.mo;
    case 'BACK_DO': return t.backDo;
    default: return result;
  }
};
