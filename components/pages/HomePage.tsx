
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { calculateAccuracy, formatDuration, getFrequentlyWrongVocab } from '../../utils/utils';
import { localVocab } from '../../data/db';
import { JapaneseText } from '../common/JapaneseText';

const HomePage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { history } = state;

    const accuracy = calculateAccuracy(history);
    const totalQuestions = history.length;
    const avgTime = totalQuestions > 0 ? history.reduce((acc, h) => acc + h.durationMs, 0) / totalQuestions : 0;
    const frequentlyWrong = getFrequentlyWrongVocab(history, localVocab, 5);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Selamat Datang!</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Siap untuk belajar Bahasa Jepang? Mari kita mulai!</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-2">Akurasi Latihan</h3>
                    <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{accuracy}%</p>
                    <p className="text-gray-500">{totalQuestions} soal dikerjakan</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-2">Waktu Rata-rata</h3>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400">{formatDuration(avgTime)}</p>
                    <p className="text-gray-500">per soal</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-2">Favorit</h3>
                    <p className="text-4xl font-bold text-yellow-500">{state.favorites.length}</p>
                    <p className="text-gray-500">kosakata ditandai</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <button onClick={() => dispatch({type: 'SET_TAB', payload: 'latihan'})} className="flex-1 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                    Mulai Latihan
                </button>
                <button onClick={() => dispatch({type: 'SET_TAB', payload: 'tryout'})} className="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
                    Coba Try Out
                </button>
            </div>

            {frequentlyWrong.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-3">Kosakata yang Sering Salah</h3>
                    <ul className="space-y-2">
                        {frequentlyWrong.map(vocab => (
                            <li key={vocab.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                <JapaneseText jp={vocab.jp} kana={vocab.kana} className="font-medium" />
                                <span className="text-sm text-gray-500">{vocab.id_meaning}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default HomePage;
