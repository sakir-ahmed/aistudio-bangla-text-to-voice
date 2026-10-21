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
      // Check if text was returned explaining any restriction
      const textPart = candidate?.content?.parts?.find((p) => p.text);
      const textMsg = textPart?.text || 'No audio data returned by TTS model';
      return res.status(502).json({ error: textMsg });
    }

    const base64Audio = audioPart.inlineData.data;
    const mimeType = audioPart.inlineData.mimeType || 'audio/wav';

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType,
      voice,
      style,
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

    return res.json({
      success: true,
      audioBase64: audioPart.inlineData.data,
      mimeType: audioPart.inlineData.mimeType || 'audio/wav',
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
