import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { FloatingCapsule } from './components/FloatingCapsule';
import { AudioWaveform } from './components/AudioWaveform';
import { TranscriptionView } from './components/TranscriptionView';
import { ShortcutsModal } from './components/ShortcutsModal';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { AiEnhanceModal } from './components/AiEnhanceModal';
import { MicrophonePermissionBanner } from './components/MicrophonePermissionBanner';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { AppSettings, RecordingRecord, TranscriptSegment } from './types';
import {
  Mic,
  Square,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Laptop,
  Smartphone,
  Tablet,
  Volume2,
  ExternalLink,
  Info,
} from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'zh-TW',
  autoCopyOnStop: true,
  includeTimestampsOnCopy: false,
  smartPunctuation: true,
  floatingWidgetEnabled: true,
  floatingPosition: { x: 20, y: 20 },
  theme: 'dark',
  customStartShortcut: 'Alt+R',
  customStopShortcut: 'Alt+X',
};

export default function App() {
  // Application settings stored in localStorage
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('voiceflow_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // History records stored in localStorage
  const [records, setRecords] = useState<RecordingRecord[]>(() => {
    try {
      const saved = localStorage.getItem('voiceflow_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Recording timer state
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const timerIntervalRef = useRef<number | null>(null);

  // Copy feedback state
  const [isCopiedAlert, setIsCopiedAlert] = useState<boolean>(false);
  const [copiedNotificationText, setCopiedNotificationText] = useState<string>('');

  // Modals state
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiEnhanceOpen, setIsAiEnhanceOpen] = useState(false);

  // Audio Recorder Hook
  const {
    isRecording,
    waveformBars,
    volumeLevel,
    micError,
    clearMicError,
    testPermission,
    startRecording: startAudioRecord,
    stopRecording: stopAudioRecord,
  } = useAudioRecorder();

  // Speech Recognition Hook
  const getRecordingTime = useCallback(() => recordingSeconds, [recordingSeconds]);

  const {
    isSupported: isSpeechSupported,
    isListening,
    segments,
    interimText,
    error: speechError,
    clearError: clearSpeechError,
    startListening,
    stopListening,
    resetTranscript,
    setSegments,
    getFullText,
  } = useSpeechRecognition({
    language: settings.language,
    getRecordingTime,
  });

  const handleRetryMicrophone = useCallback(async () => {
    clearMicError();
    clearSpeechError();
    const ok = await testPermission();
    if (ok) {
      copyTextToClipboard('麥克風已就緒！請按 Alt+R 開始錄音轉寫。');
    }
  }, [clearMicError, clearSpeechError, testPermission]);

  // Save settings when changed
  useEffect(() => {
    try {
      localStorage.setItem('voiceflow_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Save records when changed
  useEffect(() => {
    try {
      localStorage.setItem('voiceflow_history', JSON.stringify(records));
    } catch {}
  }, [records]);

  // Timer counter when recording
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  // Trigger copy to clipboard with friendly notification
  const copyTextToClipboard = useCallback((textToCopy: string, customNotice?: string) => {
    if (!textToCopy || !textToCopy.trim()) return;

    try {
      navigator.clipboard.writeText(textToCopy);
      setIsCopiedAlert(true);
      setCopiedNotificationText(
        customNotice || '文字已複製至剪貼簿！可在任何地方按 Ctrl+V (或 Cmd+V) 立即貼上。'
      );
      setTimeout(() => setIsCopiedAlert(false), 3800);
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }
  }, []);

  // START RECORDING (Alt+R or Button)
  const handleStartRecording = useCallback(() => {
    if (isRecording) return;
    resetTranscript();
    startAudioRecord();
    startListening();
  }, [isRecording, resetTranscript, startAudioRecord, startListening]);

  // STOP RECORDING & COPY (Alt+X or Button)
  const handleStopRecordingAndCopy = useCallback(async () => {
    if (!isRecording) return;

    // Stop listening & flush any active speech chunk
    stopListening();
    const recordedBlob = await stopAudioRecord();

    // Generate formatted full text
    setTimeout(() => {
      const full = getFullText();
      let textToCopy = full;

      if (settings.includeTimestampsOnCopy) {
        textToCopy = segments
          .map((s) => {
            const m1 = Math.floor(s.startTime / 60);
            const s1 = Math.floor(s.startTime % 60);
            const m2 = Math.floor(s.endTime / 60);
            const s2 = Math.floor(s.endTime % 60);
            return `[${m1}:${s1 < 10 ? '0' : ''}${s1} - ${m2}:${s2 < 10 ? '0' : ''}${s2}] ${s.text}`;
          })
          .join('\n');
      }

      // Auto copy to clipboard if enabled (Default: true)
      if (settings.autoCopyOnStop && textToCopy.trim()) {
        copyTextToClipboard(
          textToCopy,
          '錄音已完成！轉寫文字已自動複製至剪貼簿，直接按 Ctrl+V 貼上即可。'
        );
      }

      // Save to history record
      if (full.trim()) {
        const newRecord: RecordingRecord = {
          id: `rec_${Date.now()}`,
          title: `錄音轉寫 (${new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })})`,
          createdAt: Date.now(),
          duration: recordingSeconds || 1,
          fullText: full,
          segments: [...segments],
          audioBlob: recordedBlob || undefined,
          wordCount: full.length,
          language: settings.language,
        };
        setRecords((prev) => [newRecord, ...prev].slice(0, 50));
      }
    }, 120);
  }, [
    isRecording,
    stopListening,
    stopAudioRecord,
    getFullText,
    segments,
    settings.includeTimestampsOnCopy,
    settings.autoCopyOnStop,
    settings.language,
    recordingSeconds,
    copyTextToClipboard,
  ]);

  // Global Keyboard Shortcuts (Alt+R to start, Alt+X to stop & copy)
  useKeyboardShortcuts({
    onStart: handleStartRecording,
    onStop: handleStopRecordingAndCopy,
    isRecording,
    enabled: true,
  });

  const handleCopyCurrent = () => {
    const full = getFullText();
    copyTextToClipboard(full, '文字已複製至剪貼簿！可在任何地方按 Ctrl+V 貼上。');
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAllRecords = () => {
    if (confirm('確定要清空所有歷史轉寫紀錄嗎？')) {
      setRecords([]);
    }
  };

  const handleApplyAiText = (newText: string) => {
    // Replace current segments with refined text
    const newSeg: TranscriptSegment = {
      id: `seg_ai_${Date.now()}`,
      text: newText,
      startTime: 0,
      endTime: recordingSeconds || 10,
      isFinal: true,
    };
    setSegments([newSeg]);
    copyTextToClipboard(newText, 'AI 潤飾文字已套用並複製到剪貼簿！');
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-red-500/30 selection:text-white">
      {/* Header */}
      <Header
        currentLanguage={settings.language}
        onLanguageChange={(lang) => handleUpdateSettings({ language: lang })}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        historyCount={records.length}
      />

      {/* Floating Capsule Widget (Matches Screenshot '🔴 錄音中 0:25') */}
      {settings.floatingWidgetEnabled && (
        <FloatingCapsule
          isRecording={isRecording}
          recordingSeconds={recordingSeconds}
          waveformBars={waveformBars}
          interimText={interimText}
          onStopAndCopy={handleStopRecordingAndCopy}
          onCopyCurrent={handleCopyCurrent}
          isCopied={isCopiedAlert}
        />
      )}

      {/* Copied Success Floating Toast Banner */}
      {isCopiedAlert && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-2xl bg-zinc-900/95 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl ring-2 ring-emerald-500/70 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-black">
            <Check className="h-4 w-4 stroke-[3]" />
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-100">{copiedNotificationText}</span>
            <span className="text-xs text-emerald-400 font-normal">
              提示：切換至任何視窗直接按 Ctrl+V (或 Cmd+V)
            </span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6 gap-5">
        
        {/* Top Control Hero Card */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-zinc-950/70 p-5 sm:p-7 ring-1 ring-zinc-800 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Left: Status & Shortcuts prompt */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    isRecording
                      ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/40 animate-pulse'
                      : 'bg-zinc-800 text-zinc-300 ring-1 ring-zinc-700/60'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isRecording ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-zinc-500'
                    }`}
                  />
                  {isRecording ? `錄音轉寫中 • ${formatSeconds(recordingSeconds)}` : '待命錄音 (隨按即錄)'}
                </span>

                <span className="text-xs text-zinc-400 hidden sm:inline">
                  {settings.language === 'zh-TW'
                    ? '台灣繁體中文'
                    : settings.language === 'zh-HK'
                    ? '粵語'
                    : settings.language === 'zh-CN'
                    ? '簡體普通話'
                    : settings.language}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {isRecording ? '語音即時邊錄邊轉中...' : '隨時按下快捷鍵開始轉寫'}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                按 <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-red-300 font-mono text-xs font-semibold">Alt + R</kbd> 開始錄音並彈出懸浮膠囊；按 <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-emerald-300 font-mono text-xs font-semibold">Alt + X</kbd> 停止並自動複製，直接在任何地方按 <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-white font-mono text-xs font-semibold">Ctrl + V</kbd> 貼上！
              </p>
            </div>

            {/* Right: Big interactive trigger button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="group relative flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 px-7 py-3.5 text-base font-bold text-white shadow-xl shadow-red-950/60 ring-1 ring-red-400/50 transition-all active:scale-95 cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                    <Mic className="h-4 w-4 text-white group-hover:scale-110 transition" />
                  </div>
                  <span>開始錄音</span>
                  <span className="rounded-lg bg-black/30 px-2 py-0.5 font-mono text-xs text-red-200">
                    Alt + R
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleStopRecordingAndCopy}
                  className="group relative flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 px-7 py-3.5 text-base font-bold text-white shadow-xl shadow-red-950/70 ring-2 ring-red-400 animate-pulse hover:animate-none transition-all active:scale-95 cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                    <Square className="h-4 w-4 fill-white text-white" />
                  </div>
                  <span>停止並複製文字</span>
                  <span className="rounded-lg bg-black/30 px-2 py-0.5 font-mono text-xs text-red-100">
                    Alt + X
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Real-time Audio Waveform display */}
          <div className="mt-5">
            <AudioWaveform
              bars={waveformBars}
              isRecording={isRecording}
              volumeLevel={volumeLevel}
            />
          </div>

          {/* Errors banner if permission denied */}
          <div className="mt-4">
            <MicrophonePermissionBanner
              error={micError || speechError}
              onRetry={handleRetryMicrophone}
            />
          </div>
        </section>

        {/* Feature Pill Instructions */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-2xl bg-zinc-900/60 p-3.5 border border-zinc-800/60">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-600/20 text-red-400 font-mono font-bold text-sm">
              01
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200">邊錄邊轉不卡頓</p>
              <p className="text-[11px] text-zinc-400">講到第 20 秒，前 10 秒已轉完存檔</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-zinc-900/60 p-3.5 border border-zinc-800/60">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-600/20 text-amber-400 font-mono font-bold text-sm">
              02
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200">Alt+X 停止即自動複製</p>
              <p className="text-[11px] text-zinc-400">結束即寫入剪貼簿，免手動反白按複製</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-zinc-900/60 p-3.5 border border-zinc-800/60">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 font-mono font-bold text-sm">
              03
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200">隨處貼上 Ctrl+V</p>
              <p className="text-[11px] text-zinc-400">支援 Word、LINE、Google Docs、記事本</p>
            </div>
          </div>
        </section>

        {/* Main Transcription Area */}
        <section className="flex-1 min-h-[380px]">
          <TranscriptionView
            segments={segments}
            interimText={interimText}
            isRecording={isRecording}
            recordingSeconds={recordingSeconds}
            onCopyAll={handleCopyCurrent}
            isCopied={isCopiedAlert}
            onClear={resetTranscript}
            onOpenAiEnhance={() => setIsAiEnhanceOpen(true)}
          />
        </section>
      </main>

      {/* Modals */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={records}
        onDeleteRecord={handleDeleteRecord}
        onClearAll={handleClearAllRecords}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <AiEnhanceModal
        isOpen={isAiEnhanceOpen}
        onClose={() => setIsAiEnhanceOpen(false)}
        rawText={getFullText()}
        onApplyText={handleApplyAiText}
      />
    </div>
  );
}
