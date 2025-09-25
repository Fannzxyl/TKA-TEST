
import React from 'react';
import { localParticles } from '../../data/db';
import { useAppContext } from '../../context/AppContext';
import { getRandomQuestions } from '../../utils/utils';
import { JapaneseText } from '../common/JapaneseText';

const ParticleCard: React.FC<{ particle: typeof localParticles[0] }> = ({ particle }) => (
    <div className="bg-card text-main p-6 rounded-2xl shadow-md border border-main/10 space-y-3">
        <div className="flex items-baseline space-x-3">
            <h3 className="text-4xl font-bold text-primary">{particle.kana}</h3>
            <span className="text-lg text-gray-500">{particle.romaji}</span>
        </div>
        <div>
            <h4 className="font-semibold mb-1">Fungsi:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
                {particle.fungsi.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
        </div>
        <div>
            <h4 className="font-semibold mb-1">Contoh:</h4>
            {particle.contoh.map((ex, i) => (
                <div key={i} className="text-sm mt-1">
                    <p className="text-accent"><JapaneseText jp={ex.jp} kana={ex.kana} /></p>
                    <p className="text-gray-500">{ex.romaji}</p>
                    <p className="text-gray-600">"{ex.id}"</p>
                </div>
            ))}
        </div>
    </div>
);

export const ParticlesPage: React.FC = () => {
    const { dispatch } = useAppContext();

    const startParticlePractice = () => {
        const questions = getRandomQuestions(5, 'particle');
        dispatch({ type: 'START_SESSION', payload: { questions, isTryout: false } });
    };

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-main">Partikel Dasar</h1>
                    <p className="text-gray-600 mt-1">Partikel adalah kata-kata kecil yang menunjukkan hubungan antar kata dalam kalimat.</p>
                </div>
                <button
                    onClick={startParticlePractice}
                    className="bg-primary text-white font-bold py-2 px-6 rounded-full shadow-lg hover:bg-blue-700 transition transform hover:scale-105 active:scale-98 whitespace-nowrap"
                >
                    Latih 5 Soal Partikel
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localParticles.map(p => <ParticleCard key={p.romaji} particle={p} />)}
            </div>
        </div>
    );
};
