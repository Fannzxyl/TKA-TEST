
export interface Particle {
  kana: string;
  romaji: string;
  fungsi: string[];
  contoh: { jp: string; kana: string; romaji: string; id: string }[];
}

export type TipeVocab = "kata kerja" | "kata benda" | "kata sifat";

export interface Vocab {
  id: string;
  jp: string;
  kana: string;
  romaji: string;
  id_meaning: string;
  tipe: TipeVocab;
  tema: string[];
}

export type QuestionType = "cloze" | "particle" | "ordering" | "tf" | "mc" | "kana";

export type KanaSet = "hiragana_basic" | "hiragana_advanced" | "katakana_basic" | "katakana_advanced";

export interface Question {
  id: string;
  type: QuestionType;
  stem?: string;
  passage?: string;
  tokens?: string[]; // For 'ordering' type
  choices?: string[];
  correctKeys: string[]; // Can be index or value
  explain?: string;
  vocabIds?: string[];
  tema?: string[];
  // For kana questions
  kana_question?: string; 
  romaji_answer?: string;
  kana_set?: KanaSet;
}

export interface Settings {
  kanaOnly: boolean;
  showKanji: boolean;
  showFurigana: boolean;
  timerPerSoal: boolean;
  perSoalSeconds: number;
  sound: boolean;
  highContrast: boolean;
  apiKey?: string;
}

export interface HistoryEntry {
  ts: number;
  type: QuestionType;
  tema?: string[];
  correct: boolean;
  durationMs: number;
  questionId?: string;
  vocabIds?: string[];
}

export interface AppState {
  tab: string;
  settings: Settings;
  favorites: string[]; // vocabId array
  history: HistoryEntry[];
  session: {
    inProgress: boolean;
    isTryout: boolean;
    questions: Question[];
    currentIndex: number;
    userAnswers: (string[] | null)[];
    startTime: number;
    questionStartTime: number;
  };
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  }
}

export type Action =
  | { type: 'SET_TAB'; payload: string }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'SAVE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'START_SESSION'; payload: { questions: Question[]; isTryout: boolean } }
  | { type: 'ANSWER_QUESTION'; payload: { answer: string[] } }
  | { type: 'NEXT_QUESTION' }
  | { type: 'END_SESSION'; payload?: { saveHistory: boolean } }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'IMPORT_DATA'; payload: { history: HistoryEntry[]; favorites: string[] } }
  | { type: 'RESET_PROGRESS' }
  | { type: 'SHOW_TOAST'; payload: { message: string; type: 'success' | 'error' | 'info' } }
  | { type: 'HIDE_TOAST' };