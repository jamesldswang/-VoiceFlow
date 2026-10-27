import React, { useState } from 'react';
import { AlertTriangle, ExternalLink, RefreshCw, HelpCircle, X, ShieldAlert } from 'lucide-react';

interface MicrophonePermissionBannerProps {
  error: string | null;
  onRetry: () => void;
}

export const MicrophonePermissionBanner: React.FC<MicrophonePermissionBannerProps> = ({
  error,
  onRetry,
}) => {
  const [showGuide, setShowGuide] = useState(false);
  const [retrying, setRetrying] = useState(false);

  if (!error) return null;

  const isDenied =
    error.includes('權限') ||
    error.includes('Permission') ||
    error.includes('not-allowed') ||
    error.includes('Denied');

  const handleRetry = async () => {
    setRetrying(true);
    await onRetry();
    setTimeout(() => setRetrying(false), 800);
  };

  const handleOpenDirect = () => {
    // Open the direct shared URL outside the AI Studio editor iframe
    const directUrl = window.location.href.includes('ais-')
      ? window.location.href.replace('ais-dev-', 'ais-pre-')
      : window.location.href;
    window.open(directUrl, '_blank');
  };

  return (
    <>
      <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-4 shadow-xl backdrop-blur-md animate-in fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-600/30 text-red-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-200">
                麥克風權限受阻（Permission Denied）
              </h4>
              <p className="mt-0.5 text-xs text-red-300/90 leading-relaxed">
                瀏覽器封鎖了麥克風存取。在 AI Studio 內嵌預覽視窗中，瀏覽器常會預設安全封鎖。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-950/50 transition cursor-pointer active:scale-95 animate-pulse hover:animate-none"
              title="點擊以立即啟用麥克風權限"
            >
              <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
              <span>點我立即啟用麥克風</span>
            </button>

            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 transition cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5 text-zinc-400" />
              <span>查看說明</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guide Dialog */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 p-6 text-white shadow-2xl ring-1 ring-zinc-800">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/20 text-red-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">如何開啟麥克風權限</h3>
                <p className="text-xs text-zinc-400">依照以下步驟即可解除封鎖</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-zinc-300">
              <div className="rounded-xl bg-zinc-950/60 p-3.5 border border-zinc-800">
                <span className="font-semibold text-red-400">方法一（最快）：在新分頁開啟</span>
                <p className="mt-1 text-zinc-400">
                  點選「在新分頁開啟完整應用」，獨立網頁開啟時，點選「允許使用麥克風」即可。
                </p>
              </div>

              <div className="rounded-xl bg-zinc-950/60 p-3.5 border border-zinc-800">
                <span className="font-semibold text-red-400">方法二：更改瀏覽器網址列設定</span>
                <p className="mt-1 text-zinc-400">
                  1. 點擊瀏覽器最上方網址列左側的 <strong>「網站資訊 / 鎖頭 🔒」</strong> 圖示。<br />
                  2. 找到 <strong>「麥克風 (Microphone)」</strong>。<br />
                  3. 將開關切換為 <strong>「允許 (Allow)」</strong>。<br />
                  4. 重新整理頁面即可！
                </p>
              </div>
            </div>

            <a
              href="https://ais-pre-vla6ivmyt2n7v6tj7s3dhv-603062158148.asia-east1.run.app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowGuide(false)}
              className="mt-5 block text-center rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition cursor-pointer"
            >
              直接在新分頁開啟
            </a>
          </div>
        </div>
      )}
    </>
  );
};
