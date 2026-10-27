import React from 'react';

interface AudioWaveformProps {
  bars: number[];
  isRecording: boolean;
  volumeLevel: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  bars,
  isRecording,
  volumeLevel,
}) => {
  return (
    <div className="flex h-16 w-full items-center justify-center gap-1.5 rounded-2xl bg-zinc-900/60 p-3 ring-1 ring-zinc-800/80">
      {bars.map((height, i) => {
        const normalized = isRecording ? Math.max(8, height) : 10;
        const isCenter = Math.abs(i - 8) < 4;
        return (
          <div
            key={i}
            className="flex h-full w-2 items-center justify-center"
          >
            <div
              style={{
                height: `${normalized}%`,
              }}
              className={`w-1.5 rounded-full transition-all duration-75 ${
                isRecording
                  ? isCenter
                    ? 'bg-gradient-to-t from-red-600 to-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                    : 'bg-red-500/80'
                  : 'bg-zinc-700/50'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
};
