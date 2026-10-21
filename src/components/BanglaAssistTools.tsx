import React, { useState } from 'react';
import {
  Wand2,
  Languages,
  FileCheck,
  Hash,
  Mic,
  MicOff,
  Loader2,
} from 'lucide-react';

interface BanglaAssistToolsProps {
  currentText: string;
  onUpdateText: (newText: string) => void;
  disabled?: boolean;
}

export const BanglaAssistTools: React.FC<BanglaAssistToolsProps> = ({
  currentText,
  onUpdateText,
  disabled = false,
}) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePolishAction = async (action: string) => {
    if (!currentText.trim()) {
      setStatusMessage('অনুগ্রহ করে প্রথমে কিছু টেক্সট লিখুন');
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setActiveAction(action);
    setStatusMessage('প্রক্রিয়াধীন...');

    try {
      const res = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentText,
          action,
        }),
      });

      const data = await res.json();
      if (data.success && data.resultText) {
        onUpdateText(data.resultText);
        setStatusMessage('সফলভাবে পরিমার্জিত হয়েছে!');
      } else {
        setStatusMessage(data.error || 'প্রক্রিয়াকরণে সমস্যা হয়েছে');
      }
    } catch {
      setStatusMessage('সার্ভারে যোগাযোগ করা যায়নি');
    } finally {
      setActiveAction(null);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Browser Speech Recognition for Bengali
  const toggleSpeechRecognition = () => {
    // Check Web Speech API
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('আপনার ব্রাউজারে ভয়েস টাইপিং সমর্থিত নয়। অনুগ্রহ করে Chrome বা Edge ব্যবহার করুন।');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD'; // Bengali (Bangladesh)
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage('বাংলায় কথা বলুন (রেকর্ড হচ্ছে)...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          const updated = currentText.trim() ? `${currentText.trim()} ${transcript}` : transcript;
          onUpdateText(updated);
          setStatusMessage('রেকর্ড সফল হয়েছে!');
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
        setStatusMessage('মাইক্রোফোনে কোনো শব্দ পাওয়া যায়নি');
        setTimeout(() => setStatusMessage(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTimeout(() => setStatusMessage(null), 2000);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
          <Wand2 className="w-3 h-3 text-emerald-400" />
          <span>স্মার্ট সহায়ক:</span>
        </span>

        {/* Banglish to Bangla */}
        <button
          type="button"
          disabled={disabled || activeAction !== null}
          onClick={() => handlePolishAction('banglish_to_bangla')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs transition-colors disabled:opacity-50"
          title="ইংরেজিতে লেখা বাংলা বাক্যকে সরাসরি বাংলা অক্ষরে রূপান্তর করুন (e.g. 'ami banglay gan gai')"
        >
          {activeAction === 'banglish_to_bangla' ? (
            <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
          ) : (
            <span className="text-emerald-400 font-bold text-[10px]">বাং</span>
          )}
          <span>বাংলিশ → বাংলা</span>
        </button>

        {/* Translate to Bangla */}
        <button
          type="button"
          disabled={disabled || activeAction !== null}
          onClick={() => handlePolishAction('translate_to_bangla')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs transition-colors disabled:opacity-50"
          title="ইংরেজি বা অন্য ভাষার টেক্সটকে স্বাভাবিক প্রাঞ্জল বাংলায় অনুবাদ করুন"
        >
          {activeAction === 'translate_to_bangla' ? (
            <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
          ) : (
            <Languages className="w-3 h-3 text-cyan-400" />
          )}
          <span>ইংরেজি → বাংলা</span>
        </button>

        {/* Enhance for Speech */}
        <button
          type="button"
          disabled={disabled || activeAction !== null}
          onClick={() => handlePolishAction('enhance_for_speech')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs transition-colors disabled:opacity-50"
          title="যতিচিহ্ন (দাঁড়ি, কমা) যুক্ত করে পাঠযোগ্যতা ও স্পষ্টতা বাড়ান"
        >
          {activeAction === 'enhance_for_speech' ? (
            <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
          ) : (
            <FileCheck className="w-3 h-3 text-teal-400" />
          )}
          <span>শ্রুতি পরিমার্জন (Pause & Rhythm)</span>
        </button>

        {/* Numbers to Bangla Words */}
        <button
          type="button"
          disabled={disabled || activeAction !== null}
          onClick={() => handlePolishAction('numbers_to_bangla_words')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs transition-colors disabled:opacity-50"
          title="সংখ্যা (যেমন: ১২০, ২০২৬) কে কথায় রূপান্তর করুন যাতে উচ্চারণ নিখুঁত হয়"
        >
          {activeAction === 'numbers_to_bangla_words' ? (
            <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
          ) : (
            <Hash className="w-3 h-3 text-purple-400" />
          )}
          <span>সংখ্যা কথায়</span>
        </button>
      </div>

      {/* Voice Dictation (Mic) */}
      <div className="flex items-center gap-2">
        {statusMessage && (
          <span className="text-xs text-emerald-400 animate-pulse font-medium">
            {statusMessage}
          </span>
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={toggleSpeechRecognition}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            isListening
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
          title="বাংলায় কথা বলে মুখে মুখে লিখুন"
        >
          {isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5 text-rose-400" />
              <span>রেকর্ড বন্ধ করুন</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span>বাংলা মুখে বলুন</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
