/**
 * SoundManager - 게임 사운드 관리 싱글톤
 */

type SoundName =
  | 'bgm'
  | 'throw'
  | 'stick_land'
  | 'yut_mo'
  | 'catch'
  | 'goal'
  | 'move';

interface SoundConfig {
  src: string;
  volume: number;
  loop?: boolean;
}

const SOUND_CONFIG: Record<SoundName, SoundConfig> = {
  bgm: { src: '/sounds/bgm.mp3', volume: 0.3, loop: true },
  throw: { src: '/sounds/sfx_throw.mp3', volume: 0.6 },
  stick_land: { src: '/sounds/sfx_stick_land.mp3', volume: 0.5 },
  yut_mo: { src: '/sounds/sfx_yut_mo.mp3', volume: 0.7 },
  catch: { src: '/sounds/sfx_catch.mp3', volume: 0.8 },
  goal: { src: '/sounds/sfx_goal.mp3', volume: 0.7 },
  move: { src: '/sounds/sfx_move.mp3', volume: 0.4 },
};

class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<SoundName, HTMLAudioElement> = new Map();
  private bgmElement: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 1.0;
  private isInitialized: boolean = false;

  private constructor() {
    // 로컬 스토리지에서 설정 복원
    const savedMuted = localStorage.getItem('yutnori_muted');
    const savedVolume = localStorage.getItem('yutnori_volume');

    if (savedMuted !== null) {
      this.isMuted = savedMuted === 'true';
    }
    if (savedVolume !== null) {
      this.masterVolume = parseFloat(savedVolume);
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * 사운드 초기화 (사용자 인터랙션 후 호출)
   */
  public init(): void {
    if (this.isInitialized) return;

    // 모든 사운드 프리로드
    Object.entries(SOUND_CONFIG).forEach(([name, config]) => {
      const audio = new Audio(config.src);
      audio.volume = config.volume * this.masterVolume;
      audio.loop = config.loop || false;
      audio.preload = 'auto';

      // 에러 핸들링 (파일이 없어도 크래시 방지)
      audio.onerror = () => {
        console.warn(`Sound file not found: ${config.src}`);
      };

      this.sounds.set(name as SoundName, audio);

      if (name === 'bgm') {
        this.bgmElement = audio;
      }
    });

    this.isInitialized = true;
  }

  /**
   * 사운드 재생
   */
  public play(soundName: SoundName): void {
    if (this.isMuted || !this.isInitialized) return;

    const audio = this.sounds.get(soundName);
    if (!audio) return;

    // BGM은 별도 처리
    if (soundName === 'bgm') {
      this.playBGM();
      return;
    }

    // SFX: 새 인스턴스로 재생 (중복 재생 허용)
    const sfx = audio.cloneNode() as HTMLAudioElement;
    sfx.volume = SOUND_CONFIG[soundName].volume * this.masterVolume;
    sfx.play().catch(() => {
      // 자동 재생 제한으로 인한 에러 무시
    });
  }

  /**
   * BGM 재생
   */
  public playBGM(): void {
    if (!this.bgmElement || this.isMuted) return;

    this.bgmElement.play().catch(() => {
      // 자동 재생 제한으로 인한 에러 무시
    });
  }

  /**
   * BGM 정지
   */
  public stopBGM(): void {
    if (!this.bgmElement) return;

    this.bgmElement.pause();
    this.bgmElement.currentTime = 0;
  }

  /**
   * BGM 일시정지/재개
   */
  public toggleBGM(): boolean {
    if (!this.bgmElement) return false;

    if (this.bgmElement.paused) {
      this.bgmElement.play().catch(() => {});
      return true;
    } else {
      this.bgmElement.pause();
      return false;
    }
  }

  /**
   * 음소거 토글
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('yutnori_muted', String(this.isMuted));

    if (this.isMuted) {
      // 음소거: BGM 일시정지
      if (this.bgmElement) {
        this.bgmElement.pause();
      }
    } else {
      // 음소거 해제: BGM 재개
      this.playBGM();
    }

    return this.isMuted;
  }

  /**
   * 음소거 상태 확인
   */
  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * 마스터 볼륨 설정 (0.0 ~ 1.0)
   */
  public setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('yutnori_volume', String(this.masterVolume));

    // 모든 사운드 볼륨 업데이트
    this.sounds.forEach((audio, name) => {
      audio.volume = SOUND_CONFIG[name].volume * this.masterVolume;
    });
  }

  /**
   * 마스터 볼륨 확인
   */
  public getVolume(): number {
    return this.masterVolume;
  }
}

// 싱글톤 인스턴스 export
export const soundManager = SoundManager.getInstance();
export default soundManager;
