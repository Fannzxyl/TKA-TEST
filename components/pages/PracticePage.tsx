
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { QUESTION_TYPES } from '../../constants';
import { QuestionType } from '../../types';
import { getRandomQuestions } from '../../utils/utils';
import QuestionView from '../practice/QuestionView';
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon } from '../common/Icon';
import { JapaneseText } from '../common/JapaneseText';

const PracticePage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { session } = state;
    const [questionCount, setQuestionCount] = useState(10);
    const [selectedType, setSelectedType] = useState<QuestionType | 'campuran'>('campuran');
    
    const startPractice = () => {
        const questions = getRandomQuestions(questionCount, selectedType === 'campuran' ? undefined : selectedType);
        dispatch({ type: 'START_SESSION', payload: { questions, isTryout: false } });
    };

    if (session.inProgress && !session.isTryout) {
        const currentQuestion = session.questions[session.currentIndex];
        const userAnswer = session.userAnswers[session.currentIndex];
        const isAnswered = userAnswer !== null;
        
        const isCorrect = isAnswered && JSON.stringify(currentQuestion.correctKeys.map(k => k.toLowerCase()).sort()) === JSON.stringify(userAnswer.map(a => a.toLowerCase()).sort());

        return (
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Latihan</h2>
                    <p className="font-semibold">{session.currentIndex + 1} / {session.questions.length}</p>
                </div>

                <QuestionView 
                    question={currentQuestion}
                    onAnswer={(answer) => dispatch({ type: 'ANSWER_QUESTION', payload: { answer } })}
                    userAnswer={userAnswer}
                />
                
                {isAnswered && (
                    <div className={`mt-4 p-4 rounded-lg flex items-start ${isCorrect ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                        {isCorrect ? <CheckCircleIcon className="w-6 h-6 mr-3" /> : <XCircleIcon className="w-6 h-6 mr-3" />}
                        <div>
                            <p className="font-bold">{isCorrect ? 'Benar!' : 'Kurang Tepat'}</p>
                            {!isCorrect && <p>Jawaban yang benar: {currentQuestion.correctKeys.map(k => <JapaneseText key={k} jp={k} kana={k} className="font-semibold" />).reduce((prev, curr) => <>{prev}, {curr}</>)}</p>}
                            {currentQuestion.explain && <p className="text-sm mt-1">{currentQuestion.explain}</p>}
                        </div>
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    {session.currentIndex < session.questions.length - 1 ? (
                         <button onClick={() => dispatch({ type: 'NEXT_QUESTION' })} disabled={!isAnswered} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 flex items-center">
                            Lanjut <ArrowRightIcon className="w-5 h-5 ml-2" />
                        </button>
                    ) : (
                         <button onClick={() => dispatch({ type: 'END_SESSION' })} disabled={!isAnswered} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                            Selesai Latihan
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Mulai Latihan Baru</h1>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6">
                <div>
                    <label className="block text-lg font-medium mb-2">Jumlah Soal</label>
                    <select value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>
                </div>
                <div>
                    <label className="block text-lg font-medium mb-2">Tipe Soal</label>
                    <select value={selectedType} onChange={e => setSelectedType(e.target.value as any)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                        <option value="campuran">Campuran</option>
                        {QUESTION_TYPES.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                    </select>
                </div>
                <button onClick={startPractice} className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                    Mulai
                </button>
            </div>
        </div>
    );
};

export default PracticePage;
