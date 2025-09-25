
import React, { useState, useEffect } from 'react';
import { Question } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface QuestionViewProps {
  question: Question;
  onAnswer: (answer: string[]) => void;
  isAnswered: boolean;
}

const ChoiceButton: React.FC<{
  text: string;
  onClick: () => void;
  isSelected: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
}> = ({ text, onClick, isSelected, isCorrect, isIncorrect }) => {
  let bgClass = 'bg-card hover:bg-blue-100';
  if (isSelected) bgClass = 'bg-blue-200 ring-2 ring-primary';
  if (isCorrect) bgClass = 'bg-green-200 text-green-900 ring-2 ring-green-500';
  if (isIncorrect) bgClass = 'bg-red-200 text-red-900 ring-2 ring-red-500';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border border-main/20 text-main transition ${bgClass}`}
      disabled={isCorrect !== undefined}
    >
      {text}
    </button>
  );
};

export const QuestionView: React.FC<QuestionViewProps> = ({ question, onAnswer, isAnswered }) => {
    const { state } = useAppContext();
    const [selected, setSelected] = useState<string[]>([]);
    const allowMultiple = question.correctKeys.length > 1;

    useEffect(() => {
        setSelected([]);
    }, [question]);

    useEffect(() => {
        onAnswer(selected);
    }, [selected, onAnswer]);

    const handleSelect = (choice: string) => {
        if (isAnswered) return;
        if (allowMultiple) {
            setSelected(prev =>
                prev.includes(choice) ? prev.filter(c => c !== choice) : [...prev, choice]
            );
        } else {
            setSelected([choice]);
        }
    };
    
    const handleOrderingDrop = (draggedToken: string, targetToken: string) => {
        const newSelected = [...selected];
        const draggedIndex = newSelected.indexOf(draggedToken);
        const targetIndex = newSelected.indexOf(targetToken);

        // Simple swap for this implementation
        [newSelected[draggedIndex], newSelected[targetIndex]] = [newSelected[targetIndex], newSelected[draggedIndex]];
        setSelected(newSelected);
    };

    useEffect(() => {
      if (question.type === 'ordering' && question.tokens) {
        setSelected(question.tokens);
      }
    }, [question]);

    const renderChoices = () => {
        if (!question.choices) return null;
        return (
            <div className="space-y-3">
                {question.choices.map((choice, index) => {
                    const choiceId = String(choice);
                    const isCorrect = isAnswered ? question.correctKeys.includes(choiceId) : undefined;
                    const isIncorrect = isAnswered && selected.includes(choiceId) && !isCorrect ? true : undefined;

                    return (
                        <ChoiceButton
                            key={index}
                            text={choice}
                            onClick={() => handleSelect(choiceId)}
                            isSelected={selected.includes(choiceId)}
                            isCorrect={isCorrect}
                            isIncorrect={isIncorrect}
                        />
                    );
                })}
            </div>
        );
    };
    
    const renderOrdering = () => {
        if (!question.tokens) return null;
        
        const [dragged, setDragged] = useState<string | null>(null);

        const handleDragStart = (token: string) => setDragged(token);
        const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
        const handleDrop = (targetToken: string) => {
            if(dragged && !isAnswered) {
                handleOrderingDrop(dragged, targetToken);
            }
            setDragged(null);
        }

        return (
            <div className="space-y-3">
                <p className="text-sm text-gray-500">Susun kata-kata berikut menjadi kalimat yang benar.</p>
                <div className="p-4 bg-gray-100 rounded-lg min-h-[50px] flex flex-wrap gap-2">
                    {selected.map((token, index) => {
                        const isCorrect = isAnswered ? question.correctKeys[index] === token : undefined;
                        let tokenBg = 'bg-white cursor-move';
                        if(isAnswered) {
                           tokenBg = isCorrect ? 'bg-green-200' : 'bg-red-200';
                        }
                        return (
                            <div
                                key={index}
                                draggable={!isAnswered}
                                onDragStart={() => handleDragStart(token)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(token)}
                                className={`px-4 py-2 rounded-lg shadow-sm border border-gray-300 ${tokenBg}`}
                            >
                                {token}
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    }
    
    const renderKana = () => {
        if(question.kana_question) {
            return (
                <div>
                    <div className="text-6xl font-bold text-center my-8 text-main">{question.kana_question}</div>
                    {renderChoices()}
                </div>
            );
        }
        if(question.romaji_answer) {
             return (
                <div>
                    <div className="text-5xl font-bold text-center my-8 text-main">{question.romaji_answer}</div>
                    {renderChoices()}
                </div>
            );
        }
        return null;
    }

    const renderContent = () => {
        switch (question.type) {
            case 'ordering': return renderOrdering();
            case 'kana': return renderKana();
            case 'cloze':
            case 'particle':
            case 'tf':
            case 'mc':
            default: return renderChoices();
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {question.passage && <p className="mb-4 p-4 bg-gray-100 rounded-lg text-gray-700">{question.passage}</p>}
            <h2 className="text-2xl md:text-3xl font-bold text-main mb-6 text-center">{question.stem}</h2>
            {renderContent()}
        </div>
    );
};
