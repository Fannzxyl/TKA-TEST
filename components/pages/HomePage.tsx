
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { getRandomQuestions, formatDuration } from '../../utils/utils';
import { localParticles } from '../../data/db';

const StatCard: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
    <div className="bg-card text-main p-4 rounded-xl shadow-md border border-main/10 text-center">
        <div className="text-2xl font-bold text-primary">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
    </div>
);

export const HomePage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    
    const today = new Date().toDateString();
    const todayHistory = state.history.filter(h => new Date(h.ts).toDateString() === today);
    const correctToday = todayHistory.filter(h => h.correct).length;
    const accuracy = todayHistory.length > 0 ? Math.round((correctToday / todayHistory.length) * 100) : 0;
    const totalTimeMs = todayHistory.reduce((acc, h) => acc + h.durationMs, 0);
    const avgTime = todayHistory.length > 0 ? totalTimeMs / todayHistory.length : 0;

    const tipOfTheDay = React.useMemo(() => {
        const particle = localParticles[new Date().getDate() % localParticles.length];
        return `Tips: Partikel 「${particle.kana}」 (${particle.romaji}) digunakan untuk ${particle.fungsi[0]}.`;
    }, []);

    const startQuickPractice = () => {
        const questions = getRandomQuestions(5); // Mix of types
        dispatch({ type: 'START_SESSION', payload: { questions, isTryout: false } });
    };

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-main">Selamat Datang!</h1>
            
            <div className="bg-card text-main p-6 rounded-2xl shadow-md border border-main/10">
                <h2 className="text-xl font-bold mb-4">Progress Hari Ini</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Soal Dikerjakan" value={todayHistory.length} />
                    <StatCard label="Akurasi" value={`${accuracy}%`} />
                    <StatCard label="Total Waktu" value={formatDuration(totalTimeMs)} />
                    <StatCard label="Rata-rata/soal" value={formatDuration(avgTime)} />
                </div>
            </div>

            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg" role="alert">
                <p className="font-bold">Tip of the day</p>
                <p>{tipOfTheDay}</p>
            </div>

            <div className="text-center">
                <button
                    onClick={startQuickPractice}
                    className="bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition transform hover:scale-105 active:scale-98"
                >
                    Mulai 5 Soal Cepat
                </button>
            </div>
        </div>
    );
};
