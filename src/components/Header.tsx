import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Mic,
  Languages,
  History,
  Settings,
  Keyboard,
  Info,
} from 'lucide-react';

interface HeaderProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  historyCount: number;
}

const SUPPORTED_LANGUAGES = [
  { code: 'zh-TW', name: '繁體中文 (台灣)' },
  { code: 'zh-HK', name: '廣東話 (香港)' },
  { code: 'zh-CN', name: '簡體中文 (普通話)' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'ja-JP', name: '日本語' },
  { code: 'ko-KR', name: '한국어' },
  { code: 'es-ES', name: 'Español' },
];

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  onOpenHistory,
  onOpenSettings,
  onOpenShortcuts,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 shadow-md shadow-red-900/30 ring-1 ring-red-400/40">
            <Mic className="h-5 w-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-zinc-950" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                聲動轉寫 VoiceFlow
              </h1>
              <span className="rounded-md bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 border border-zinc-700/60 hidden sm:inline-block">
                PWA 原生獨立模式
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              手機 · 平板 · 電腦內建錄音轉文字
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative flex items-center">
            <Languages className="absolute left-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="appearance-none rounded-xl border border-zinc-800 bg-zinc-900/90 py-1.5 pl-8 pr-7 text-xs font-medium text-zinc-200 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-red-500 transition cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-zinc-900 text-white">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Shortcut cheatsheet trigger */}
          <button
            onClick={onOpenShortcuts}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
            title="查看鍵盤快捷鍵 (Alt+R, Alt+X, Ctrl+V)"
          >
            <Keyboard className="h-3.5 w-3.5 text-red-400" />
            <span className="hidden md:inline">快捷鍵</span>
          </button>

          {/* History modal trigger */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
            title="歷史轉寫紀錄"
          >
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">歷史</span>
            {historyCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {historyCount}
              </span>
            )}
          </button>

          {/* Settings modal trigger */}
          <button
            onClick={onOpenSettings}
            className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
            title="偏好設定"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
