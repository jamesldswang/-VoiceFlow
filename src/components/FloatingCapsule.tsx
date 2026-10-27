import React, { useState, useRef, useEffect } from 'react';
import { Square, Copy, Check, Volume2, Move, Minimize2, Maximize2 } from 'lucide-react';

interface FloatingCapsuleProps {
  isRecording: boolean;
  recordingSeconds: number;
  waveformBars: number[];
  interimText: string;
  onStopAndCopy: () => void;
  onCopyCurrent: () => void;
  isCopied: boolean;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
}

export const FloatingCapsule: React.FC<FloatingCapsuleProps> = ({
  isRecording,
  recordingSeconds,
  waveformBars,
  interimText,
  onStopAndCopy,
  onCopyCurrent,
  isCopied,
  onToggleExpand,
  isExpanded = false,
}) => {
  // Draggable state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });
  const capsuleRef = useRef<HTMLDivElement>(null);

  // Initialize position at top center
  useEffect(() => {
    if (typeof window !== 'undefined' && position === null) {
      setPosition({
        x: Math.max(16, (window.innerWidth - 320) / 2),
        y: 20,
      });
    }
  }, [position]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag from non-button elements or drag handle
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    if (!position) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    const newX = Math.max(8, Math.min(window.innerWidth - 180, dragStartRef.current.posX + deltaX));
    const newY = Math.max(8, Math.min(window.innerHeight - 80, dragStartRef.current.posY + deltaY));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  if (!isRecording && !isCopied) {
    return null;
  }

  const posX = position ? position.x : 20;
  const posY = position ? position.y : 20;

  return (
    <div
      ref={capsuleRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        transform: `translate3d(${posX}px, ${posY}px, 0)`,
        touchAction: 'none',
      }}
      className={`fixed top-0 left-0 z-50 select-none transition-shadow ${
        isDragging ? 'cursor-grabbing scale-[1.02]' : 'cursor-grab'
      }`}
    >
      {/* Outer Glow & Main Pill Container */}
      <div className="group relative flex items-center gap-3 rounded-full bg-[#18181b]/95 px-4 py-2 text-white shadow-2xl ring-1 ring-red-500/40 backdrop-blur-xl transition-all duration-200 hover:ring-red-400">
        
        {/* Pulsing Red Dot matching screenshot */}
        <div className="relative flex items-center justify-center">
          <span className="relative flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-gradient-to-tr from-red-600 to-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
          </span>
        </div>

        {/* Text "錄音中 0:25" */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wide text-zinc-100">
            {isRecording ? '錄音中' : '已停止'}
          </span>
          <span className="font-mono text-sm font-bold text-red-400">
            {formatTime(recordingSeconds)}
          </span>
        </div>

        {/* Micro-audio waveform bars */}
        {isRecording && (
          <div className="hidden sm:flex items-center gap-0.5 h-4 px-1">
            {waveformBars.slice(0, 7).map((height, idx) => (
              <span
                key={idx}
                style={{ height: `${Math.max(4, (height / 100) * 16)}px` }}
                className="w-0.5 rounded-full bg-red-400 transition-all duration-75"
              />
            ))}
          </div>
        )}

        {/* Vertical divider */}
        <div className="h-4 w-px bg-zinc-700/80" />

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Stop & Copy (Alt + X) button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStopAndCopy();
            }}
            title="停止錄音並複製文字 (快捷鍵: Alt+X)"
            className="flex items-center gap-1 rounded-full bg-red-600/90 hover:bg-red-500 active:scale-95 px-2.5 py-1 text-xs font-semibold text-white shadow transition"
          >
            <Square className="h-3 w-3 fill-white" />
            <span>完成轉寫</span>
            <span className="hidden sm:inline-block ml-0.5 rounded bg-black/30 px-1 py-0.2 text-[10px] text-zinc-200">
              Alt+X
            </span>
          </button>

          {/* Quick Copy button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopyCurrent();
            }}
            title="複製目前文字"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition active:scale-95"
          >
            {isCopied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Toggle Expand / Fullscreen button */}
          {onToggleExpand && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              title={isExpanded ? '縮小懸浮膠囊' : '展開完整編輯器'}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition active:scale-95"
            >
              {isExpanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          {/* Drag handle icon */}
          <span title="按住可拖曳位置" className="text-zinc-500 hover:text-zinc-400 cursor-grab pl-0.5">
            <Move className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {/* Floating mini preview if speaking */}
      {isRecording && interimText && (
        <div className="mt-2 max-w-sm rounded-xl bg-zinc-900/90 p-2.5 text-xs text-zinc-300 shadow-xl ring-1 ring-zinc-800 backdrop-blur-md animate-in fade-in slide-in-from-top-1">
          <p className="line-clamp-2 italic text-zinc-300">
            "{interimText}"
          </p>
        </div>
      )}
    </div>
  );
};
