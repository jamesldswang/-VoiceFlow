import React from 'react';
import { X, Keyboard, CheckCircle2, ArrowRight, Laptop, Smartphone, Tablet } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 p-6 text-white shadow-2xl ring-1 ring-zinc-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/20 text-red-400">
            <Keyboard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">極速語音轉寫流程指南</h3>
            <p className="text-xs text-zinc-400">支援手機、平板與電腦內建語音引擎</p>
          </div>
        </div>

        {/* 3 Step Workflow */}
        <div className="space-y-3 mb-6">
          {/* Step 1 */}
          <div className="rounded-xl bg-zinc-950/60 p-3.5 border border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-400">步驟 1：啟動錄音</span>
              <kbd className="rounded-md bg-zinc-800 border border-zinc-700 px-2 py-0.5 font-mono text-xs text-zinc-100 shadow">
                Alt + R
              </kbd>
            </div>
            <p className="mt-1 text-sm text-zinc-300">
              按下鍵盤 <kbd className="text-xs bg-zinc-800 px-1 py-0.5 rounded">Alt + R</kbd>（Mac 為 <kbd className="text-xs bg-zinc-800 px-1 py-0.5 rounded">⌥ Option + R</kbd>），螢幕即刻彈出如截圖所示的黑色橢圓膠囊「🔴 錄音中 0:25」，邊講邊轉！
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl bg-zinc-950/60 p-3.5 border border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400">步驟 2：停止並自動轉好文字</span>
              <kbd className="rounded-md bg-zinc-800 border border-zinc-700 px-2 py-0.5 font-mono text-xs text-zinc-100 shadow">
                Alt + X
              </kbd>
            </div>
            <p className="mt-1 text-sm text-zinc-300">
              說完話後，按下 <kbd className="text-xs bg-zinc-800 px-1 py-0.5 rounded">Alt + X</kbd>，系統立刻終止錄音，並<b>自動將完整轉寫文字複製到系統剪貼簿</b>！
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl bg-zinc-950/60 p-3.5 border border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400">步驟 3：隨處貼上</span>
              <kbd className="rounded-md bg-zinc-800 border border-zinc-700 px-2 py-0.5 font-mono text-xs text-zinc-100 shadow">
                Ctrl + V
              </kbd>
            </div>
            <p className="mt-1 text-sm text-zinc-300">
              切換到任何軟體（Word、LINE、聊天視窗、筆記本、Google 文件），直接按 <kbd className="text-xs bg-zinc-800 px-1 py-0.5 rounded">Ctrl + V</kbd>（Mac 為 <kbd className="text-xs bg-zinc-800 px-1 py-0.5 rounded">Cmd + V</kbd>）即可貼上文字！
            </p>
          </div>
        </div>

        {/* Device compatibility badge */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-zinc-400 border-t border-zinc-800 pt-4">
          <div className="flex flex-col items-center gap-1">
            <Laptop className="h-4 w-4 text-zinc-300" />
            <span>電腦 (Mac/Win)</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Tablet className="h-4 w-4 text-zinc-300" />
            <span>平板 (iPad/Android)</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Smartphone className="h-4 w-4 text-zinc-300" />
            <span>手機 (iOS/Android)</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition"
        >
          立即體驗
        </button>
      </div>
    </div>
  );
};
