import React, { useState } from 'react';
import { RecordingRecord } from '../types';
import { X, Copy, Check, Trash2, Calendar, Clock, Play, Pause, Download } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: RecordingRecord[];
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  records,
  onDeleteRecord,
  onClearAll,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayAudio = (id: string, url?: string) => {
    if (!url) return;
    if (playingId === id) {
      audioElement?.pause();
      setPlayingId(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(url);
      audio.onended = () => setPlayingId(null);
      audio.play();
      setAudioElement(audio);
      setPlayingId(id);
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}分${s < 10 ? '0' : ''}${s}秒`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-zinc-900 p-6 text-white shadow-2xl ring-1 ring-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">歷史轉寫紀錄</h3>
            <p className="text-xs text-zinc-400">所有錄音與轉寫結果均妥善保存在本地裝置</p>
          </div>
          <div className="flex items-center gap-3">
            {records.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-red-400 hover:text-red-300 transition"
              >
                清除全部
              </button>
            )}
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {records.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              尚無轉寫紀錄。按 Alt+R 開始錄音吧！
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec.id}
                className="group rounded-xl bg-zinc-950/60 p-4 ring-1 ring-zinc-800/80 transition hover:ring-zinc-700"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{formatDate(rec.createdAt)}</span>
                    <span>•</span>
                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{formatDuration(rec.duration)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {rec.audioUrl && (
                      <button
                        onClick={() => handlePlayAudio(rec.id, rec.audioUrl)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
                        title={playingId === rec.id ? '暫停' : '播放錄音'}
                      >
                        {playingId === rec.id ? (
                          <Pause className="h-3.5 w-3.5 text-red-400" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(rec.id, rec.fullText)}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        copiedId === rec.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                      }`}
                      title="複製文字 (Ctrl+V 可貼上)"
                    >
                      {copiedId === rec.id ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>已複製</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>複製</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onDeleteRecord(rec.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition"
                      title="刪除此紀錄"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-zinc-200 line-clamp-3 select-text">
                  {rec.fullText}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
