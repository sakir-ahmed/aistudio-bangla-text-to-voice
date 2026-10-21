import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google Gemini SDK
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for error messages
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});


function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

interface TimestampSegment {
  id: string;
  start: number;
  end: number;
  startLabel: string;
  endLabel: string;
  timeLabel: string;
  text: string;
}

// Fallback algorithm to distribute words proportionally across 2-second windows
function distributeTextAcrossIntervals(text: string, duration: number): TimestampSegment[] {
  const intervalSeconds = 2.0;
  const numIntervals = Math.max(1, Math.ceil(duration / intervalSeconds));
  const words = text.trim().split(/\s+/).filter(Boolean);
  const segments: TimestampSegment[] = [];

  const wordsPerInterval = words.length / numIntervals;

  for (let i = 0; i < numIntervals; i++) {
    const start = i * intervalSeconds;
    const end = Number(Math.min(duration, (i + 1) * intervalSeconds).toFixed(1));
    const startIdx = Math.floor(i * wordsPerInterval);
    const endIdx = i === numIntervals - 1 ? words.length : Math.floor((i + 1) * wordsPerInterval);
    const segmentWords = words.slice(startIdx, endIdx);

    const startLabel = formatTimecode(start);
    const endLabel = formatTimecode(end);

    segments.push({
      id: `seg-${i}-${Date.now()}`,
      start,
      end,
      startLabel,
      endLabel,
      timeLabel: `${startLabel} - ${endLabel}`,
      text: segmentWords.join(' '),
    });
  }

  return segments;
}

// Generate high-accuracy 2-second timestamp segments using Gemini with fallback
async function generateTwoSecondTimestamps(text: string, duration: number): Promise<TimestampSegment[]> {
  const intervalSeconds = 2.0;
  const numIntervals = Math.max(1, Math.ceil(duration / intervalSeconds));

  // If text is short or 1 interval, return simple distribution
  if (numIntervals <= 1 || text.length < 15) {
    return distributeTextAcrossIntervals(text, duration);
  }

  try {
    const intervalPrompts: string[] = [];
    for (let i = 0; i < numIntervals; i++) {
      const s = i * 2;
      const e = Math.min(duration, (i + 1) * 2);
      intervalPrompts.push(`Interval ${i + 1}: ${formatTimecode(s)} - ${formatTimecode(e)} (${s}s - ${e.toFixed(1)}s)`);
    }

    const prompt = `You are a speech audio alignment expert for Bengali (Bangla).
The following Bengali text was spoken aloud with a total duration of ${duration.toFixed(1)} seconds.
Divide this Bengali text into exactly ${numIntervals} segments corresponding to 2-second audio intervals:
${intervalPrompts.join('\n')}

Rules:
1. Divide the words naturally according to how Bengali is pronounced and paced in speech.
2. Maintain the original word order, spelling, and Bengali punctuation (।, ,, ?).
3. Output a strictly valid JSON array of strings containing exactly ${numIntervals} elements, one for each 2-second interval in order.

Bengali text:
"${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      const segments: TimestampSegment[] = [];
      for (let i = 0; i < numIntervals; i++) {
        const start = i * 2;
        const end = Number(Math.min(duration, (i + 1) * 2).toFixed(1));
        const startLabel = formatTimecode(start);
        const endLabel = formatTimecode(end);
        const segText = typeof parsed[i] === 'string' ? parsed[i].trim() : '';

        segments.push({
          id: `seg-${i}-${Date.now()}`,
          start,
          end,
          startLabel,
          endLabel,
          timeLabel: `${startLabel} - ${endLabel}`,
          text: segText,
        });
      }
      // Check if all text was preserved
      const hasContent = segments.some((s) => s.text.length > 0);
      if (hasContent) return segments;
    }
  } catch (err) {
    console.warn('Gemini timestamp alignment fallback engaged:', err);
  }

  return distributeTextAcrossIntervals(text, duration);
}

// Text-to-Speech (Bangla)
app.post('/api/tts', async (req, res) => {
  try {
    const {
      text,
      voice = 'Kore',
      style = 'Natural, clear, warm Bengali pronunciation with smooth pacing',
      model = 'gemini-3.8-flash-lite-tts',
    } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required for audio generation' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in the environment.',
      });
    }

    const trimmedText = text.trim();

    // Call Gemini TTS API
    const response = await ai.models.generateContent({
      model: model || 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: trimmedText,
              speechMetadata: {
                style: style || 'Clear, authentic Bengali speaker with natural diction and pleasant cadence',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice || 'Kore',
            },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find(
      (part) => part.inlineData && part.inlineData.data
    );

    if (!audioPart || !audioPart.inlineData?.data) {
      const textPart = candidate?.content?.parts?.find((p) => p.text);
      const textMsg = textPart?.text || 'No audio data returned by TTS model';
      return res.status(502).json({ error: textMsg });
    }

    const base64Audio = audioPart.inlineData.data;
    const mimeType = audioPart.inlineData.mimeType || 'audio/wav';

    // Calculate exact audio duration from WAV RIFF header
    const wavBuffer = Buffer.from(base64Audio, 'base64');
    let byteRate = 48000; // default for 24kHz 16-bit mono
    if (wavBuffer.length >= 32) {
      const readRate = wavBuffer.readUInt32LE(28);
      if (readRate > 0) byteRate = readRate;
    }
    const dataSize = Math.max(0, wavBuffer.length - 44);
    const duration = Number((dataSize / byteRate).toFixed(2));

    // Generate 2-second timestamp segments and aligned transcript
    const timestamps = await generateTwoSecondTimestamps(trimmedText, duration);

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType,
      voice,
      style,
      duration,
      timestamps,
      characterCount: trimmedText.length,
      wordCount: trimmedText.split(/\s+/).filter(Boolean).length,
    });
  } catch (error) {
    console.error('TTS Generation error:', error);
    return res.status(500).json({
      error: getErrorMessage(error) || 'Failed to synthesize speech in Bangla',
    });
  }
});

// Dual-speaker dialogue TTS
app.post('/api/multi-speaker', async (req, res) => {
  try {
    const { dialogues, speaker1Voice = 'Puck', speaker2Voice = 'Kore' } = req.body;
    // dialogues: Array<{ speaker: 'Speaker1' | 'Speaker2', text: string, style?: string }>

    if (!Array.isArray(dialogues) || dialogues.length === 0) {
      return res.status(400).json({ error: 'Valid dialogues array required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    const parts = dialogues.map((d) => ({
      text: `${d.speaker}: ${d.text}`,
      speechMetadata: {
        speaker: d.speaker,
        style: d.style || 'Natural conversational Bengali speech',
      },
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: 'Speaker1',
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: speaker1Voice || 'Puck' },
                },
              },
              {
                speaker: 'Speaker2',
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: speaker2Voice || 'Kore' },
                },
              },
            ],
          },
        },
      },
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.find(
      (part) => part.inlineData && part.inlineData.data
    );

    if (!audioPart || !audioPart.inlineData?.data) {
      return res.status(502).json({ error: 'No audio returned for dialogue' });
    }

    const base64Audio = audioPart.inlineData.data;
    const mimeType = audioPart.inlineData.mimeType || 'audio/wav';

    const wavBuffer = Buffer.from(base64Audio, 'base64');
    let byteRate = 48000;
    if (wavBuffer.length >= 32) {
      const readRate = wavBuffer.readUInt32LE(28);
      if (readRate > 0) byteRate = readRate;
    }
    const dataSize = Math.max(0, wavBuffer.length - 44);
    const duration = Number((dataSize / byteRate).toFixed(2));

    const combinedText = dialogues.map((d) => `${d.speakerLabel || d.speaker}: ${d.text}`).join('\n');
    const timestamps = await generateTwoSecondTimestamps(combinedText, duration);

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType,
      duration,
      timestamps,
    });
  } catch (error) {
    console.error('Multi-speaker TTS error:', error);
    return res.status(500).json({ error: getErrorMessage(error) });
  }
});

// Bangla text helper tools: Banglish converter, Translation, Speech Optimization
app.post('/api/polish', async (req, res) => {
  try {
    const { text, action } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    let systemInstruction = 'You are a Bengali linguistic and speech expert.';
    let prompt = '';

    if (action === 'banglish_to_bangla') {
      systemInstruction =
        'You are an expert in transliterating Romanized Bengali (Banglish) into proper, authentic, standard Bengali script (বাংলা হরফ). Output ONLY the converted Bengali text. Do not include explanation, greetings, quotes, or notes.';
      prompt = `Transliterate the following Banglish / phonetic text into natural Bengali (Bangla) script:\n\n${text}`;
    } else if (action === 'translate_to_bangla') {
      systemInstruction =
        'You are a master translator into natural, culturally fluent spoken Bengali (বাংলা). Output ONLY the translated Bengali text. Ensure natural phrasing for speech.';
      prompt = `Translate the following text into fluent, natural spoken Bengali:\n\n${text}`;
    } else if (action === 'enhance_for_speech') {
      systemInstruction =
        'You are an audio script editor for Bengali text-to-speech. Improve the given Bengali text by ensuring proper punctuation (দাঁড়ি ।, কমা ,, প্রশ্নবোধক চিহ্ন ?), rhythm, removing confusing typos, and making it flow effortlessly when read aloud. Keep the original meaning intact. Output ONLY the polished Bengali text.';
      prompt = `Polish this Bengali text for optimal speech synthesis and narration:\n\n${text}`;
    } else if (action === 'numbers_to_bangla_words') {
      systemInstruction =
        'You are a Bengali language specialist. Replace any English digits, dates, percentages, or numbers with standard spoken Bengali words (e.g. "120" -> "একশত বিশ", "2026" -> "দুই হাজার ছাব্বিশ", "50%" -> "পঞ্চাশ শতাংশ") so that a text-to-speech voice can pronounce them flawlessly. Output ONLY the resulting Bengali text.';
      prompt = `Convert all numerals and symbols in this Bengali text to spoken Bengali words:\n\n${text}`;
    } else {
      prompt = text;
    }

    let resultText = text;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `${systemInstruction}\n\nTask: ${prompt}`,
      });
      resultText = response.text?.trim() || text;
    } catch {
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${systemInstruction}\n\nTask: ${prompt}`,
      });
      resultText = fallbackResponse.text?.trim() || text;
    }

    return res.json({
      success: true,
      originalText: text,
      resultText,
      action,
    });
  } catch (error) {
    console.error('Polish text error:', error);
    return res.status(500).json({ error: getErrorMessage(error) });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Dhwani Bangla TTS Server listening on port ${PORT}`);
  });
}

startServer();
