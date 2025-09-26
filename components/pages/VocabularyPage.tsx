
import React, { useState, useMemo } from 'react';
import { localVocab } from '../../data/db';
import { VOCAB_THEMES } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { JapaneseText } from '../common/JapaneseText';
import { VolumeUpIcon, StarIcon } from '../common/Icon';
import { speak } from '../../utils/utils';

const VocabularyPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { settings, favorites } = state;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('Semua');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    const filteredVocab = useMemo(() => {
        return localVocab.filter(v => {
            const matchesTheme = selectedTheme === 'Semua' || v.tema.includes(selectedTheme);
            const matchesSearch = searchTerm === '' ||
                v.romaji.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.id_meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.kana.includes(searchTerm) ||
                v.jp.includes(searchTerm);
            const matchesFavorites = !showFavoritesOnly || favorites.includes(v.id);
            return matchesTheme && matchesSearch && matchesFavorites;
        });
    }, [searchTerm, selectedTheme, showFavoritesOnly, favorites]);

    const toggleFavorite = (vocabId: string) => {
        dispatch({ type: 'TOGGLE_FAVORITE', payload: vocabId });
    };

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold">Daftar Kosakata</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <input
                    type="text"
                    placeholder="Cari romaji, arti, kana..."
                    className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select
                    className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                    value={selectedTheme}
                    onChange={e => setSelectedTheme(e.target.value)}
                >
                    <option value="Semua">Semua Tema</option>
                    {VOCAB_THEMES.map(theme => <option key={theme} value={theme}>{theme}</option>)}
                </select>
                <label className="flex items-center justify-center space-x-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md cursor-pointer">
                    <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-indigo-600"
                        checked={showFavoritesOnly}
                        onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    />
                    <span>Tampilkan Favorit Saja</span>
                </label>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-4">Kosakata</th>
                            <th className="p-4">Arti</th>
                            <th className="p-4">Tipe</th>
                            <th className="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {filteredVocab.map(v => (
                            <tr key={v.id}>
                                <td className="p-4">
                                    <JapaneseText jp={v.jp} kana={v.kana} className="text-lg font-medium" />
                                    <p className="text-sm text-gray-500">{v.romaji}</p>
                                </td>
                                <td className="p-4">{v.id_meaning}</td>
                                <td className="p-4 capitalize">{v.tipe}</td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        {settings.sound && (
                                            <button onClick={() => speak(v.kana)} className="text-gray-500 hover:text-indigo-600 p-2 rounded-full">
                                                <VolumeUpIcon className="w-6 h-6" />
                                            </button>
                                        )}
                                        <button onClick={() => toggleFavorite(v.id)} className={`p-2 rounded-full ${favorites.includes(v.id) ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}>
                                            <StarIcon className="w-6 h-6" filled={favorites.includes(v.id)} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredVocab.length === 0 && <p className="p-4 text-center text-gray-500">Tidak ada kosakata yang ditemukan.</p>}
            </div>
        </div>
    );
};

export default VocabularyPage;
