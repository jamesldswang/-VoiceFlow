import React from 'react';
import { AppSettings } from '../types';
import { X, Sliders } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 p-6 text-white shadow-2xl ring-1 ring-zinc-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-zinc-800 pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/20 text-red-400">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">偏好設定</h3>
            <p className="text-xs text-zinc-400">自訂轉寫、自動複製與懸浮島行為</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Auto copy on stop */}
          <div className="flex items-center justify-between rounded-xl bg-zinc-950/60 p-3.5 border border-zinc-800/80">
            <div>
              <p className="text-sm font-semibold text-zinc-200">停止時自動複製 (Alt+X)</p>
              <p className="text-xs text-zinc-400">
                按 Alt+X 或結束錄音後，立即將文字寫入剪貼簿，待您直接按 Ctrl+V 貼上
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoCopyOnStop}
              onChange={(e) => onUpdateSettings({ autoCopyOnStop: e.target.checked })}
              className="h-5 w-5 rounded border-zinc-700 bg-zinc-800 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
            />
          </div>

          {/* Include timestamps in copied text */}
          <div className="flex items-center justify-between rounded-xl bg-zinc-950/60 p-3.5 border border-zinc-800/80">
            <div>
              <p className="text-sm font-semibold text-zinc-200">複製時附加時間戳</p>
              <p className="text-xs text-zinc-400">
                例如包含 [00:00 - 00:10]，適合做會議分段筆記或逐字稿
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.includeTimestampsOnCopy}
              onChange={(e) => onUpdateSettings({ includeTimestampsOnCopy: e.target.checked })}
              className="h-5 w-5 rounded border-zinc-700 bg-zinc-800 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
            />
          </div>

          {/* Floating capsule enabled */}
          <div className="flex items-center justify-between rounded-xl bg-zinc-950/60 p-3.5 border border-zinc-800/80">
            <div>
              <p className="text-sm font-semibold text-zinc-200">顯示動態島懸浮膠囊</p>
              <p className="text-xs text-zinc-400">
                錄音時在螢幕頂部出現「🔴 錄音中 0:25」小元件，可自由拖曳
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.floatingWidgetEnabled}
              onChange={(e) => onUpdateSettings({ floatingWidgetEnabled: e.target.checked })}
              className="h-5 w-5 rounded border-zinc-700 bg-zinc-800 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition"
        >
          完成儲存
        </button>
      </div>
    </div>
  );
};
