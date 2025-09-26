import React, { useState } from 'react';
import { localParticles } from '../../data/db';
import { JapaneseText } from '../common/JapaneseText';
import { speak } from '../../utils/utils';
import { VolumeUpIcon } from '../common/Icon';
import { useAppContext } from '../../context/AppContext';
import { Particle } from '../../types';

const ParticleCard: React.FC<{ particle: Particle; onClick: () => void }> = ({ particle, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="w-full text-left p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
            data-aos="fade-up"
        >
            <div className="flex items-baseline space-x-3">
                <h2 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{particle.kana}</h2>
                <p className="text-xl text-gray-500">{particle.romaji}</p>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400 truncate">{particle.fungsi[0]}</p>
        </button>
    );
};

const ParticleDetailModal: React.FC<{ particle: Particle; onClose: () => void }> = ({ particle, onClose }) => {
    const { state } = useAppContext();
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="particle-title"
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 m-4 max-w-lg w-full max-h-[90vh] overflow-y-auto" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 id="particle-title" className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">{particle.kana}</h2>
                        <p className="text-2xl text-gray-500">{particle.romaji}</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-200 text-3xl font-light leading-none"
                        aria-label="Tutup modal"
                    >&times;</button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2 border-b pb-1 dark:border-gray-600">Fungsi</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                            {particle.fungsi.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-2 border-b pb-1 dark:border-gray-600">Contoh Penggunaan</h3>
                        <ul className="space-y-4">
                            {particle.contoh.map((c, i) => (
                                <li key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                    <div className="flex items-center justify-between">
                                        <JapaneseText jp={c.jp} kana={c.kana} className="text-lg" />
                                        {state.settings.sound && (
                                            <button onClick={() => speak(c.kana)} className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-full">
                                                <VolumeUpIcon className="w-6 h-6" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{c.romaji}</p>
                                    <p className="text-gray-700 dark:text-gray-300 mt-2">"{c.id}"</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ParticlesPage: React.FC = () => {
    const [selectedParticle, setSelectedParticle] = useState<Particle | null>(null);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Daftar Partikel</h1>
            <p className="text-gray-600 dark:text-gray-400">Partikel adalah kata-kata pendek yang mengikuti kata benda, kata kerja, sifat, atau kalimat untuk menunjukkan hubungan di antara kata-kata tersebut. Klik kartu untuk detail.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {localParticles.map((particle, index) => (
                    <ParticleCard 
                        key={index} 
                        particle={particle} 
                        onClick={() => setSelectedParticle(particle)} 
                    />
                ))}
            </div>

            {selectedParticle && (
                <ParticleDetailModal 
                    particle={selectedParticle} 
                    onClose={() => setSelectedParticle(null)} 
                />
            )}
        </div>
    );
};

export default ParticlesPage;