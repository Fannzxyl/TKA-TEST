// Fix: Corrected import paths from './' to '../' to properly locate type definitions and data. This resolves type inference issues.
import { Question, QuestionType, Settings, HistoryEntry, Vocab } from '../types';
import { localQuestions } from '../data/db';

// Secure random number generator with fallback
export function secureRandom() {
  if (typeof window !== 'undefined' && window.crypto) {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    return randomBuffer[0] / (0xffffffff + 1);
  } else {
    return Math.random();
  }
}

// Fisher-Yates shuffle algorithm
// Fix: Corrected a typo in the generic signature from <T,> to <T>.
export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  let currentIndex = newArray.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(secureRandom() * currentIndex);
    currentIndex--;

    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]];
  }

  return newArray;
}

export function getRandomQuestions(
  count: number,
  type?: QuestionType,
  source: 'Lokal' | 'Gemini' | 'Campuran' = 'Lokal',
  excludeIds: string[] = []
): Question[] {
  // For now, we only implement local question generation
  let questionPool = localQuestions.filter(q => !excludeIds.includes(q.id));
  
  if (type) {
    questionPool = questionPool.filter(q => q.type === type);
  }

  const shuffled = shuffle(questionPool);
  return shuffled.slice(0, count).map(q => ({
    ...q,
    choices: q.choices ? shuffle(q.choices) : undefined,
    tokens: q.tokens ? shuffle(q.tokens) : undefined,
  }));
}


export function speak(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices().filter(voice => voice.lang === 'ja-JP');
      if (voices.length > 0) {
        utterance.voice = voices[0]; // Choose the first available Japanese voice
      }
      utterance.lang = 'ja-JP';
      utterance.rate = 0.95 + secureRandom() * 0.1; // 0.95 to 1.05
      window.speechSynthesis.speak(utterance);
    }
}

export const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
};

export const calculateAccuracy = (history: HistoryEntry[]) => {
    if (history.length === 0) return 0;
    const correctCount = history.filter(h => h.correct).length;
    return Math.round((correctCount / history.length) * 100);
};

export const getFrequentlyWrongVocab = (history: HistoryEntry[], allVocab: Vocab[], count: number): Vocab[] => {
    const wrongVocabCounts: { [key: string]: number } = {};
    
    history
        .filter(entry => !entry.correct && entry.vocabIds)
        .forEach(entry => {
            entry.vocabIds?.forEach(vocabId => {
                wrongVocabCounts[vocabId] = (wrongVocabCounts[vocabId] || 0) + 1;
            });
        });

    const sortedVocabIds = Object.keys(wrongVocabCounts).sort((a, b) => wrongVocabCounts[b] - wrongVocabCounts[a]);

    return sortedVocabIds
        .slice(0, count)
        .map(id => allVocab.find(v => v.id === id))
        .filter((v): v is Vocab => v !== undefined);
};