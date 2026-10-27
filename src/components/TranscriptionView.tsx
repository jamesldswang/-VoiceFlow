import React, { useState, useRef, useEffect } from 'react';
import { TranscriptSegment } from '../types';
import {
  Copy,
  Check,
  Download,
  Sparkles,
  Clock,
  AlignLeft,
  FileText,
  Volume2,
  Trash2,
} from 'lucide-react';

interface TranscriptionViewProps {
  segments: TranscriptSegment[];
  interimText: string;
  isRecording: boolean;
  recordingSeconds: number;
  onCopyAll: () => void;
  isCopied: boolean;
  onClear: () => void;
  onOpenAiEnhance?: () => void;
  onUpdateSegment?: (id: string, text: string) => void;
}

export const TranscriptionView: React.FC<TranscriptionViewProps> = ({
  segments,
  interimText,
  isRecording,
  recordingSeconds,
  onCopyAll,
  isCopied,
  onClear,
  onOpenAiEnhance,
  onUpdateSegment,
}) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'paragraph'>('timeline');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new words come in
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [segments, interimText]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const fullText = segments.map((s) => s.text).join(' ') + (interimText ? ` ${interimText}` : '');
  const charCount = fullText.replace(/\s+/g, '').length;
  const wordCount = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;

  const downloadText = (format: 'txt' | 'srt') => {
    let content = '';
    let filename = `voiceflow_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'txt') {
      content = segments.map((s) => `[${formatSeconds(s.startTime)} - ${formatSeconds(s.endTime)}] ${s.text}`).join('\n\n');
      if (interimText) content += `\n[${formatSeconds(recordingSeconds)}] ${interimText}`;
      filename += '.txt';
    } else if (format === 'srt') {
      content = segments
        .map((s, idx) => {
          const sMin = Math.floor(s.startTime / 60);
          const sSec = Math.floor(s.startTime % 60);
          const eMin = Math.floor(s.endTime / 60);
          const eSec = Math.floor(s.endTime % 60);
          const tStart = `00:${sMin < 10 ? '0' : ''}${sMin}:${sSec < 10 ? '0' : ''}${sSec},000`;
          const tEnd = `00:${eMin < 10 ? '0' : ''}${eMin}:${eSec < 10 ? '0' : ''}${eSec},000`;
          return `${idx + 1}\n${tStart} --> ${tEnd}\n${s.text}\n`;
        })
        .join('\n');
      filename += '.srt';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasContent = segments.length > 0 || interimText.length > 0;

  return (
    <div className="flex flex-col h-full rounded-2xl bg-zinc-900/70 border border-zinc-800/80 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Action Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-800/90 px-4 py-3 bg-zinc-950/40 gap-2">
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-zinc-800/80 p-0.5 border border-zinc-700/50">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                viewMode === 'timeline'
                  ? 'bg-zinc-700 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>時間戳分段 (1~10秒)</span>
            </button>
            <button
              onClick={() => setViewMode('paragraph')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                viewMode === 'paragraph'
                  ? 'bg-zinc-700 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <AlignLeft className="h-3.5 w-3.5" />
              <span>純文章檢視</span>
            </button>
          </div>

          <span className="text-xs text-zinc-500 hidden sm:inline-block">
            {charCount} 字元 / {wordCount} 詞
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onOpenAiEnhance && (
            <button
              onClick={onOpenAiEnhance}
              disabled={!hasContent}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 text-xs font-medium transition disabled:opacity-40"
              title="使用 Gemini AI 潤飾標點符號、修正常見錯別字"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">AI 智慧潤飾</span>
            </button>
          )}

          <div className="relative group">
            <button
              disabled={!hasContent}
              className="flex items-center gap-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-40"
              title="匯出文件"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">匯出</span>
            </button>
            <div className="absolute right-0 top-full mt-1 hidden w-32 rounded-xl bg-zinc-800 p-1 text-xs shadow-xl ring-1 ring-zinc-700 group-hover:block z-20">
              <button
                onClick={() => downloadText('txt')}
                className="w-full text-left rounded-lg px-2.5 py-1.5 text-zinc-200 hover:bg-zinc-700"
              >
                純文字 (.txt)
              </button>
              <button
                onClick={() => downloadText('srt')}
                className="w-full text-left rounded-lg px-2.5 py-1.5 text-zinc-200 hover:bg-zinc-700"
              >
                字幕檔 (.srt)
              </button>
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={onCopyAll}
            disabled={!hasContent}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow transition active:scale-95 disabled:opacity-40 ${
              isCopied
                ? 'bg-emerald-600 text-white ring-1 ring-emerald-400'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
            title="複製全文，可在任何地方按 Ctrl+V 貼上"
          >
            {isCopied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>已複製！(Ctrl+V 貼上)</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>複製全文 (Ctrl+V)</span>
              </>
            )}
          </button>

          {hasContent && (
            <button
              onClick={onClear}
              className="p-1.5 text-zinc-500 hover:text-red-400 transition"
              title="清空轉寫內容"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-zinc-100 font-sans"
      >
        {!hasContent ? (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center text-zinc-500 p-8">
            <div className="h-14 w-14 rounded-full bg-zinc-800/80 flex items-center justify-center mb-4 text-zinc-400 ring-1 ring-zinc-700">
              <FileText className="h-7 w-7" />
            </div>
            <p className="text-base font-medium text-zinc-300">尚未開始錄音轉寫</p>
            <p className="mt-1 text-sm text-zinc-400 max-w-md">
              點擊上方 <span className="text-red-400 font-semibold">開始錄音</span> 或按下鍵盤快捷鍵{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-xs">
                Alt + R
              </kbd>
              ，即可邊錄邊轉。按{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-xs">
                Alt + X
              </kbd>{' '}
              自動停止並複製文字！
            </p>
          </div>
        ) : viewMode === 'timeline' ? (
          <div className="space-y-3">
            {segments.map((seg, idx) => (
              <div
                key={seg.id || idx}
                className="group relative rounded-xl bg-zinc-950/40 p-3.5 ring-1 ring-zinc-800/80 transition-all hover:ring-zinc-700"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-red-400 bg-red-950/40 px-2 py-0.5 rounded-full border border-red-900/50">
                    <Clock className="h-3 w-3" />
                    {formatSeconds(seg.startTime)} - {formatSeconds(seg.endTime)}
                  </span>
                  <span className="text-[11px] text-zinc-400 group-hover:text-zinc-400">
                    片段 #{idx + 1}
                  </span>
                </div>
                <p className="text-base leading-relaxed text-zinc-100 select-text">
                  {seg.text}
                </p>
              </div>
            ))}

            {/* Currently speaking interim chunk */}
            {isRecording && interimText && (
              <div className="relative rounded-xl bg-red-950/20 p-3.5 ring-1 ring-red-500/40 animate-pulse">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-rose-300 bg-red-900/50 px-2 py-0.5 rounded-full border border-red-700/60">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping inline-block mr-1" />
                    {formatSeconds(segments[segments.length - 1]?.endTime || 0)} - {formatSeconds(recordingSeconds)} (辨識中...)
                  </span>
                </div>
                <p className="text-base leading-relaxed text-rose-100/90 italic">
                  {interimText}
                  <span className="inline-block w-1.5 h-4 ml-1 bg-red-500 animate-pulse align-middle" />
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Pure paragraph view */
          <div className="rounded-xl bg-zinc-950/40 p-4 sm:p-6 ring-1 ring-zinc-800/80">
            <p className="text-base sm:text-lg leading-relaxed text-zinc-100 select-text whitespace-pre-wrap">
              {segments.map((s) => s.text).join(' ')}
              {interimText && (
                <span className="text-rose-300 italic ml-1">
                  {interimText}
                  <span className="inline-block w-1.5 h-4 ml-1 bg-red-500 animate-pulse align-middle" />
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Real-time status footer */}
      {isRecording && (
        <div className="border-t border-zinc-800/80 bg-red-950/30 px-4 py-2.5 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <span>內建語音引擎即時識別中... 講到第 20 秒時，前 10 秒已轉好並存檔</span>
          </div>
          <span className="font-mono font-bold text-red-400">
            {formatSeconds(recordingSeconds)}
          </span>
        </div>
      )}
    </div>
  );
};
