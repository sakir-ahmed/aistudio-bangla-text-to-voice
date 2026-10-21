import React from 'react';
import { VOICES } from '../constants/presets';
import { VoiceName } from '../types';
import { User, Check } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onSelectVoice: (voice: VoiceName) => void;
  disabled?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
          <span>কণ্ঠস্বর নির্বাচন করুন (AI Voices)</span>
          <span className="text-xs text-slate-400 font-normal">({VOICES.length}টি স্টুডিও ভয়েস)</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {VOICES.map((voice) => {
          const isSelected = selectedVoice === voice.id;
          return (
            <button
              key={voice.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectVoice(voice.id)}
              className={`relative text-left p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-400'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Avatar circle */}
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${voice.avatarColor} flex items-center justify-center text-white shrink-0 shadow-md`}
              >
                <User className="w-5 h-5" />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {voice.banglaName}
                  </h4>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      voice.gender === 'female'
                        ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {voice.gender === 'female' ? 'নারী' : 'পুরুষ'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {voice.tag}
                </p>

                <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-tight">
                  {voice.banglaDesc}
                </p>
              </div>

              {/* Selected check */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
