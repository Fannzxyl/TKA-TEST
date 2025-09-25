

import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { HomePage } from './components/pages/HomePage';
import { ParticlesPage } from './components/pages/ParticlesPage';
import { VocabularyPage } from './components/pages/VocabularyPage';
import { PracticePage } from './components/pages/PracticePage';
import { TryOutPage } from './components/pages/TryOutPage';
import { HistoryPage } from './components/pages/HistoryPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { Toast } from './components/common/Toast';
import { QuestionView } from './components/practice/QuestionView';
import { TABS } from './constants';
import { ArrowRightIcon, CheckCircleIcon, XCircleIcon } from './components/common/Icon';
import * as Icons from './components/common/Icon';
import { formatDuration } from './utils/utils';

const iconMap: { [key: string]: React.FC<{ className?: string }> } = {
  beranda: Icons.HomeIcon,
  partikel: Icons.SparklesIcon,
  kosakata: Icons.BookOpenIcon,
  latihan: Icons.BeakerIcon,
  tryout: Icons.AcademicCapIcon,
  riwayat: Icons.ChartBarIcon,
  pengaturan: Icons.CogIcon,
};


const SessionResult: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { questions, userAnswers, isTryout } = state.session;

    const score = questions.reduce((acc, q, i) => {
        const correctAnswers = q.correctKeys.map(k => k.toLowerCase());
        const userAns = userAnswers[i]?.map(a => a.toLowerCase()) || [];
        const isCorrect = correctAnswers.length === userAns.length && correctAnswers.every(key => userAns.includes(key));
        return acc + (isCorrect ? 1 : 0);
    }, 0);

    const accuracy = Math.round((score / questions.length) * 100);

    const retryWrong = () => {
        const wrongQuestions = questions.filter((q, i) => {
            const correctAnswers = q.correctKeys.map(k => k.toLowerCase());
            const userAns = userAnswers[i]?.map(a => a.toLowerCase()) || [];
            const isCorrect = correctAnswers.length === userAns.length && correctAnswers.every(key => userAns.includes(key));
            return !isCorrect;
        });
        if (wrongQuestions.length > 0) {
            dispatch({ type: 'START_SESSION', payload: { questions: wrongQuestions, isTryout: false } });
        } else {
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Tidak ada jawaban yang salah!', type: 'success' } });
            // Fix: Corrected the payload for the 'END_SESSION' action.
            // The type definition requires a `saveHistory` boolean if a payload is provided.
            // `false` is used because history is saved when the session concludes naturally,
            // and this action merely returns to the main screen from the results page.
            dispatch({ type: 'END_SESSION', payload: { saveHistory: false } });
        }
    };

    return (
        <div className="p-4 md:p-6 text-center max-w-2xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-main mb-2">{isTryout ? 'Try Out Selesai!' : 'Latihan Selesai!'}</h1>
            <div className="bg-card text-main p-6 rounded-2xl shadow-md border border-main/10 mt-6">
                <p className="text-lg">Skor Anda:</p>
                <p className="text-6xl font-bold text-primary my-2">{score} <span className="text-3xl text-gray-500">/ {questions.length}</span></p>
                <p className="text-xl text-accent font-semibold">{accuracy}% Benar</p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                 <button onClick={retryWrong} className="bg-yellow-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-yellow-600 transition">
                    Ulangi yang Salah
                </button>
                {/* Fix: Corrected the payload for the 'END_SESSION' action. */}
                {/* The type definition requires a `saveHistory` boolean if a payload is provided. */}
                {/* `false` is used because history is saved when the session concludes naturally, */}
                {/* and this action merely returns to the main screen from the results page. */}
                <button onClick={() => dispatch({ type: 'END_SESSION', payload: { saveHistory: false } })} className="bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition">
                    Kembali
                </button>
            </div>
        </div>
    );
};


const SessionView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { questions, currentIndex, userAnswers, isTryout, startTime } = state.session;
    const currentQuestion = questions[currentIndex];
    const userAnswer = userAnswers[currentIndex];
    const [isAnswered, setIsAnswered] = useState(false);
    
    const [timeLeft, setTimeLeft] = useState(isTryout ? 600 : null);
    
    useEffect(() => {
        if(isTryout && timeLeft !== null) {
            if (timeLeft <= 0) {
                dispatch({ type: 'NEXT_QUESTION' }); // Force end session
                return;
            }
            const timer = setInterval(() => setTimeLeft(t => t! - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [isTryout, timeLeft, dispatch]);

    useEffect(() => {
        setIsAnswered(false);
    }, [currentIndex]);
    
    const handleCheck = () => {
        if (!userAnswer || userAnswer.length === 0) {
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Pilih jawaban terlebih dahulu', type: 'error' } });
            return;
        }
        setIsAnswered(true);
    };

    const handleNext = () => {
        dispatch({ type: 'NEXT_QUESTION' });
    };

    const isCorrect = isAnswered && checkAnswer();
    
    function checkAnswer() {
        const correctAnswers = currentQuestion.correctKeys.map(k => k.toLowerCase());
        const userAns = userAnswer?.map(a => a.toLowerCase()) || [];
        if (currentQuestion.type === 'ordering') {
             return userAns.join('') === correctAnswers.join('');
        }
        return correctAnswers.length === userAns.length && correctAnswers.every(key => userAns.includes(key));
    }

    return (
        <div className="p-4 md:p-6 flex flex-col items-center animate-fade-in">
            <div className="w-full max-w-2xl mb-4 flex justify-between items-center">
                <span className="font-bold text-lg text-main">Soal {currentIndex + 1} dari {questions.length}</span>
                {isTryout && timeLeft !== null && (
                    <span className="font-mono text-lg bg-red-100 text-red-700 px-3 py-1 rounded-full">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
            </div>

            <QuestionView 
                question={currentQuestion}
                onAnswer={(answer) => dispatch({ type: 'ANSWER_QUESTION', payload: { answer } })}
                isAnswered={isAnswered}
            />

            {isAnswered && (
                <div className="mt-6 p-4 rounded-xl text-center w-full max-w-2xl animate-fade-in-up" >
                    <div className={`flex items-center justify-center gap-2 p-4 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isCorrect ? <CheckCircleIcon className="w-6 h-6"/> : <XCircleIcon className="w-6 h-6"/>}
                        <span className="font-bold">{isCorrect ? 'Benar!' : 'Kurang Tepat'}</span>
                    </div>
                    <p className="mt-2 text-gray-600">{currentQuestion.explain}</p>
                </div>
            )}
            
            <div className="mt-8">
                {!isAnswered ? (
                    <button onClick={handleCheck} className="bg-primary text-white font-bold py-3 px-12 rounded-full shadow-lg hover:bg-blue-700 transition transform hover:scale-105 active:scale-98">
                        Cek Jawaban
                    </button>
                ) : (
                    <button onClick={handleNext} className="bg-accent text-white font-bold py-3 px-12 rounded-full shadow-lg hover:bg-green-700 transition transform hover:scale-105 active:scale-98 flex items-center gap-2">
                        <span>{currentIndex === questions.length - 1 ? 'Lihat Hasil' : 'Soal Berikutnya'}</span>
                        <ArrowRightIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

const PageRenderer: React.FC = () => {
    const { state } = useAppContext();

    switch(state.tab) {
        case 'beranda': return <HomePage />;
        case 'partikel': return <ParticlesPage />;
        case 'kosakata': return <VocabularyPage />;
        case 'latihan': return <PracticePage />;
        case 'tryout': return <TryOutPage />;
        case 'riwayat': return <HistoryPage />;
        case 'pengaturan': return <SettingsPage />;
        default: return <HomePage />;
    }
}

function MainContent() {
    const { state } = useAppContext();
    const { inProgress, questions, currentIndex } = state.session;

    if (inProgress) {
        if (currentIndex < questions.length) {
            return <SessionView />;
        } else {
            return <SessionResult />;
        }
    }
    return <PageRenderer />;
}

const App: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [isNavOpen, setIsNavOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-main">
            <header className="sticky top-0 bg-card/80 backdrop-blur-sm shadow-sm z-40 border-b border-main/10">
                <div className="container mx-auto px-4 h-16 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-primary">TKA 日本語 2025</h1>
                    <nav className="hidden md:flex space-x-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${state.tab === tab.id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                    <button className="md:hidden" onClick={() => setIsNavOpen(!isNavOpen)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>
            </header>

            {/* Mobile Nav */}
            <div className={`fixed inset-0 z-50 transform ${isNavOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
                <div className="absolute inset-0 bg-black/50" onClick={() => setIsNavOpen(false)}></div>
                <nav className="relative h-full w-64 bg-card p-4 space-y-2">
                    {TABS.map(tab => {
                        const Icon = iconMap[tab.id];
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    dispatch({ type: 'SET_TAB', payload: tab.id });
                                    setIsNavOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${state.tab === tab.id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>
            
            <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
                <MainContent />
            </main>
            <Toast />
        </div>
    );
};


const AppWrapper: React.FC = () => (
    <AppProvider>
        <App />
    </AppProvider>
);

export default AppWrapper;