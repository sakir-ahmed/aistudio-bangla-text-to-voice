import React, { useState } from 'react';
import { DialogueLine, GeneratedAudioTrack, VoiceName } from '../types';
import { VOICES } from '../constants/presets';
import { Plus, Trash2, Sparkles, Loader2, Play } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';

const SAMPLE_DIALOGUES: DialogueLine[] = [
  {
    id: 'line-1',
    speaker: 'Speaker1',
    speakerLabel: 'বক্তা ১ (রাফি)',
    text: 'শুভ সকাল সুমনা! আজকের বাংলা টেক্সট টু স্পিচ অডিওটা শুনেছ?',
    style: 'Cheerful, curious greeting',
  },
  {
    id: 'line-2',
    speaker: 'Speaker2',
    speakerLabel: 'বক্তা ২ (সুমনা)',
    text: 'হ্যাঁ রাফি! উচ্চারণগুলো অবিশ্বাস্য রকমের বাস্তবসম্মত ও স্পষ্ট।',
    style: 'Surprised and impressed',
  },
  {
    id: 'line-3',
    speaker: 'Speaker1',
    speakerLabel: 'বক্তা ১ (রাফি)',
    text: 'একেবারে খাঁটি বাংলা বাচনভঙ্গি! কোনো রোবটিক সুর নেই বললেই চলে।',
    style: 'Enthusiastic agreement',
  },
  {
    id: 'line-4',
    speaker: 'Speaker2',
    speakerLabel: 'বক্তা ২ (সুমনা)',
    text: 'সত্যিই দারুণ! এখন আমরা পডকাস্ট আর অডিও নাটকেও এটা কাজে লাগাতে পারব।',
    style: 'Delighted and warm',
  },
];

interface DialogueStudioProps {
  onGeneratedTrack: (track: GeneratedAudioTrack) => void;
}

export const DialogueStudio: React.FC<DialogueStudioProps> = ({ onGeneratedTrack }) => {
  const [dialogues, setDialogues] = useState<DialogueLine[]>(SAMPLE_DIALOGUES);
  const [speaker1Voice, setSpeaker1Voice] = useState<VoiceName>('Puck');
  const [speaker2Voice, setSpeaker2Voice] = useState<VoiceName>('Kore');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeDialogueTrack, setActiveDialogueTrack] = useState<GeneratedAudioTrack | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addLine = (speaker: 'Speaker1' | 'Speaker2') => {
    const newLine: DialogueLine = {
      id: `line-${Date.now()}`,
      speaker,
      speakerLabel: speaker === 'Speaker1' ? 'বক্তা ১' : 'বক্তা ২',
      text: '',
      style: 'Natural conversational tone',
    };
    setDialogues([...dialogues, newLine]);
  };

  const removeLine = (id: string) => {
    if (dialogues.length <= 1) return;
    setDialogues(dialogues.filter((d) => d.id !== id));
  };

  const updateLineText = (id: string, text: string) => {
    setDialogues(dialogues.map((d) => (d.id === id ? { ...d, text } : d)));
  };

  const handleGenerate = async () => {
    const validLines = dialogues.filter((d) => d.text.trim().length > 0);
    if (validLines.length === 0) {
      setErrorMsg('অনুগ্রহ করে অন্তত একটি লাইনের বাংলা সংলাপ লিখুন');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/multi-speaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dialogues: validLines,
          speaker1Voice,
          speaker2Voice,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'সংলাপ অডিও তৈরিতে ব্যর্থ হয়েছে');
      }

      const audioBlob = await fetch(`data:${data.mimeType};base64,${data.audioBase64}`).then((r) =>
        r.blob()
      );
      const audioUrl = URL.createObjectURL(audioBlob);

      const combinedText = validLines.map((l) => `${l.speakerLabel}: ${l.text}`).join('\n');
      const track: GeneratedAudioTrack = {
        id: `track-${Date.now()}`,
        title: `দ্বৈত সংলাপ: ${validLines[0].text.slice(0, 30)}...`,
        text: combinedText,
        voice: speaker1Voice,
        style: 'দ্বৈত কথপোকথন',
        audioUrl,
        audioBase64: data.audioBase64,
        mimeType: data.mimeType,
        createdAt: Date.now(),
        wordCount: combinedText.split(/\s+/).filter(Boolean).length,
        characterCount: combinedText.length,
        isDialogue: true,
      };

      setActiveDialogueTrack(track);
      onGeneratedTrack(track);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'অডিও রূপান্তর ব্যর্থ হয়েছে');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-800/30">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-emerald-300">
            দ্বৈত কথপোকথন স্টুডিও (Multi-Speaker Bengali Dialogue)
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          দুজন ভিন্ন বক্তার স্বাভাবিক বাংলা কথোপকথন, নাটকীয় সংলাপ অথবা পডকাস্ট স্ক্রিপ্ট তৈরি করুন। কৃত্রিম বুদ্ধিমত্তা নিজে থেকে দুই কণ্ঠের মধ্যে স্বতঃস্ফূর্ত ছন্দ বজায় রাখবে।
        </p>
      </div>

      {/* Voice assignment bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            বক্তা ১ এর কণ্ঠস্বর (Speaker 1)
          </label>
          <select
            value={speaker1Voice}
            onChange={(e) => setSpeaker1Voice(e.target.value as VoiceName)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.banglaName} — {v.tag}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            বক্তা ২ এর কণ্ঠস্বর (Speaker 2)
          </label>
          <select
            value={speaker2Voice}
            onChange={(e) => setSpeaker2Voice(e.target.value as VoiceName)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.banglaName} — {v.tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dialogue Script Builder */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-200">সংলাপ স্ক্রিপ্ট (Script Lines)</h4>
          <div className="flex items-center gap-2">
            <button
              onClick={() => addLine('Speaker1')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>বক্তা ১ যোগ করুন</span>
            </button>
            <button
              onClick={() => addLine('Speaker2')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5 text-pink-400" />
              <span>বক্তা ২ যোগ করুন</span>
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {dialogues.map((line) => {
            const isSpeaker1 = line.speaker === 'Speaker1';
            return (
              <div
                key={line.id}
                className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  isSpeaker1
                    ? 'bg-amber-950/15 border-amber-800/40'
                    : 'bg-pink-950/15 border-pink-800/40'
                }`}
              >
                <div
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 mt-1 ${
                    isSpeaker1
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                  }`}
                >
                  {isSpeaker1 ? 'বক্তা ১' : 'বক্তা ২'}
                </div>

                <div className="flex-1 min-w-0">
                  <textarea
                    rows={2}
                    value={line.text}
                    onChange={(e) => updateLineText(line.id, e.target.value)}
                    placeholder={`${line.speakerLabel} কী বলবে তা বাংলায় লিখুন...`}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none font-sans"
                  />
                </div>

                <button
                  onClick={() => removeLine(line.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800/60 transition-colors mt-1"
                  title="এই লাইনটি মুছুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>দ্বৈত কথপোকথন অডিও তৈরি হচ্ছে (Gemini 3.8 Flash)...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            <span>সংলাপ অডিও তৈরি করুন</span>
          </>
        )}
      </button>

      {/* Audio player if generated */}
      {activeDialogueTrack && (
        <div className="pt-2">
          <AudioPlayer track={activeDialogueTrack} />
        </div>
      )}
    </div>
  );
};
