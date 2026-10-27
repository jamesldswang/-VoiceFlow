import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [waveformBars, setWaveformBars] = useState<number[]>(new Array(16).fill(10));
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const stopAudioAnalysis = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    setVolumeLevel(0);
    setWaveformBars(new Array(16).fill(10));
  }, []);

  const startRecording = useCallback(async () => {
    setMicError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // Audio analysis for live visualizer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        const bars: number[] = [];
        const step = Math.max(1, Math.floor(dataArray.length / 16));

        for (let i = 0; i < 16; i++) {
          const val = dataArray[i * step] || 0;
          bars.push(Math.max(12, Math.min(100, (val / 255) * 100)));
          sum += val;
        }

        const avg = sum / dataArray.length;
        setVolumeLevel(avg / 255);
        setWaveformBars(bars);

        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();

      // Setup MediaRecorder
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setAudioUrl(url);
      };

      recorder.start(250); // Slice every 250ms
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setMicError(
        err.name === 'NotAllowedError'
          ? '麥克風使用權限未開啟，請在瀏覽器網址列左側點擊允許麥克風。'
          : '無法啟用麥克風設備，請確認裝置連線。'
      );
      stopAudioAnalysis();
    }
  }, [stopAudioAnalysis]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      stopAudioAnalysis();

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
          const mime = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const blob = new Blob(audioChunksRef.current, { type: mime });
          setAudioBlob(blob);
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);

          // Stop all audio tracks
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
          }
          setIsRecording(false);
          resolve(blob);
        };
        mediaRecorderRef.current.stop();
      } else {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
        setIsRecording(false);
        resolve(null);
      }
    });
  }, [stopAudioAnalysis]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAudioAnalysis();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stopAudioAnalysis]);

  const clearMicError = useCallback(() => {
    setMicError(null);
  }, []);

  const testPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicError(null);
      return true;
    } catch (err: any) {
      console.warn('Microphone permission check failed:', err);
      setMicError(
        err.name === 'NotAllowedError' || err.message?.includes('Permission denied')
          ? '麥克風權限被封鎖（Permission Denied），請點擊下方「解除步驟」或在新分頁開啟。'
          : '無法啟用麥克風設備，請確認裝置連線。'
      );
      return false;
    }
  }, []);

  return {
    isRecording,
    audioUrl,
    audioBlob,
    volumeLevel,
    waveformBars,
    micError,
    clearMicError,
    testPermission,
    startRecording,
    stopRecording,
  };
}
