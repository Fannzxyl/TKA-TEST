import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { getRandomQuestions } from '../../utils/utils';
import { generateQuestionFromGemini } from '../../services/geminiService';
import { Question, QuestionType } from '../../types';
import { QUESTION_TYPES } from '../../constants';

export const PracticePage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [type, setType] = useState<QuestionType | ''>('');
    const [source, setSource] = useState<'Lokal' | 'Gemini' | 'Campuran'>('Lokal');
    const [count, setCount] = useState<5 | 10>(5);
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = async () => {
        if (!type) {
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Pilih jenis soal terlebih dahulu', type: 'error' } });
            return;
        }

        setIsLoading(true);
        // Fix: Moved `questions` declaration out of the try block to make it accessible in the catch block.
        let questions: Question[] = [];
        try {
            if (source === 'Lokal' || source === 'Campuran') {
                const localCount = source === 'Campuran' ? Math.ceil(count / 2) : count;
                questions = getRandomQuestions(localCount, type);
            }
            
            if ((source === 'Gemini' || source === 'Campuran') && state.settings.apiKey) {
                 const geminiCount = source === 'Campuran' ? Math.floor(count / 2) : count;
                 if (geminiCount > 0) {
                     dispatch({ type: 'SHOW_TOAST', payload: { message: `Menghubungi Gemini untuk ${geminiCount} soal...`, type: 'info' } });
                     const geminiPromises = Array.from({ length: geminiCount }, () =>
                        generateQuestionFromGemini(state.settings.apiKey!, type)
                     );
                     const geminiResults = await Promise.all(geminiPromises);
                     questions = [...questions, ...geminiResults.filter((q): q is Question => q !== null)];
                 }
            } else if (source === 'Gemini' && !state.settings.apiKey) {
                throw new Error("API Key Gemini belum diatur di Pengaturan.");
            }

            if (questions.length === 0) {
                throw new Error("Tidak berhasil mendapatkan soal. Coba ganti sumber atau periksa koneksi.");
            }

            dispatch({ type: 'START_SESSION', payload: { questions, isTryout: false } });

        } catch (error) {
            const message = error instanceof Error ? error.message : "Terjadi kesalahan";
            dispatch({ type: 'SHOW_TOAST', payload: { message, type: 'error' } });
            // Fallback to local
            if (source === 'Gemini' || questions.length === 0) {
                const fallbackQuestions = getRandomQuestions(count, type);
                dispatch({ type: 'START_SESSION', payload: { questions: fallbackQuestions, isTryout: false } });
                dispatch({ type: 'SHOW_TOAST', payload: { message: "Menggunakan soal lokal sebagai gantinya.", type: 'info' } });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-center text-main">Mulai Latihan</h1>
            <div className="bg-card text-main p-6 rounded-2xl shadow-md border border-main/10 space-y-6">
                
                <div>
                    <label className="block font-medium mb-2">Pilih Jenis Soal</label>
                    <select value={type} onChange={(e) => setType(e.target.value as QuestionType)} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
                        <option value="" disabled>-- Pilih Jenis --</option>
                        {QUESTION_TYPES.map(qt => <option key={qt.id} value={qt.id}>{qt.name}</option>)}
                    </select>
                </div>
                
                <div>
                    <label className="block font-medium mb-2">Pilih Sumber Soal</label>
                    <div className="flex space-x-2 rounded-lg bg-gray-200 p-1">
                        {(['Lokal', 'Gemini', 'Campuran'] as const).map(s => (
                            <button key={s} onClick={() => setSource(s)} className={`w-full py-2 rounded-md font-semibold transition ${source === s ? 'bg-white shadow' : 'text-gray-600'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                     {source !== 'Lokal' && !state.settings.apiKey && <p className="text-xs text-yellow-600 mt-2">API Key Gemini diperlukan untuk sumber ini. Atur di halaman Pengaturan.</p>}
                </div>
                
                <div>
                    <label className="block font-medium mb-2">Jumlah Soal</label>
                     <div className="flex space-x-2 rounded-lg bg-gray-200 p-1">
                        {[5, 10].map(n => (
                            <button key={n} onClick={() => setCount(n as 5 | 10)} className={`w-full py-2 rounded-md font-semibold transition ${count === n ? 'bg-white shadow' : 'text-gray-600'}`}>
                                {n} Soal
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleStart} 
                    disabled={isLoading}
                    className="w-full bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition transform hover:scale-105 active:scale-98 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Memuat Soal...' : 'Mulai'}
                </button>
            </div>
        </div>
    );
};