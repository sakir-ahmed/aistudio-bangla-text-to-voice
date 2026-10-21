/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VoiceSelector } from './components/VoiceSelector';
import { StyleSelector } from './components/StyleSelector';
import { AudioPlayer } from './components/AudioPlayer';
import { BanglaAssistTools } from './components/BanglaAssistTools';
import { DialogueStudio } from './components/DialogueStudio';
import { HistoryList } from './components/HistoryList';
import { SAMPLE_TEXTS, STYLE_PRESETS } from './constants/presets';
import { VoiceName, GeneratedAudioTrack, SampleBanglaText } from './types';
import {
  Sparkles,
  Volume2,
  Play,
  RotateCcw,
  Copy,
  Check,
  BookOpen,
  Info,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const STORAGE_KEY = 'dhwani_bangla_tts_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'single' | 'dialogue'>('single');
  const [text, setText] = useState<string>(SAMPLE_TEXTS[1].text); // Default to welcome greeting
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Kore');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('natural');
  const [activeStylePrompt, setActiveStylePrompt] = useState<string>(
    STYLE_PRESETS[0].promptDescription
  );
  const [customStylePrompt, setCustomStylePrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active generated track for the player
  const [currentTrack, setCurrentTrack] = useState<GeneratedAudioTrack | null>(null);
  const [history, setHistory] = useState<GeneratedAudioTrack[]>([]);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Re-create Blob URLs from base64 if needed
          const hydrated = parsed.map((item: GeneratedAudioTrack) => {
            if (item.audioBase64) {
              const byteCharacters = atob(item.audioBase64);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: item.mimeType || 'audio/wav' });
              return { ...item, audioUrl: URL.createObjectURL(blob) };
            }
            return item;
          });
          setHistory(hydrated);
          if (hydrated.length > 0) {
            setCurrentTrack(hydrated[0]);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load history:', e);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (updated: GeneratedAudioTrack[]) => {
    setHistory(updated);
    try {
      // Keep only up to 15 items in storage to avoid quota limits
      const toStore = updated.slice(0, 15).map(({ id, title, text, voice, style, audioBase64, mimeType, createdAt, wordCount, characterCount, isDialogue }) => ({
        id,
        title,
        text,
        voice,
        style,
        audioBase64,
        mimeType,
        createdAt,
        wordCount,
        characterCount,
        isDialogue,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.warn('Failed to persist history:', e);
    }
  };

  const handleSelectSample = (sample: SampleBanglaText) => {
    setText(sample.text);
    setSelectedVoice(sample.suggestedVoice);
    setSelectedPresetId(sample.suggestedStyleId);
    const stylePreset = STYLE_PRESETS.find((p) => p.id === sample.suggestedStyleId);
    if (stylePreset) {
      setActiveStylePrompt(stylePreset.promptDescription);
    }
  };

  const handleSelectPreset = (presetId: string, promptDesc: string) => {
    setSelectedPresetId(presetId);
    setActiveStylePrompt(promptDesc);
    setCustomStylePrompt('');
  };

  const handleCustomStyleChange = (prompt: string) => {
    setCustomStylePrompt(prompt);
    setActiveStylePrompt(prompt);
  };

  // Main TTS Generation
  const handleGenerateAudio = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setErrorMsg('অনুগ্রহ করে অডিও তৈরির জন্য বাংলায় কিছু টেক্সট লিখুন');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    const effectiveStyle = customStylePrompt.trim() ? customStylePrompt : activeStylePrompt;

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          voice: selectedVoice,
          style: effectiveStyle,
          model: 'gemini-3.8-flash-lite-tts',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'অডিও তৈরিতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }

      // Convert base64 to Blob URL for playback
      const binaryString = atob(data.audioBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);

      const title = trimmed.length > 40 ? trimmed.slice(0, 37) + '...' : trimmed;

      const newTrack: GeneratedAudioTrack = {
        id: `track-${Date.now()}`,
        title,
        text: trimmed,
        voice: selectedVoice,
        style: effectiveStyle,
        audioUrl,
        audioBase64: data.audioBase64,
        mimeType: data.mimeType,
        createdAt: Date.now(),
        wordCount: data.wordCount || trimmed.split(/\s+/).filter(Boolean).length,
        characterCount: data.characterCount || trimmed.length,
      };

      setCurrentTrack(newTrack);
      saveHistory([newTrack, ...history.filter((h) => h.id !== newTrack.id)]);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'অডিও রূপান্তর ব্যর্থ হয়েছে');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  // Estimated reading time at ~130 words per minute for Bengali
  const estimatedSeconds = Math.max(1, Math.round((wordCount / 130) * 60));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dialogue' ? (
          <DialogueStudio
            onGeneratedTrack={(track) => {
              setCurrentTrack(track);
              saveHistory([track, ...history.filter((h) => h.id !== track.id)]);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Text Input & Voice Customization (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Sample Texts Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-medium text-slate-300">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>নমুনা বাংলা পাঠ (১-ক্লিকে লোড করুন):</span>
                  </span>
                  <span>৫টি ভিন্ন ক্যাটাগরি</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_TEXTS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 text-xs text-slate-300 transition-all flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>{sample.title}</span>
                      <span className="text-[10px] text-slate-500">({sample.category})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input Card */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 shadow-xl backdrop-blur-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <span>আপনার বাংলা লেখা লিখুন বা পেস্ট করুন</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyText}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
                      title="লেখা কপি করুন"
                    >
                      {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[11px] hidden sm:inline">{copiedText ? 'কপি হয়েছে' : 'কপি'}</span>
                    </button>
                    <button
                      onClick={() => setText('')}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
                      title="মুছে ফেলুন"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">মুছুন</span>
                    </button>
                  </div>
                </div>

                {/* Text Area */}
                <div className="relative">
                  <textarea
                    rows={6}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="এখানে আপনার বাংলা লেখা টাইপ করুন... (উদাহরণ: শুভ সকাল! আজ আবহাওয়া অত্যন্ত চমৎকার।)"
                    className="w-full bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 text-base sm:text-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 resize-y leading-relaxed"
                  />
                  {/* Quick counter badge inside textarea */}
                  <div className="flex justify-between items-center text-[11px] text-slate-500 px-1 pt-1">
                    <div className="flex items-center gap-3">
                      <span>{wordCount} টি শব্দ</span>
                      <span>{charCount} টি বর্ণ</span>
                    </div>
                    <span>আনুমানিক সময়: ~{estimatedSeconds} সেকেন্ড</span>
                  </div>
                </div>

                {/* Smart Assist Tools (Banglish converter, Translate, Punctuation, Voice Typing) */}
                <BanglaAssistTools
                  currentText={text}
                  onUpdateText={(newText) => setText(newText)}
                  disabled={isGenerating}
                />
              </div>

              {/* Voice Selector */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 shadow-xl">
                <VoiceSelector
                  selectedVoice={selectedVoice}
                  onSelectVoice={setSelectedVoice}
                  disabled={isGenerating}
                />
              </div>

              {/* Style & Emotion Selector */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 shadow-xl">
                <StyleSelector
                  selectedPresetId={selectedPresetId}
                  onSelectPreset={handleSelectPreset}
                  customStylePrompt={customStylePrompt}
                  onCustomStyleChange={handleCustomStyleChange}
                  disabled={isGenerating}
                />
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">অডিও তৈরি করা সম্ভব হয়নি:</p>
                    <p className="mt-0.5 text-rose-200">{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleGenerateAudio}
                disabled={isGenerating || !text.trim()}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                    <span>বাংলা অডিও তৈরি হচ্ছে (Gemini 3.8 Audio)...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 fill-current" />
                    <span>অডিও তৈরি করুন (Generate Bangla Audio)</span>
                    <Sparkles className="w-4 h-4 text-emerald-950" />
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Audio Player & History Archives (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Main Audio Player Card */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                    <span>অডিও স্টুডিও প্লেয়ার (Waveform Player)</span>
                  </h2>
                  {currentTrack && (
                    <span className="text-[11px] text-emerald-400 font-mono">
                      24,000 Hz Master
                    </span>
                  )}
                </div>
                <AudioPlayer track={currentTrack} />
              </div>

              {/* Bangla Voice Quality Guide / Tips */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-2.5 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>উত্তম বাংলা অডিওর জন্য নির্দেশিকা:</span>
                </div>
                <ul className="space-y-1.5 list-disc list-inside text-slate-400 pl-1 leading-relaxed">
                  <li>
                    <strong className="text-slate-300">যতিচিহ্ন:</strong> বাক্যে যথাস্থানে দাঁড়ি (।), কমা (,) ও প্রশ্নবোধক চিহ্ন দিলে পাঠের ছন্দ ও স্বাভাবিক বিরতি বজায় থাকে।
                  </li>
                  <li>
                    <strong className="text-slate-300">সংখ্যা উচ্চারণ:</strong> সংখ্যা কথায় লিখে নিলে (যেমন ১২০ এর বদলে &quot;একশত বিশ&quot;) উচ্চারণ স্পষ্ট হয়।
                  </li>
                  <li>
                    <strong className="text-slate-300">বাংলিশ রূপান্তর:</strong> ইংরেজিতে বাংলা লিখলে &quot;বাংলিশ → বাংলা&quot; বাটনে চাপুন।
                  </li>
                </ul>
              </div>

              {/* History & Saved Tracks List */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 shadow-xl">
                <HistoryList
                  history={history}
                  activeTrackId={currentTrack?.id}
                  onSelectTrack={(track) => setCurrentTrack(track)}
                  onUseText={(t) => setText(t)}
                  onDeleteTrack={(id) => {
                    const filtered = history.filter((h) => h.id !== id);
                    saveHistory(filtered);
                    if (currentTrack?.id === id) {
                      setCurrentTrack(filtered[0] || null);
                    }
                  }}
                  onClearHistory={() => {
                    saveHistory([]);
                    setCurrentTrack(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/70 bg-slate-950 py-4 mt-12 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center gap-1.5">
          <span>ধ্বনি (Dhwani) — উন্নত বাংলা টেক্সট-টু-স্পিচ প্রযুক্তি</span>
          <span>•</span>
          <span className="text-slate-400">Google Gemini 3.8 Audio 24kHz</span>
        </p>
      </footer>
    </div>
  );
}
