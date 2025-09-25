import React, { useState, useMemo } from 'react';
import { localVocab } from '../../data/db';
import { TipeVocab } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { speak, getRandomQuestions } from '../../utils/utils';
import { VolumeUpIcon, StarIcon } from '../common/Icon';
import { JapaneseText } from '../common/JapaneseText';
import { VOCAB_THEMES } from '../../constants';

const VocabCard: React.FC<{ vocab: typeof localVocab[0] }> = ({ vocab }) => {
    const { state, dispatch } = useAppContext();
    const isFavorite = state.favorites.includes(vocab.id);

    return (
        <div className="bg-card text-main p-4 rounded-2xl shadow-md border border-main/10 flex flex-col h-full">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <JapaneseText jp={vocab.jp} kana={vocab.kana} className="text-2xl font-bold" />
                        <p className="text-gray-500">{vocab.romaji}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => speak(vocab.jp)} className="text-gray-400 hover:text-primary transition active:scale-90 p-1">
                            <VolumeUpIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', payload: vocab.id })} className={`transition active:scale-90 p-1 ${isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}>
                            <StarIcon className="w-6 h-6" filled={isFavorite} />
                        </button>
                    </div>
                </div>
                <p className="mt-2 text-lg">{vocab.id_meaning}</p>
            </div>
            <div className="text-xs text-gray-400 mt-auto pt-3">
                <span>{vocab.tipe}</span> &bull; <span>{vocab.tema.join(', ')}</span>
            </div>
        </div>
    );
};

export const VocabularyPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TipeVocab>('kata benda');
    const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

    const filteredVocab = useMemo(() => {
        return localVocab.filter(v => 
            v.tipe === activeTab &&
            (selectedThemes.length === 0 || selectedThemes.some(theme => v.tema.includes(theme)))
        );
    }, [activeTab, selectedThemes]);
    
    const toggleTheme = (theme: string) => {
        setSelectedThemes(prev => 
            prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
        );
    };

    const tabs: { id: TipeVocab, label: string }[] = [
        { id: "kata benda", label: "Kata Benda" },
        { id: "kata kerja", label: "Kata Kerja" },
        { id: "kata sifat", label: "Kata Sifat" },
    ];

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-main">Kosakata Inti</h1>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {VOCAB_THEMES.map(theme => (
                        <button 
                            key={theme}
                            onClick={() => toggleTheme(theme)}
                            className={`px-3 py-1 text-sm font-medium rounded-full transition border ${
                                selectedThemes.includes(theme) 
                                ? 'bg-primary text-white border-primary' 
                                : 'bg-card text-main border-gray-300 hover:bg-primary/10'
                            }`}
                        >
                            {theme}
                        </button>
                    ))}
                    {selectedThemes.length > 0 && (
                         <button onClick={() => setSelectedThemes([])} className="text-sm text-blue-600 hover:underline">Reset</button>
                    )}
                </div>
            </div>

            {filteredVocab.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredVocab.map(v => <VocabCard key={v.id} vocab={v} />)}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    <p>Tidak ada kosakata yang cocok dengan filter.</p>
                </div>
            )}
        </div>
    );
};