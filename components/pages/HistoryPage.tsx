
import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { calculateAccuracy, formatDuration, getFrequentlyWrongVocab } from '../../utils/utils';
import { HistoryEntry, Vocab } from '../../types';
import { localVocab } from '../../data/db';
import { Modal } from '../common/Modal';
import { JapaneseText } from '../common/JapaneseText';

const StatCard: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
    <div className="bg-card text-main p-4 rounded-xl shadow-md border border-main/10 text-center">
        <div className="text-2xl font-bold text-primary">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
    </div>
);

const WrongVocabList: React.FC<{ vocabList: Vocab[] }> = ({ vocabList }) => {
    if (vocabList.length === 0) {
        return <p className="text-gray-500 text-center col-span-full">Belum ada data.</p>;
    }
    return (
        <div className="space-y-3">
            {vocabList.map(v => (
                <div key={v.id} className="bg-card text-main p-3 rounded-lg flex justify-between items-center border border-main/10">
                    <div>
                        <JapaneseText jp={v.jp} kana={v.kana} className="font-semibold" />
                        <p className="text-sm text-gray-500">{v.id_meaning}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};


export const HistoryPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { history } = state;
    const [isResetModalOpen, setResetModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const totalAccuracy = calculateAccuracy(history);
    const totalTime = history.reduce((sum, h) => sum + h.durationMs, 0);
    const avgTime = history.length > 0 ? totalTime / history.length : 0;
    const frequentlyWrong = getFrequentlyWrongVocab(history, localVocab, 10);

    const handleReset = () => {
        dispatch({ type: 'RESET_PROGRESS' });
        dispatch({ type: 'SHOW_TOAST', payload: { message: 'Progress berhasil direset', type: 'success' } });
        setResetModalOpen(false);
    };

    const handleExport = () => {
        const data = JSON.stringify({ version: 1, favorites: state.favorites, history: state.history });
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tka_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        dispatch({ type: 'SHOW_TOAST', payload: { message: 'Data diekspor!', type: 'info' } });
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result as string;
                const data = JSON.parse(result);
                if (data.version === 1 && Array.isArray(data.history) && Array.isArray(data.favorites)) {
                    dispatch({ type: 'IMPORT_DATA', payload: { history: data.history, favorites: data.favorites } });
                    dispatch({ type: 'SHOW_TOAST', payload: { message: 'Data berhasil diimpor', type: 'success' } });
                } else {
                    throw new Error('Skema data tidak valid');
                }
            } catch (error) {
                dispatch({ type: 'SHOW_TOAST', payload: { message: 'Gagal mengimpor data. File tidak valid.', type: 'error' } });
            }
        };
        reader.readAsText(file);
    };


    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-main">Riwayat & Statistik</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Soal" value={history.length} />
                <StatCard label="Akurasi Total" value={`${totalAccuracy}%`} />
                <StatCard label="Total Belajar" value={formatDuration(totalTime)} />
                <StatCard label="Rata-rata/Soal" value={formatDuration(avgTime)} />
            </div>

            <div className="bg-card text-main p-6 rounded-2xl shadow-md border border-main/10">
                <h2 className="text-xl font-bold mb-4">Kosakata Sering Salah</h2>
                <WrongVocabList vocabList={frequentlyWrong} />
            </div>
            
            <div className="bg-card text-main p-6 rounded-2xl shadow-md border border-main/10 space-y-4">
                <h2 className="text-xl font-bold">Manajemen Data</h2>
                <div className="flex flex-wrap gap-4">
                    <button onClick={handleExport} className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition">
                        Export JSON
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition">
                        Import JSON
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
                     <button onClick={() => setResetModalOpen(true)} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition">
                        Reset Progress
                    </button>
                </div>
            </div>

            <Modal
                isOpen={isResetModalOpen}
                onClose={() => setResetModalOpen(false)}
                onConfirm={handleReset}
                title="Reset Progres"
                confirmText="Ya, Reset"
            >
                <p>Apakah Anda yakin ingin menghapus semua riwayat latihan dan daftar favorit? Tindakan ini tidak dapat diurungkan.</p>
            </Modal>

        </div>
    );
};
