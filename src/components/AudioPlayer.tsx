import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Share2,
  Check,
  FastForward,
  Rewind,
  Sparkles,
} from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { TranscriptTimestamps } from './TranscriptTimestamps';
import { GeneratedAudioTrack } from '../types';

interface AudioPlayerProps {
  track: GeneratedAudioTrack | null;
  onClear?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ track }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // When track changes, load audio and auto-play
  useEffect(() => {
    if (!track) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [track?.id]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.error('Audio play error:', e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const skipSeconds = (seconds: number) => {
    if (audioRef.current) {
      const nextTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const handleDownload = () => {
    if (!track) return;
    const a = document.createElement('a');
    a.href = track.audioUrl;
    const safeTitle = track.title.replace(/[^a-zA-Z0-9\u0980-\u09FF_-]/g, '_').slice(0, 30);
    a.download = `dhwani-${track.voice.toLowerCase()}-${safeTitle || 'bangla-audio'}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = () => {
    if (!track) return;
    navigator.clipboard.writeText(track.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  if (!track) {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-3">
          <Volume2 className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-300">এখনো কোনো অডিও তৈরি হয়নি</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          বামে আপনার পছন্দের বাংলা লেখা লিখুন অথবা নমুনা পাঠ নির্বাচন করে &quot;অডিও তৈরি করুন&quot; বাটনে চাপুন।
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={track.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Track Info Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              কণ্ঠ: {track.voice}
            </span>
            <span className="text-xs text-slate-400">
              {track.wordCount} শব্দ • {track.characterCount} বর্ণ
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              24kHz Studio WAV
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-100 truncate" title={track.title}>
            {track.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-1 italic mt-0.5">
            &quot;{track.text}&quot;
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopyLink}
            title="লেখা কপি করুন"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownload}
            title="WAV অডিও ফাইল ডাউনলোড করুন"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/25 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ডাউনলোড (.wav)</span>
          </button>
        </div>
      </div>

      {/* Visualizer Canvas */}
      <div className="mb-4">
        <AudioVisualizer
          isPlaying={isPlaying}
          progress={progress}
          audioElement={audioRef.current}
          height={75}
        />
      </div>

      {/* Progress & Seekbar */}
      <div className="space-y-1 mb-4">
        <input
          type="range"
          min="0"
          max={duration || 1}
          step="0.01"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 hover:h-2 transition-all"
        />
        <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => skipSeconds(-5)}
            title="৫ সেকেন্ড পেছনে যান"
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Rewind className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform active:scale-95"
            title={isPlaying ? 'বিরতি (Pause)' : 'বাজান (Play)'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => skipSeconds(5)}
            title="৫ সেকেন্ড এগিয়ে যান"
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FastForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
                setIsPlaying(true);
              }
            }}
            title="শুরু থেকে আবার বাজান"
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs">
          {[0.75, 1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => handleRateChange(rate)}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                playbackRate === rate
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            title={isMuted ? 'আনমিউট' : 'মিউট'}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>
      </div>

      {/* 2-Second Timestamps & Transcript Panel */}
      {track.timestamps && track.timestamps.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <TranscriptTimestamps
            timestamps={track.timestamps}
            currentTime={currentTime}
            duration={duration || track.duration || 0}
            title={track.title}
            isPlaying={isPlaying}
            onSeek={(targetTime) => {
              if (audioRef.current) {
                audioRef.current.currentTime = targetTime;
                setCurrentTime(targetTime);
                if (!isPlaying) {
                  audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
};
