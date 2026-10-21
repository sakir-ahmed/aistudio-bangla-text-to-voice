import React from 'react';
import { GeneratedAudioTrack } from '../types';
import { Play, Download, Trash2, ArrowUpRight, History } from 'lucide-react';

interface HistoryListProps {
  history: GeneratedAudioTrack[];
  activeTrackId?: string;
  onSelectTrack: (track: GeneratedAudioTrack) => void;
  onUseText: (text: string) => void;
  onDeleteTrack: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  activeTrackId,
  onSelectTrack,
  onUseText,
  onDeleteTrack,
  onClearHistory,
}) => {
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-5 text-center">
        <p className="text-xs text-slate-500">
          আপনার তৈরিকৃত অডিও ট্র্যাকগুলোর ইতিহাস এখানে সংরক্ষিত হবে।
        </p>
      </div>
    );
  }

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDownload = (track: GeneratedAudioTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = track.audioUrl;
    const safeTitle = track.title.replace(/[^a-zA-Z0-9\u0980-\u09FF_-]/g, '_').slice(0, 30);
    a.download = `dhwani-${track.voice.toLowerCase()}-${safeTitle || 'bangla'}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <History className="w-3.5 h-3.5 text-emerald-400" />
          <span>পূর্ববর্তী অডিও ট্র্যাকসমূহ ({history.length})</span>
        </div>
        <button
          onClick={onClearHistory}
          className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
        >
          সব মুছুন
        </button>
      </div>

      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {history.map((track) => {
          const isActive = track.id === activeTrackId;
          return (
            <div
              key={track.id}
              onClick={() => onSelectTrack(track)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isActive
                  ? 'bg-emerald-950/20 border-emerald-500/60 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => onSelectTrack(track)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-200 truncate">
                      {track.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                      {track.voice}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {track.text}
                  </p>
                  <span className="text-[10px] text-slate-500">
                    {formatTimestamp(track.createdAt)} • {track.wordCount} শব্দ
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUseText(track.text);
                  }}
                  title="এই লেখাটি এডিটরে আনুন"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDownload(track, e)}
                  title="WAV ডাউনলোড করুন"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTrack(track.id);
                  }}
                  title="মুছুন"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
