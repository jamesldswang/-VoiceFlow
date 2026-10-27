import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Laptop } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone mode as installed PWA, hide install prompt
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-950/40 border border-emerald-800/60 px-3 py-1 text-xs text-emerald-300">
        <Check className="h-3 w-3 text-emerald-400" />
        <span>原生應用程式模式</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-red-950/40 transition active:scale-95 animate-pulse hover:animate-none"
        title="安裝到手機/平板/電腦，成為免瀏覽器網址列的獨立 APP"
      >
        <Download className="h-3.5 w-3.5" />
        <span>安裝為獨立 APP</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition"
          title="將此應用安裝到 iPhone / iPad 主畫面"
        >
          <Smartphone className="h-3.5 w-3.5 text-red-400" />
          <span>安裝至 iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-sm rounded-2xl bg-zinc-900 p-6 text-white shadow-2xl ring-1 ring-zinc-700">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute right-4 top-4 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/20 text-red-400">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">安裝到 iPhone / iPad</h3>
                  <p className="text-xs text-zinc-400">免網頁框架，體驗全螢幕獨立 APP</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-zinc-300">
                <div className="flex items-start gap-3 rounded-xl bg-zinc-800/60 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600/30 font-bold text-red-400 text-xs">
                    1
                  </span>
                  <p>在 Safari 瀏覽器底部工具列點擊「<strong>分享</strong>」圖示（方形箭頭向上）。</p>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-zinc-800/60 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600/30 font-bold text-red-400 text-xs">
                    2
                  </span>
                  <p>向下滾動並點選「<strong>加入主畫面</strong>」(Add to Home Screen)。</p>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-zinc-800/60 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600/30 font-bold text-red-400 text-xs">
                    3
                  </span>
                  <p>點擊右上角「<strong>新增</strong>」，桌面即可像原生 APP 一般隨時開啟！</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition"
              >
                我知道了
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback desktop button for Chrome/Edge if install prompt hasn't fired yet
  return (
    <button
      onClick={() => {
        alert('請在瀏覽器網址列右側點擊「安裝」圖示，或在選單中點選「安裝 聲動轉寫」，即可在電腦或手機上以獨立視窗運行！');
      }}
      className="hidden sm:flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition"
      title="安裝為桌面/手機獨立應用"
    >
      <Laptop className="h-3.5 w-3.5 text-zinc-400" />
      <span>安裝 APP</span>
    </button>
  );
};
