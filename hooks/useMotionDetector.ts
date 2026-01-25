
import { useState, useEffect, useCallback, useRef } from 'react';
import { YutResult } from '../types';
import { throwYut } from '../yutLogic';

interface MotionState {
  isSupported: boolean;
  hasPermission: boolean;
  isDetecting: boolean;
  lastMotion: { x: number; y: number; z: number } | null;
}

interface UseMotionDetectorReturn {
  motionState: MotionState;
  requestPermission: () => Promise<boolean>;
  startDetecting: () => void;
  stopDetecting: () => void;
  onThrowDetected: (callback: (result: YutResult) => void) => void;
}

export const useMotionDetector = (): UseMotionDetectorReturn => {
  const [motionState, setMotionState] = useState<MotionState>({
    isSupported: false,
    hasPermission: false,
    isDetecting: false,
    lastMotion: null
  });

  const throwCallbackRef = useRef<((result: YutResult) => void) | null>(null);
  const detectingRef = useRef(false);
  const lastThrowTimeRef = useRef(0);
  const motionHistoryRef = useRef<number[]>([]);

  // 지원 여부 체크
  useEffect(() => {
    const isSupported = 'DeviceMotionEvent' in window;
    setMotionState(prev => ({ ...prev, isSupported }));
  }, []);

  // iOS 권한 요청
  const requestPermission = useCallback(async (): Promise<boolean> => {
    // iOS 13+ 에서는 권한 요청 필요
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        const granted = permission === 'granted';
        setMotionState(prev => ({ ...prev, hasPermission: granted }));
        return granted;
      } catch (err) {
        console.error('Motion permission error:', err);
        return false;
      }
    } else {
      // 권한 요청 불필요 (Android 등)
      setMotionState(prev => ({ ...prev, hasPermission: true }));
      return true;
    }
  }, []);

  // 던지기 감지 시작
  const startDetecting = useCallback(() => {
    detectingRef.current = true;
    motionHistoryRef.current = [];
    setMotionState(prev => ({ ...prev, isDetecting: true }));
  }, []);

  // 던지기 감지 중지
  const stopDetecting = useCallback(() => {
    detectingRef.current = false;
    setMotionState(prev => ({ ...prev, isDetecting: false }));
  }, []);

  // 콜백 등록
  const onThrowDetected = useCallback((callback: (result: YutResult) => void) => {
    throwCallbackRef.current = callback;
  }, []);

  // 모션 이벤트 핸들러
  useEffect(() => {
    if (!motionState.isSupported) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (!detectingRef.current) return;

      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.y === null) return;

      const now = Date.now();
      const y = acc.y;

      // 모션 기록
      motionHistoryRef.current.push(y);
      if (motionHistoryRef.current.length > 20) {
        motionHistoryRef.current.shift();
      }

      setMotionState(prev => ({
        ...prev,
        lastMotion: { x: acc.x || 0, y: acc.y || 0, z: acc.z || 0 }
      }));

      // 던지기 감지 로직
      // 1. 최근 기록에서 급격한 변화 감지 (위로 올렸다가 내리는 동작)
      const history = motionHistoryRef.current;
      if (history.length >= 10) {
        const recentMax = Math.max(...history.slice(-10));
        const recentMin = Math.min(...history.slice(-10));
        const delta = recentMax - recentMin;

        // 임계값: 가속도 변화가 15 이상이면 던진 것으로 판정
        const THROW_THRESHOLD = 15;
        const COOLDOWN = 1500; // 1.5초 쿨다운

        if (delta > THROW_THRESHOLD && now - lastThrowTimeRef.current > COOLDOWN) {
          lastThrowTimeRef.current = now;
          motionHistoryRef.current = [];

          // 던지기 결과 생성
          const { result } = throwYut();

          // 콜백 호출
          if (throwCallbackRef.current) {
            throwCallbackRef.current(result);
          }

          // 감지 중지
          stopDetecting();
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [motionState.isSupported, stopDetecting]);

  return {
    motionState,
    requestPermission,
    startDetecting,
    stopDetecting,
    onThrowDetected
  };
};
