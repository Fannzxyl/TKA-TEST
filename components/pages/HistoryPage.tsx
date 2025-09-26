
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { QUESTION_TYPES } from '../../constants';
import { calculateAccuracy, formatDuration } from '../../utils/utils';
import { CheckCircleIcon, XCircleIcon } from '../common/Icon';

const HistoryPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { history } = state;
    
    const overallAccuracy = calculateAccuracy(history);

    const accuracyByType = QUESTION_TYPES.map(type => {
        const typeHistory = history.filter(h => h.type === type.id);
        return {
            ...type,
            accuracy: calculateAccuracy(typeHistory),
            count: typeHistory.length
        };
    }).filter(t => t.count > 0);

    const resetProgress = () => {
        if (window.confirm("Apakah Anda yakin ingin menghapus semua riwayat latihan? Aksi ini tidak dapat dibatalkan.")) {
            dispatch({ type: 'RESET_PROGRESS' });
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Riwayat berhasil dihapus.', type: 'info' } });
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Riwayat Latihan</h1>
                <button onClick={resetProgress} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">
                    Reset Riwayat
                </button>
            </div>

            {history.length === 0 ? (
                <p className="text-center text-gray-500 py-10 bg-white dark:bg-gray-800 rounded-lg">Anda belum memiliki riwayat latihan. Mulai latihan untuk melihat progres Anda di sini.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold mb-2">Akurasi Keseluruhan</h3>
                            <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">{overallAccuracy}%</p>
                            <p className="text-gray-500">{history.length} soal dikerjakan</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold mb-2">Akurasi per Tipe Soal</h3>
                            <div className="space-y-2">
                                {accuracyByType.map(t => (
                                    <div key={t.id}>
                                        <div className="flex justify-between text-sm font-medium">
                                            <span>{t.name}</span>
                                            <span>{t.accuracy}% ({t.count} soal)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${t.accuracy}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <h3 className="text-xl font-semibold p-4 border-b dark:border-gray-700">Detail Jawaban Terakhir</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-4">Waktu</th>
                                        <th className="p-4">Tipe Soal</th>
                                        <th className="p-4">Hasil</th>
                                        <th className="p-4">Durasi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {[...history].reverse().slice(0, 50).map(h => (
                                        <tr key={h.ts}>
                                            <td className="p-4 text-sm">{new Date(h.ts).toLocaleString()}</td>
                                            <td className="p-4">{QUESTION_TYPES.find(qt => qt.id === h.type)?.name || h.type}</td>
                                            <td className="p-4">
                                                {h.correct ? 
                                                    <CheckCircleIcon className="w-6 h-6 text-green-500" /> :
                                                    <XCircleIcon className="w-6 h-6 text-red-500" />}
                                            </td>
                                            <td className="p-4">{formatDuration(h.durationMs)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default HistoryPage;
