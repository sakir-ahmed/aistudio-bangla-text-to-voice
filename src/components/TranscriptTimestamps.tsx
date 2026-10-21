import React, { useState, useEffect, useRef } from 'react';
import { TimestampSegment } from '../types';
import {
  Clock,
  Play,
  Copy,
  Check,
  Download,
  Search,
  FileText,
  List,
  Code,
  Sparkles,
} from 'lucide-react';

interface TranscriptTimestampsProps {
  timestamps: TimestampSegment[];
  currentTime: number;
  duration: number;
  title?: string;
  onSeek: (time: number) => void;
  isPlaying?: boolean;
}

export const TranscriptTimestamps: React.FC<TranscriptTimestampsProps> = ({
  timestamps,
  currentTime,
  duration,
  title = 'bangla-audio',
  onSeek,
  isPlaying = false,
}) => {
  const [viewMode, setViewMode] = useState<'blocks' | 'full' | 'srt' | 'json'>('blocks');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const activeSegmentRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Find active 2-second interval based on currentTime
  const activeSegmentIndex = timestamps.findIndex(
    (seg) => currentTime >= seg.start && currentTime < seg.end
  );

  // Auto-scroll to active 2s segment during playback
  useEffect(() => {
    if (autoScroll && isPlaying && activeSegmentRef.current && containerRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeSegmentIndex, autoScroll, isPlaying]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Generate plain timestamp list text (00:00 - 00:02: text)
  const getFormattedTimestampsText = () => {
    return timestamps
      .map((seg) => `[${seg.timeLabel}] ${seg.text}`)
      .join('\n');
  };

  // Generate standard SRT format
  const getSrtContent = () => {
    return timestamps
      .map((seg, idx) => {
        const formatSrtTime = (sec: number) => {
          const hours = Math.floor(sec / 3600);
          const mins = Math.floor((sec % 3600) / 60);
          const secs = Math.floor(sec % 60);
          const millis = Math.floor((sec % 1) * 1000);
          return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
        };
        return `${idx + 1}\n${formatSrtTime(seg.start)} --> ${formatSrtTime(seg.end)}\n${seg.text}\n`;
      })
      .join('\n');
  };

  // Generate WebVTT format
  const getVttContent = () => {
    const lines = timestamps.map((seg) => {
      const formatVttTime = (sec: number) => {
        const mins = Math.floor(sec / 60);
        const secs = Math.floor(sec % 60);
        const millis = Math.floor((sec % 1) * 1000);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
      };
      return `${formatVttTime(seg.start)} --> ${formatVttTime(seg.end)}\n${seg.text}\n`;
    });
    return `WEBVTT\n\n` + lines.join('\n');
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredTimestamps = timestamps.filter((seg) =>
    searchQuery.trim()
      ? seg.text.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        seg.timeLabel.includes(searchQuery.trim())
      : true
  );

  if (!timestamps || timestamps.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl space-y-4">
      {/* Header & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">
                ২-সেকেন্ড টাইমস্ট্যাম্প ও ট্রান্সক্রিপ্ট
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-medium">
                {timestamps.length}টি টাইমস্ট্যাম্প
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              প্রতি ২ সেকেন্ডের অডিওর সাথে বাংলা কথার নিখুঁত সমন্বয় ({duration.toFixed(1)} সেকেন্ড মোট অডিও)
            </p>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('blocks')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'blocks'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="২-সেকেন্ডের টাইমস্ট্যাম্প ব্লক তালিকা"
          >
            <List className="w-3 h-3" />
            <span>ব্লক ভিউ</span>
          </button>
          <button
            onClick={() => setViewMode('full')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'full'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="ধারাবাহিক ট্রান্সক্রিপ্ট পাঠ"
          >
            <FileText className="w-3 h-3" />
            <span>টানা পাঠ</span>
          </button>
          <button
            onClick={() => setViewMode('srt')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'srt'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="সাবটাইটেল SRT ফরম্যাট"
          >
            <span className="font-mono text-[10px] font-bold">SRT</span>
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'json'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="JSON টাইমস্ট্যাম্প অবজেক্ট"
          >
            <Code className="w-3 h-3" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search, Auto-scroll & Export actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="শব্দ বা সময় দিয়ে খুঁজুন (যেমন: 'আজকের')..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <label className="flex items-center gap-1 text-[11px] text-slate-400 mr-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span>লাইভ সিঙ্ক</span>
          </label>

          <button
            onClick={() => copyToClipboard(getFormattedTimestampsText(), 'timestamps')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            title="টাইমস্ট্যাম্প সহ পুরো লেখা কপি করুন"
          >
            {copiedType === 'timestamps' ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>কপি</span>
          </button>

          <button
            onClick={() =>
              downloadFile(
                getSrtContent(),
                `${title.slice(0, 20).replace(/\s+/g, '_')}_subtitles.srt`,
                'text/plain'
              )
            }
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            title="ভিডিও সাবটাইটেল হিসেবে .srt ফাইল ডাউনলোড করুন"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            <span>.SRT</span>
          </button>

          <button
            onClick={() =>
              downloadFile(
                getVttContent(),
                `${title.slice(0, 20).replace(/\s+/g, '_')}_subtitles.vtt`,
                'text/vtt'
              )
            }
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            title="ওয়েব সাবটাইটেল হিসেবে .vtt ফাইল ডাউনলোড করুন"
          >
            <Download className="w-3 h-3 text-cyan-400" />
            <span>.VTT</span>
          </button>

          <button
            onClick={() =>
              downloadFile(
                JSON.stringify(timestamps, null, 2),
                `${title.slice(0, 20).replace(/\s+/g, '_')}_timestamps.json`,
                'application/json'
              )
            }
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            title="টাইমস্ট্যাম্পের সম্পূর্ণ JSON ডাটা ডাউনলোড করুন"
          >
            <Download className="w-3 h-3 text-purple-400" />
            <span>.JSON</span>
          </button>
        </div>
      </div>

      {/* Content Display based on View Mode */}
      <div
        ref={containerRef}
        className="max-h-[380px] overflow-y-auto pr-1 space-y-2 rounded-xl bg-slate-950/60 p-2 border border-slate-800/80 font-sans"
      >
        {/* Mode 1: 2-Second Blocks */}
        {viewMode === 'blocks' && (
          <div className="space-y-1.5">
            {filteredTimestamps.map((seg, idx) => {
              const isActive = activeSegmentIndex === idx;
              return (
                <div
                  key={seg.id || idx}
                  ref={isActive ? activeSegmentRef : null}
                  onClick={() => onSeek(seg.start)}
                  className={`p-2.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-start gap-3 text-left group ${
                    isActive
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                      : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  {/* Time Badge with Play action */}
                  <div className="shrink-0 flex items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeek(seg.start);
                      }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 shadow'
                          : 'bg-slate-800 text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-700'
                      }`}
                      title={`প্লেয়ারকে ${seg.timeLabel} সময়ে নিন`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded-md font-semibold ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {seg.timeLabel}
                    </span>
                  </div>

                  {/* Spoken Bengali Text */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-relaxed ${
                        isActive
                          ? 'text-emerald-100 font-medium'
                          : 'text-slate-300 group-hover:text-slate-100'
                      }`}
                    >
                      {seg.text || <span className="text-slate-600 italic">(বিরতি / নীরবতা)</span>}
                    </p>
                  </div>

                  {/* Active playing indicator badge */}
                  {isActive && isPlaying && (
                    <div className="shrink-0 flex items-center gap-1 text-[10px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 animate-pulse font-medium">
                      <Sparkles className="w-3 h-3" />
                      <span>চলছে</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Mode 2: Full Continuous Reading with Inline 2-second timestamp chips */}
        {viewMode === 'full' && (
          <div className="p-3 text-sm leading-relaxed text-slate-200 space-y-3">
            <p className="text-xs text-slate-400 italic mb-2">
              যেকোনো ২-সেকেন্ডের টাইমস্ট্যাম্প চিহ্নে ক্লিক করে অডিও সেখানে নিয়ে যান:
            </p>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-2.5">
              {timestamps.map((seg, idx) => {
                const isActive = activeSegmentIndex === idx;
                return (
                  <span
                    key={seg.id || idx}
                    className={`inline-flex items-baseline gap-1.5 p-1 rounded-lg transition-all ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500/40'
                        : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <button
                      onClick={() => onSeek(seg.start)}
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700'
                      }`}
                      title={`সময়: ${seg.timeLabel}`}
                    >
                      {seg.startLabel}
                    </button>
                    <span className="text-sm">{seg.text}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Mode 3: SRT format view */}
        {viewMode === 'srt' && (
          <pre className="p-3 text-xs font-mono text-emerald-400/90 whitespace-pre-wrap select-all bg-slate-950 rounded-lg leading-relaxed">
            {getSrtContent()}
          </pre>
        )}

        {/* Mode 4: JSON view */}
        {viewMode === 'json' && (
          <pre className="p-3 text-xs font-mono text-cyan-300/90 whitespace-pre-wrap select-all bg-slate-950 rounded-lg leading-relaxed">
            {JSON.stringify(timestamps, null, 2)}
          </pre>
        )}
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span>💡 যেকোনো টাইমস্ট্যাম্পে ক্লিক করলে অডিও সরাসরি ওই স্থানে প্লে হবে</span>
        <span className="font-mono">ইন্টারভ্যাল: প্রতি ২ সেকেন্ড</span>
      </div>
    </div>
  );
};
