
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useFullscreen } from '../hooks/useFullscreen';

const TopBar: React.FC = () => {
  const { lang, toggleLanguage } = useLanguage();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
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
