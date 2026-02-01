
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useFullscreen } from '../hooks/useFullscreen';
import soundManager from '../utils/SoundManager';

const TopBar: React.FC = () => {
  const { lang, toggleLanguage } = useLanguage();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const [isBgmMuted, setIsBgmMuted] = useState(soundManager.getBgmMuted());
  const [isSfxMuted, setIsSfxMuted] = useState(soundManager.getSfxMuted());
  const [isInitialized, setIsInitialized] = useState(false);

  // 첫 인터랙션 시 사운드 초기화
  const initSound = () => {
    if (!isInitialized) {
      soundManager.init();
      setIsInitialized(true);
      if (!soundManager.getBgmMuted()) {
        soundManager.playBGM();
      }
    }
  };

  useEffect(() => {
    // 페이지 클릭 시 초기화
    const handleClick = () => initSound();
    document.addEventListener('click', handleClick, { once: true });
    return () => document.removeEventListener('click', handleClick);
  }, [isInitialized]);

  const handleToggleBgm = () => {
    initSound();
    const newMuted = soundManager.toggleBgmMute();
    setIsBgmMuted(newMuted);
  };

  const handleToggleSfx = () => {
    initSound();
    const newMuted = soundManager.toggleSfxMute();
    setIsSfxMuted(newMuted);
  };

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
      {/* BGM 토글 */}
      <button
        onClick={handleToggleBgm}
        className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-stone-200 hover:bg-stone-50 transition-all"
        title={isBgmMuted ? 'BGM On' : 'BGM Off'}
      >
        {isBgmMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-stone-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
          </svg>
        )}
      </button>

      {/* SFX 토글 */}
      <button
        onClick={handleToggleSfx}
        className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-stone-200 hover:bg-stone-50 transition-all"
        title={isSfxMuted ? 'SFX On' : 'SFX Off'}
      >
        {isSfxMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* 언어 토글 */}
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-1 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-stone-200 hover:bg-stone-50 transition-all text-sm font-bold"
      >
        <span className="text-lg">🌐</span>
        <span className={lang === 'ko' ? 'text-stone-800' : 'text-stone-400'}>KO</span>
        <span className="text-stone-300">/</span>
        <span className={lang === 'en' ? 'text-stone-800' : 'text-stone-400'}>EN</span>
      </button>

      {/* 전체화면 토글 */}
      <button
        onClick={toggleFullscreen}
        className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-stone-200 hover:bg-stone-50 transition-all"
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default TopBar;
