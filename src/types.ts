export type VoiceName = 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon';

export interface VoiceOption {
  id: VoiceName;
  name: string;
  banglaName: string;
  gender: 'female' | 'male';
  tag: string;
  description: string;
  banglaDesc: string;
  avatarColor: string;
}

export interface StylePreset {
  id: string;
  nameBangla: string;
  nameEnglish: string;
  promptDescription: string;
  iconName: string;
}

export interface SampleBanglaText {
  id: string;
  category: string;
  categoryBangla: string;
  title: string;
  text: string;
  suggestedVoice: VoiceName;
  suggestedStyleId: string;
}

export interface GeneratedAudioTrack {
  id: string;
  title: string;
  text: string;
  voice: VoiceName;
  style: string;
  audioUrl: string; // Blob or Data URL
  audioBase64: string;
  mimeType: string;
  createdAt: number;
  duration?: number;
  wordCount: number;
  characterCount: number;
  isDialogue?: boolean;
}

export interface DialogueLine {
  id: string;
  speaker: 'Speaker1' | 'Speaker2';
  speakerLabel: string;
  text: string;
  style?: string;
}
