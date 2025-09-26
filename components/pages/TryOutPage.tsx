
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { getRandomQuestions } from '../../utils/utils';
import QuestionView from '../practice/QuestionView';
import { ArrowRightIcon } from '../common/Icon';

const TRYOUT_QUESTION_COUNT = 25;

const TryOutPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { session, history } = state;
    
    const startTryout = () => {
        const questions = getRandomQuestions(TRYOUT_QUESTION_COUNT, undefined, 'Lokal');
        dispatch({ type: 'START_SESSION', payload: { questions, isTryout: true } });
    };

    const handleNext = () => {
        dispatch({ type: 'NEXT_QUESTION' });
    }
    
    const finishTryout = () => {
        dispatch({ type: 'NEXT_QUESTION' });
        // The result will be visible in the history page.
        dispatch({ type: 'SET_TAB', payload: 'riwayat' });
    }

    if (session.inProgress && session.isTryout) {
        const currentQuestion = session.questions[session.currentIndex];
        const userAnswer = session.userAnswers[session.currentIndex];

        return (
            <div className="max-w-2xl mx-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Try Out</h2>
                    <p className="font-semibold">{session.currentIndex + 1} / {session.questions.length}</p>
                </div>

                <QuestionView 
                    question={currentQuestion}
                    onAnswer={(answer) => dispatch({ type: 'ANSWER_QUESTION', payload: { answer } })}
                    userAnswer={userAnswer}
                />
                
                <div className="mt-6 flex justify-end">
                    {session.currentIndex < session.questions.length - 1 ? (
                         <button onClick={handleNext} disabled={userAnswer === null} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 flex items-center">
                            Soal Berikutnya <ArrowRightIcon className="w-5 h-5 ml-2" />
                        </button>
                    ) : (
                         <button onClick={finishTryout} disabled={userAnswer === null} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                            Selesaikan Try Out
                        </button>
                    )}
                </div>
            </div>
        );
    }
    
    const tryoutSessions = history.reduce((acc, curr) => {
        if (curr.isTryout) { // Assuming isTryout is part of history, let's add it in context
             const lastSession = acc[acc.length - 1];
             if (lastSession && (curr.ts - lastSession[lastSession.length - 1].ts < 1000 * 60 * 30)) { // group sessions within 30 mins
                 lastSession.push(curr);
             } else {
                 acc.push([curr]);
             }
        }
        return acc;
    }, [] as any[][]);
    
    const lastSession = tryoutSessions[tryoutSessions.length - 1];
    const lastScore = lastSession ? (lastSession.filter(h=>h.correct).length / lastSession.length) * 100 : null;

    return (
        <div className="max-w-lg mx-auto text-center">
            <h1 className="text-3xl font-bold mb-2">Try Out Simulasi</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Uji kemampuan Anda dengan {TRYOUT_QUESTION_COUNT} soal campuran dalam mode simulasi ujian.</p>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-4">
                {lastScore !== null && (
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold">Skor Terakhir Anda</h3>
                        <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{lastScore.toFixed(0)}%</p>
                    </div>
                )}
                <p>Saat Try Out dimulai, Anda harus menjawab semua soal. Hasil akan ditampilkan di akhir.</p>
                <button onClick={startTryout} className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                    Mulai Try Out
                </button>
            </div>
        </div>
    );
};

export default TryOutPage;
