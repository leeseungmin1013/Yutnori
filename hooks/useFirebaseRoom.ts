
import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, database, ref, set, get, onValue, update, remove, generateRoomCode, generatePlayerId, onDisconnect } from '../firebase';
import { Room, Player, GameState, ThrowRequest, ThrowSignal, Team } from '../types';

interface UseFirebaseRoomReturn {
  // 상태
  room: Room | null;
  playerId: string;
  isHost: boolean;
  error: string | null;
  loading: boolean;

  // 호스트 액션
  createRoom: (teams: Team[]) => Promise<string>;
  startGame: () => Promise<void>;
  requestThrow: (teamIndex: number) => Promise<void>;
  updateGameState: (gameState: GameState) => Promise<void>;
  closeRoom: () => Promise<void>;
  clearThrowSignal: () => Promise<void>;

  // 클라이언트 액션
  joinRoom: (roomCode: string, playerName: string) => Promise<boolean>;
  selectTeam: (teamIndex: number) => Promise<void>;
  submitThrowSignal: (teamIndex: number) => Promise<void>;
  leaveRoom: () => Promise<void>;
}

export const useFirebaseRoom = (): UseFirebaseRoomReturn => {
  const [room, setRoom] = useState<Room | null>(null);
  const [playerId] = useState<string>(() => {
    // 브라우저 세션 동안 유지
    const stored = sessionStorage.getItem('yutnori_player_id');
    if (stored) return stored;
    const newId = generatePlayerId();
    sessionStorage.setItem('yutnori_player_id', newId);
    return newId;
  });
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const ensureAuth = useCallback(async (): Promise<void> => {
    if (auth.currentUser) {
      if (!authReady) setAuthReady(true);
      return;
    }
    try {
      await signInAnonymously(auth);
      setAuthReady(true);
    } catch (err: any) {
      setError('인증 실패: ' + err.message);
      throw err;
    }
  }, [authReady]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthReady(!!user);
      if (!user) {
        signInAnonymously(auth).catch((err: any) => {
          setError('인증 실패: ' + err.message);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // 룸 상태 실시간 구독
  useEffect(() => {
    if (!roomCode || !authReady) return;

    const roomRef = ref(database, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRoom({
          code: roomCode,
          hostId: data.hostId,
          status: data.status,
          gameState: data.gameState || null,
          players: data.players || {},
          throwRequest: data.throwRequest || null,
          throwResult: data.throwResult || null,
          throwSignal: data.throwSignal || null,
          teamSettings: data.teamSettings || [],
          createdAt: data.createdAt
        });
      } else {
        setRoom(null);
        setRoomCode(null);
        setError('방이 종료되었습니다.');
      }
    }, (err) => {
      setError('연결 오류: ' + err.message);
    });

    return () => unsubscribe();
  }, [roomCode, authReady]);

  // 호스트: 룸 생성
  const createRoom = useCallback(async (teams: Team[]): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      await ensureAuth();
      let code = generateRoomCode();
      let attempts = 0;

      // 중복 코드 체크
      while (attempts < 10) {
        const roomRef = ref(database, `rooms/${code}`);
        const snapshot = await get(roomRef);
        if (!snapshot.exists()) break;
        code = generateRoomCode();
        attempts++;
      }

      const initialRoom: Omit<Room, 'code'> = {
        hostId: playerId,
        status: 'waiting',
        gameState: null,
        players: {},
        throwRequest: null,
        throwResult: null,
        createdAt: Date.now()
      };

      // 팀 정보 저장 (게임 시작 전 설정용)
      const roomWithTeams = {
        ...initialRoom,
        teamSettings: teams.map(t => ({ name: t.name, color: t.color }))
      };

      await set(ref(database, `rooms/${code}`), roomWithTeams);

      setRoomCode(code);
      setIsHost(true);
      setLoading(false);

      return code;
    } catch (err: any) {
      setError('방 생성 실패: ' + err.message);
      setLoading(false);
      throw err;
    }
  }, [playerId]);

  // 클라이언트: 룸 참가
  const joinRoom = useCallback(async (code: string, playerName: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await ensureAuth();
      const roomRef = ref(database, `rooms/${code}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        setError('존재하지 않는 방입니다.');
        setLoading(false);
        return false;
      }

      const roomData = snapshot.val();
      if (roomData.status !== 'waiting') {
        setError('이미 게임이 시작된 방입니다.');
        setLoading(false);
        return false;
      }

      // 플레이어 등록
      const playerRef = ref(database, `rooms/${code}/players/${playerId}`);
      const player: Player = {
        id: playerId,
        name: playerName,
        teamIndex: -1, // 미배정
        connected: true,
        lastSeen: Date.now()
      };

      await set(playerRef, player);

      // 연결 해제 시 처리
      onDisconnect(playerRef).update({ connected: false, lastSeen: Date.now() });

      setRoomCode(code);
      setIsHost(false);
      setLoading(false);

      return true;
    } catch (err: any) {
      setError('참가 실패: ' + err.message);
      setLoading(false);
      return false;
    }
  }, [playerId]);

  // 클라이언트: 팀 선택
  const selectTeam = useCallback(async (teamIndex: number): Promise<void> => {
    if (!roomCode) return;

    try {
      await ensureAuth();
      await update(ref(database, `rooms/${roomCode}/players/${playerId}`), {
        teamIndex,
        lastSeen: Date.now()
      });
    } catch (err: any) {
      setError('팀 선택 실패: ' + err.message);
    }
  }, [roomCode, playerId]);

  // 호스트: 게임 시작
  const startGame = useCallback(async (): Promise<void> => {
    if (!roomCode || !isHost) return;

    try {
      await ensureAuth();
      await update(ref(database, `rooms/${roomCode}`), {
        status: 'playing'
      });
    } catch (err: any) {
      setError('게임 시작 실패: ' + err.message);
    }
  }, [roomCode, isHost]);

  // 호스트: 던지기 요청
  const requestThrow = useCallback(async (teamIndex: number): Promise<void> => {
    if (!roomCode || !isHost) return;

    try {
      await ensureAuth();
      const request: ThrowRequest = {
        teamIndex,
        timestamp: Date.now()
      };
      await set(ref(database, `rooms/${roomCode}/throwRequest`), request);
    } catch (err: any) {
      setError('던지기 요청 실패: ' + err.message);
    }
  }, [roomCode, isHost]);

  // 클라이언트: 던지기 신호 전송 (결과는 호스트가 생성)
  const submitThrowSignal = useCallback(async (teamIndex: number): Promise<void> => {
    if (!roomCode) return;

    try {
      await ensureAuth();
      const throwSignal: ThrowSignal = {
        playerId,
        teamIndex,
        timestamp: Date.now()
      };
      await set(ref(database, `rooms/${roomCode}/throwSignal`), throwSignal);
    } catch (err: any) {
      setError('신호 전송 실패: ' + err.message);
    }
  }, [roomCode, playerId]);

  // 호스트: 게임 상태 업데이트
  const updateGameState = useCallback(async (gameState: GameState): Promise<void> => {
    if (!roomCode || !isHost) return;

    try {
      await ensureAuth();
      await update(ref(database, `rooms/${roomCode}`), {
        gameState,
        status: gameState.isGameOver ? 'finished' : 'playing'
      });
    } catch (err: any) {
      setError('상태 업데이트 실패: ' + err.message);
    }
  }, [roomCode, isHost]);

  // 호스트: 던지기 신호 초기화
  const clearThrowSignal = useCallback(async (): Promise<void> => {
    if (!roomCode) return;

    try {
      await ensureAuth();
      await remove(ref(database, `rooms/${roomCode}/throwSignal`));
      await remove(ref(database, `rooms/${roomCode}/throwRequest`));
    } catch (err: any) {
      setError('신호 초기화 실패: ' + err.message);
    }
  }, [roomCode]);

  // 호스트: 방 닫기
  const closeRoom = useCallback(async (): Promise<void> => {
    if (!roomCode || !isHost) return;

    try {
      await ensureAuth();
      await remove(ref(database, `rooms/${roomCode}`));
      setRoomCode(null);
      setRoom(null);
      setIsHost(false);
    } catch (err: any) {
      setError('방 닫기 실패: ' + err.message);
    }
  }, [roomCode, isHost]);

  // 클라이언트: 방 나가기
  const leaveRoom = useCallback(async (): Promise<void> => {
    if (!roomCode) return;

    try {
      await ensureAuth();
      await remove(ref(database, `rooms/${roomCode}/players/${playerId}`));
      setRoomCode(null);
      setRoom(null);
    } catch (err: any) {
      setError('나가기 실패: ' + err.message);
    }
  }, [roomCode, playerId]);

  return {
    room,
    playerId,
    isHost,
    error,
    loading,
    createRoom,
    startGame,
    requestThrow,
    updateGameState,
    closeRoom,
    clearThrowSignal,
    joinRoom,
    selectTeam,
    submitThrowSignal,
    leaveRoom
  };
};
