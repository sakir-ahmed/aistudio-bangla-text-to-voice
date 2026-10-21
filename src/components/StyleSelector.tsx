import React, { useState } from 'react';
import { STYLE_PRESETS } from '../constants/presets';
import { Sparkles, Radio, BookOpen, Feather, Smile, Moon, Sliders } from 'lucide-react';

interface StyleSelectorProps {
  selectedPresetId: string;
  onSelectPreset: (presetId: string, promptDesc: string) => void;
  customStylePrompt: string;
  onCustomStyleChange: (prompt: string) => void;
  disabled?: boolean;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-3.5 h-3.5" />,
  Radio: <Radio className="w-3.5 h-3.5" />,
  BookOpen: <BookOpen className="w-3.5 h-3.5" />,
  Feather: <Feather className="w-3.5 h-3.5" />,
  Smile: <Smile className="w-3.5 h-3.5" />,
  Moon: <Moon className="w-3.5 h-3.5" />,
};

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedPresetId,
  onSelectPreset,
  customStylePrompt,
  onCustomStyleChange,
  disabled = false,
}) => {
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
          <span>বাচনভঙ্গি ও আবেগ (Style & Emotion)</span>
        </label>
        <button
          type="button"
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          <Sliders className="w-3 h-3" />
          <span>{showCustomInput ? 'প্রিসেট দেখুন' : 'কাস্টম বাচনভঙ্গি লিখুন'}</span>
        </button>
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-2">
        {STYLE_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id && !showCustomInput;
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                setShowCustomInput(false);
                onSelectPreset(preset.id, preset.promptDescription);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className={isSelected ? 'text-emerald-400' : 'text-slate-500'}>
                {ICONS_MAP[preset.iconName] || <Sparkles className="w-3.5 h-3.5" />}
              </span>
              <span>{preset.nameBangla}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Style Input Drawer */}
      {showCustomInput && (
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>আপনার পছন্দমতো কণ্ঠের মেজাজ বর্ণনা করুন:</span>
            <span className="text-[10px] text-emerald-400">AI নির্দেশিকা</span>
          </div>
          <input
            type="text"
            value={customStylePrompt}
            onChange={(e) => onCustomStyleChange(e.target.value)}
            placeholder="যেমন: ধীরলয়ে মিষ্টি ও মমতাময়ী সুরে বলুন, ব্যাকগ্রাউন্ড শান্ত..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400">
            <span className="text-slate-500">উদাহরণ:</span>
            {[
              'ধীরলয়ে মিষ্টি সুরে বলুন',
              'রোমাঞ্চকর ও রহস্যময় কণ্ঠে',
              'শিশুদের জন্য আনন্দিত গল্পকারের মতো',
            ].map((eg, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onCustomStyleChange(eg)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
              >
                {eg}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
