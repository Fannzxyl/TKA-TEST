
import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react';
import { AppState, Action, Settings, HistoryEntry } from '../types';

const initialState: AppState = {
  tab: 'beranda',
  settings: {
    kanaOnly: true,
    showKanji: false,
    showFurigana: false,
    timerPerSoal: false,
    perSoalSeconds: 30,
    sound: true,
    highContrast: false,
    apiKey: undefined,
  },
  favorites: [],
  history: [],
  session: {
    inProgress: false,
    isTryout: false,
    questions: [],
    currentIndex: 0,
    userAnswers: [],
    startTime: 0,
    questionStartTime: 0,
  },
  toast: { message: '', type: 'info', visible: false },
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, tab: action.payload };
    
    case 'LOAD_STATE':
        return { ...state, ...action.payload };

    case 'SAVE_SETTINGS': {
        const newSettings = { ...state.settings, ...action.payload };
        localStorage.setItem('tka_settings', JSON.stringify(newSettings));
        return { ...state, settings: newSettings };
    }

    case 'START_SESSION':
      return {
        ...state,
        session: {
          inProgress: true,
          isTryout: action.payload.isTryout,
          questions: action.payload.questions,
          currentIndex: 0,
          userAnswers: new Array(action.payload.questions.length).fill(null),
          startTime: Date.now(),
          questionStartTime: Date.now(),
        },
      };

    case 'ANSWER_QUESTION': {
        const newAnswers = [...state.session.userAnswers];
        newAnswers[state.session.currentIndex] = action.payload.answer;
        return { ...state, session: { ...state.session, userAnswers: newAnswers } };
    }

    case 'NEXT_QUESTION': {
        const isCorrect = checkAnswer(state);
        const durationMs = Date.now() - state.session.questionStartTime;
        const currentQuestion = state.session.questions[state.session.currentIndex];

        const newHistoryEntry: HistoryEntry = {
            ts: Date.now(),
            type: currentQuestion.type,
            tema: currentQuestion.tema,
            correct: isCorrect,
            durationMs: durationMs,
            questionId: currentQuestion.id,
            vocabIds: currentQuestion.vocabIds
        };
        
        const nextIndex = state.session.currentIndex + 1;
        const sessionInProgress = nextIndex < state.session.questions.length;
        
        const newState = {
            ...state,
            history: [...state.history, newHistoryEntry],
            session: {
                ...state.session,
                currentIndex: sessionInProgress ? nextIndex : state.session.currentIndex,
                questionStartTime: Date.now(),
                inProgress: sessionInProgress,
            }
        };

        if (!sessionInProgress) {
            localStorage.setItem('tka_history', JSON.stringify(newState.history));
        }
        return newState;
    }

    case 'END_SESSION':
      return { ...state, session: initialState.session };

    case 'TOGGLE_FAVORITE': {
        const newFavorites = state.favorites.includes(action.payload)
            ? state.favorites.filter(id => id !== action.payload)
            : [...state.favorites, action.payload];
        localStorage.setItem('tka_favorites', JSON.stringify(newFavorites));
        return { ...state, favorites: newFavorites };
    }
      
    case 'IMPORT_DATA': {
        const newState = { ...state, ...action.payload };
        localStorage.setItem('tka_history', JSON.stringify(newState.history));
        localStorage.setItem('tka_favorites', JSON.stringify(newState.favorites));
        return newState;
    }

    case 'RESET_PROGRESS':
        localStorage.removeItem('tka_history');
        localStorage.removeItem('tka_favorites');
        return { ...state, history: [], favorites: [] };
          
    case 'SHOW_TOAST':
      return { ...state, toast: { ...action.payload, visible: true } };

    case 'HIDE_TOAST':
      return { ...state, toast: { ...state.toast, visible: false } };

    default:
      return state;
  }
}

function checkAnswer(state: AppState): boolean {
    const { questions, currentIndex, userAnswers } = state.session;
    const currentQuestion = questions[currentIndex];
    const currentUserAnswer = userAnswers[currentIndex];
    if (!currentUserAnswer) return false;
    
    const correctAnswers = currentQuestion.correctKeys.map(k => k.toLowerCase());
    const userAnswersLower = currentUserAnswer.map(a => a.toLowerCase());

    if (currentQuestion.type === 'ordering') {
        return userAnswersLower.join('') === correctAnswers.join('');
    }
    
    return correctAnswers.length === userAnswersLower.length && correctAnswers.every(key => userAnswersLower.includes(key));
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('tka_settings');
      const savedHistory = localStorage.getItem('tka_history');
      const savedFavorites = localStorage.getItem('tka_favorites');
      
      const payload: Partial<AppState> = {};
      if (savedSettings) payload.settings = JSON.parse(savedSettings);
      if (savedHistory) payload.history = JSON.parse(savedHistory);
      if (savedFavorites) payload.favorites = JSON.parse(savedFavorites);

      if (Object.keys(payload).length > 0) {
        dispatch({ type: 'LOAD_STATE', payload });
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (state.settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [state.settings.highContrast]);


  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
