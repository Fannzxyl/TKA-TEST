
import React, { useState, useEffect } from 'react';
import { Question } from '../../types';
import { JapaneseText } from '../common/JapaneseText';
import { useAppContext } from '../../context/AppContext';

interface QuestionViewProps {
  question: Question;
  onAnswer: (answer: string[]) => void;
  userAnswer: string[] | null;
}

const QuestionView: React.FC<QuestionViewProps> = ({ question, onAnswer, userAnswer }) => {
    const { state } = useAppContext();
    const [selectedOrdering, setSelectedOrdering] = useState<string[]>([]);
    
    useEffect(() => {
        setSelectedOrdering([]);
    }, [question.id]);

    const handleChoiceClick = (choice: string) => {
        if (userAnswer) return; // Don't allow changes after submission for this model
        onAnswer([choice]);
    };

    const handleOrderingClick = (token: string) => {
        if (userAnswer) return;
        const newOrder = [...selectedOrdering, token];
        setSelectedOrdering(newOrder);
        onAnswer(newOrder);
    };

    const resetOrdering = () => {
        setSelectedOrdering([]);
        onAnswer([]);
    };
    
    const renderQuestionType = () => {
        const baseButtonClass = "w-full p-3 my-1 text-left rounded-lg border-2 transition-colors";
        const selectedButtonClass = "bg-indigo-200 dark:bg-indigo-800 border-indigo-500";
        const unselectedButtonClass = "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600";
        const disabledButtonClass = "disabled:opacity-50 disabled:cursor-not-allowed";

        switch (question.type) {
            case 'cloze':
            case 'particle':
            case 'mc':
            case 'tf':
            case 'kana':
                return (
                    <div className="space-y-2">
                        {question.choices?.map((choice, index) => (
                            <button
                                key={index}
                                onClick={() => handleChoiceClick(choice)}
                                disabled={!!userAnswer}
                                className={`${baseButtonClass} ${userAnswer?.includes(choice) ? selectedButtonClass : unselectedButtonClass} ${disabledButtonClass}`}
                            >
                                {question.type === 'kana' && question.romaji_answer ? choice : <JapaneseText jp={choice} kana={choice} />}
                            </button>
                        ))}
                    </div>
                );

            case 'ordering':
                const remainingTokens = question.tokens?.filter(t => !selectedOrdering.includes(t)) || [];
                return (
                    <div>
                        <div className="h-16 p-2 mb-4 border-2 border-dashed rounded-md flex items-center space-x-2 bg-gray-50 dark:bg-gray-700">
                            {selectedOrdering.map((token, index) => (
                                <span key={index} className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded">
                                    <JapaneseText jp={token} kana={token} />
                                </span>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {remainingTokens.map((token, index) => (
                                <button key={index} onClick={() => handleOrderingClick(token)} className="p-2 bg-white dark:bg-gray-700 border-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <JapaneseText jp={token} kana={token} />
                                </button>
                            ))}
                        </div>
                        <button onClick={resetOrdering} disabled={!!userAnswer} className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Reset</button>
                    </div>
                );
            
            default:
                return <p>Tipe soal tidak dikenal.</p>;
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {question.passage && <p className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md italic">"{question.passage}"</p>}
            <div className="text-xl mb-6">
                {question.stem && <JapaneseText jp={question.stem} kana={question.stem} />}
                {question.kana_question && <span className="text-4xl font-bold">{question.kana_question}</span>}
                {question.romaji_answer && <p>Tuliskan <span className="font-bold text-indigo-500">{question.romaji_answer}</span> dalam hiragana/katakana.</p>}
            </div>
            {renderQuestionType()}
        </div>
    );
};

export default QuestionView;
