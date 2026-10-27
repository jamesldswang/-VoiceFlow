import { useState, useEffect, useRef, useCallback } from 'react';
import { TranscriptSegment } from '../types';

interface UseSpeechRecognitionProps {
  language: string;
  onAutoCopy?: (text: string) => void;
  getRecordingTime: () => number;
}

// Typing for Web Speech API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export function useSpeechRecognition({
  language,
  getRecordingTime,
}: UseSpeechRecognitionProps) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [interimText, setInterimText] = useState<string>('');
  const [lastFinalSegmentTime, setLastFinalSegmentTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isIntentionalStopRef = useRef<boolean>(true);
  const currentLanguageRef = useRef<string>(language);
  const currentSegmentStartRef = useRef<number>(0);

  useEffect(() => {
    currentLanguageRef.current = language;
    if (recognitionRef.current && isListening) {
      recognitionRef.current.lang = language;
    }
  }, [language, isListening]);

  useEffect(() => {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
    const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);
  }, []);

  const createRecognitionInstance = useCallback(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return null;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = currentLanguageRef.current;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let currentInterim = '';
      const currentTime = getRecordingTime();

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          const trimmed = transcriptPart.trim();
          if (trimmed.length > 0) {
            const segStart = currentSegmentStartRef.current;
            const segEnd = Math.max(currentTime, segStart + 1);

            const newSeg: TranscriptSegment = {
              id: `seg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              text: trimmed,
              startTime: segStart,
              endTime: segEnd,
              isFinal: true,
            };

            setSegments((prev) => [...prev, newSeg]);
            currentSegmentStartRef.current = segEnd;
            setLastFinalSegmentTime(segEnd);
          }
        } else {
          currentInterim += transcriptPart;
        }
      }

      setInterimText(currentInterim);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition event error:', event.error);
      if (event.error === 'no-speech') {
        // User is silent, continue listening
        return;
      }
      if (event.error === 'not-allowed') {
        setError('麥克風權限被拒絕，請在瀏覽器設定中允許麥克風權限。');
        setIsListening(false);
        isIntentionalStopRef.current = true;
        return;
      }
      if (event.error === 'audio-capture') {
        setError('找不到音訊輸入裝置，請檢查麥克風連線。');
        setIsListening(false);
        isIntentionalStopRef.current = true;
        return;
      }
      // For network errors or aborted, if user didn't intentionally stop, auto-retry
      if (!isIntentionalStopRef.current) {
        try {
          recognition.abort();
        } catch {}
      }
    };

    recognition.onend = () => {
      // Browsers often time out continuous recognition after a period of silence.
      // If the user has NOT pressed stop, automatically resume!
      if (!isIntentionalStopRef.current) {
        try {
          setTimeout(() => {
            if (!isIntentionalStopRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                // If already started or restarting
              }
            }
          }, 150);
        } catch {}
      } else {
        setIsListening(false);
      }
    };

    return recognition;
  }, [getRecordingTime]);

  const startListening = useCallback(() => {
    isIntentionalStopRef.current = false;
    setError(null);
    currentSegmentStartRef.current = 0;

    if (!recognitionRef.current) {
      recognitionRef.current = createRecognitionInstance();
    }

    if (recognitionRef.current) {
      recognitionRef.current.lang = currentLanguageRef.current;
      try {
        recognitionRef.current.start();
      } catch (err: any) {
        // If already started, abort and recreate
        try {
          recognitionRef.current.abort();
          setTimeout(() => {
            recognitionRef.current?.start();
          }, 100);
        } catch (e) {
          console.error('Failed to start speech recognition:', e);
        }
      }
    }
  }, [createRecognitionInstance]);

  const stopListening = useCallback(() => {
    isIntentionalStopRef.current = true;
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    // Flush any pending interim text into final segment
    setInterimText((prev) => {
      const trimmed = prev.trim();
      if (trimmed.length > 0) {
        const currentTime = getRecordingTime();
        const newSeg: TranscriptSegment = {
          id: `seg_${Date.now()}_final`,
          text: trimmed,
          startTime: currentSegmentStartRef.current,
          endTime: Math.max(currentTime, currentSegmentStartRef.current + 1),
          isFinal: true,
        };
        setSegments((s) => [...s, newSeg]);
      }
      return '';
    });
  }, [getRecordingTime]);

  const resetTranscript = useCallback(() => {
    setSegments([]);
    setInterimText('');
    setLastFinalSegmentTime(0);
    currentSegmentStartRef.current = 0;
  }, []);

  const getFullText = useCallback(() => {
    const finalTxt = segments.map((s) => s.text).join(' ');
    const pendingTxt = interimText.trim();
    if (!pendingTxt) return finalTxt;
    return finalTxt ? `${finalTxt} ${pendingTxt}` : pendingTxt;
  }, [segments, interimText]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    segments,
    interimText,
    lastFinalSegmentTime,
    error,
    clearError,
    startListening,
    stopListening,
    resetTranscript,
    setSegments,
    getFullText,
  };
}
