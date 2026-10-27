export interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  isFinal: boolean;
}

export interface RecordingRecord {
  id: string;
  title: string;
  createdAt: number;
  duration: number; // seconds
  fullText: string;
  segments: TranscriptSegment[];
  audioUrl?: string;
  audioBlob?: Blob;
  wordCount: number;
  language: string;
}

export interface AppSettings {
  language: string;
  autoCopyOnStop: boolean;
  includeTimestampsOnCopy: boolean;
  smartPunctuation: boolean;
  floatingWidgetEnabled: boolean;
  floatingPosition: { x: number; y: number };
  theme: 'dark' | 'light' | 'system';
  customStartShortcut: string; // e.g. "Alt+R"
  customStopShortcut: string;  // e.g. "Alt+X"
}

export type RecordingState = 'idle' | 'recording' | 'paused';
