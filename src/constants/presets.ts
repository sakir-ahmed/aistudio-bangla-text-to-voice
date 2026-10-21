import { VoiceOption, StylePreset, SampleBanglaText } from '../types';

export const VOICES: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore',
    banglaName: 'কোর (Kore)',
    gender: 'female',
    tag: 'জনপ্রিয় ও সুমধুর',
    description: 'Warm, melodious, and empathetic feminine tone',
    banglaDesc: 'সুমধুর, স্নেহময়ী ও স্পষ্ট নারী কণ্ঠ — গল্প, কবিতা ও বর্ণনায় অতুলনীয়',
    avatarColor: 'from-pink-500 to-rose-600',
  },
  {
    id: 'Puck',
    name: 'Puck',
    banglaName: 'পাক (Puck)',
    gender: 'male',
    tag: 'প্রাণবন্ত ও উদ্যমী',
    description: 'Enthusiastic, energetic, and youth-friendly tone',
    banglaDesc: 'প্রাণবন্ত, চটপটে ও বন্ধুত্বপূর্ণ পুরুষ কণ্ঠ — পডকাস্ট, আড্ডা ও বিজ্ঞাপনে সেরা',
    avatarColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    banglaName: 'জেফির (Zephyr)',
    gender: 'female',
    tag: 'শান্ত ও প্রফেশনাল',
    description: 'Calm, articulate, and crystal-clear professional diction',
    banglaDesc: 'ধীরস্থির, মার্জিত ও পেশাদার বাচনভঙ্গি — সংবাদ, অডিওবুক ও শিক্ষামূলক নির্দেশনায় আদর্শ',
    avatarColor: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    banglaName: 'ফেনরির (Fenrir)',
    gender: 'male',
    tag: 'গম্ভীর ও বলিষ্ঠ',
    description: 'Deep, resonant, authoritative voice',
    banglaDesc: 'গম্ভীর, বলিষ্ঠ ও প্রামাণ্য পুরুষ কণ্ঠ — ট্রেলার, ডকুমেন্টারি ও আনুষ্ঠানিক ভাষণে মানানসই',
    avatarColor: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'Charon',
    name: 'Charon',
    banglaName: 'শ্যারন (Charon)',
    gender: 'male',
    tag: 'অনুপম ও ভাবগম্ভীর',
    description: 'Reflective, gentle, and conversational storytelling',
    banglaDesc: 'শান্ত, আন্তরিক ও দার্শনিক ভাব — আত্মকথন, মেডিটেশন ও গভীর রচনায় অনন্য',
    avatarColor: 'from-emerald-500 to-teal-600',
  },
];

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'natural',
    nameBangla: 'স্বাভাবিক ও প্রাণবন্ত',
    nameEnglish: 'Natural & Balanced',
    promptDescription:
      'Clear, warm, and natural Bengali speaker with authentic Bangladeshi diction, smooth phrasing, and comfortable conversational tempo.',
    iconName: 'Sparkles',
  },
  {
    id: 'news',
    nameBangla: 'সংবাদ পাঠক / আনুষ্ঠানিক',
    nameEnglish: 'News & Formal',
    promptDescription:
      'Professional Bengali news anchor tone. Highly articulate, authoritative, pristine pronunciation, formal cadence, and measured pacing.',
    iconName: 'Radio',
  },
  {
    id: 'story',
    nameBangla: 'গল্পকথক / নাটকীয়',
    nameEnglish: 'Expressive Storyteller',
    promptDescription:
      'Expressive Bengali audiobook narrator with vivid emotional modulation, captivating pauses, warm warmth, and engaging theatrical delivery.',
    iconName: 'BookOpen',
  },
  {
    id: 'poetry',
    nameBangla: 'কবিতা আবৃত্তি',
    nameEnglish: 'Poetic Recitation',
    promptDescription:
      'Lyrical Bengali recitation with deep emotional nuance, rhythmic pauses at stanza ends, melodious cadence, and poetic gravity.',
    iconName: 'Feather',
  },
  {
    id: 'joyful',
    nameBangla: 'উচ্ছ্বসিত ও হাসিখুশি',
    nameEnglish: 'Joyful & Cheerful',
    promptDescription:
      'Uplifting, smiling, enthusiastic Bengali voice filled with warmth, energy, and welcoming brightness.',
    iconName: 'Smile',
  },
  {
    id: 'calm',
    nameBangla: 'শান্ত ও ধ্যানমগ্ন',
    nameEnglish: 'Calm & Soothing',
    promptDescription:
      'Soft, calming, serene, whispering-smooth Bengali voice for relaxation, mindfulness, bedtime reflection, and gentle reassurance.',
    iconName: 'Moon',
  },
];

export const SAMPLE_TEXTS: SampleBanglaText[] = [
  {
    id: 'poetry-rabindranath',
    category: 'কবিতা',
    categoryBangla: 'রবীন্দ্রনাথের কবিতা',
    title: 'চিত্ত যেথা ভয়শূন্য',
    text: 'চিত্ত যেথা ভয়শূন্য, উচ্চ যেথা শির,\nজ্ঞান যেথা মুক্ত, যেথা গৃহের প্রাচীর\nআপন প্রাঙ্গণতলে দিবসশর্বরী\nবসুধারে রাখে নাই খণ্ড ক্ষুদ্র করি,\nযেথা বাক্য হৃদয়ের উৎসমুখ হতে\nউচ্ছ্বসিয়া উঠে,\nযেথা নির্বারিত স্রোতে\nদেশে দেশে দিশে দিশে কর্মধারা ধায়\nঅজস্র সহস্রবিধ চরিতার্থতায়,\nসেই স্বর্গে করো জাগরিত।',
    suggestedVoice: 'Fenrir',
    suggestedStyleId: 'poetry',
  },
  {
    id: 'welcome-greeting',
    category: 'স্বাগতম',
    categoryBangla: 'শুভেচ্ছা ও পরিচয়',
    title: 'স্বাগত সম্ভাষণ',
    text: 'শুভ সকাল! "ধ্বনি" বাংলা টেক্সট-টু-অডিও স্টুডিওতে আপনাকে স্বাগতম। আপনি যেকোনো বাংলা লেখা এখানে লিখলেই তা এক নিমিষে রূপান্তর হবে অত্যন্ত প্রাঞ্জল, জীবন্ত ও শ্রুতিমধুর অডিওতে। পরীক্ষা করে দেখার জন্য নিচের প্লে বাটনে চাপুন।',
    suggestedVoice: 'Kore',
    suggestedStyleId: 'natural',
  },
  {
    id: 'news-weather',
    category: 'সংবাদ',
    categoryBangla: 'সংবাদ বুলেটিন',
    title: 'আজকের আবহাওয়া ও প্রযুক্তি বার্তা',
    text: 'আজকের প্রধান সংবাদ: দেশের অধিকাংশ অঞ্চলে আকাশ আংশিক মেঘলা থাকতে পারে। এদিকে তথ্যপ্রযুক্তি খাতে কৃত্রিম বুদ্ধিমত্তার প্রসার ও বাংলা ভাষা প্রক্রিয়াকরণে এসেছে যুগান্তকারী অগ্রগতি। অডিও প্রযুক্তির সহায়তায় এখন দৃষ্টিহীন ও সাধারণ মানুষ যেকোনো বার্তা সহজেই শুনতে পারবেন।',
    suggestedVoice: 'Zephyr',
    suggestedStyleId: 'news',
  },
  {
    id: 'story-fairytale',
    category: 'গল্প',
    categoryBangla: 'ছোটগল্প',
    title: 'এক রাখাল ও বাঁশির সুর',
    text: 'একদা এক সবুজ শ্যামল গাঁয়ে বাস করতো এক রাখাল বালক। নদীর ধারে ঘাস খাওয়ার সময় সে তার বাঁশিতে এমন অপূর্ব সুর তুলতো, যেন গাছের পাতারাও দোলা দিত আর পাখিরা গান থামিয়ে সেই সুর শুনতো। একদিন সে নদী তীরে কুড়িয়ে পেল এক চমকপ্রদ স্বর্ণালী পাথর...',
    suggestedVoice: 'Charon',
    suggestedStyleId: 'story',
  },
  {
    id: 'inspirational-quote',
    category: 'অনুপ্রেরণা',
    categoryBangla: 'অনুপ্রেরণামূলক',
    title: 'অদম্য ইচ্ছাশক্তি',
    text: 'জীবনের প্রতিটি পদক্ষেপে বাধা আসবেই, কিন্তু পরাজয় মেনে নেওয়া কখনোই সমাধান নয়। যে ব্যক্তি নিজের লক্ষ্য সম্পর্কে অবিচল এবং প্রতিদিন নতুন উদ্যমে প্রচেষ্টা চালিয়ে যায়, সাফল্য তার পদচুম্বন করতে বাধ্য। নিজেকে বিশ্বাস করুন, আপনি পারবেন!',
    suggestedVoice: 'Puck',
    suggestedStyleId: 'joyful',
  },
];
