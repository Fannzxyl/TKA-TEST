
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Settings } from '../../types';
import { testApiKey } from '../../services/geminiService';

const Toggle: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void; description?: string }> = ({ label, enabled, onChange, description }) => (
    <div className="flex items-center justify-between py-3">
        <div>
            <label className="font-medium text-main">{label}</label>
            {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-primary' : 'bg-gray-200'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

export const SettingsPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [apiKeyInput, setApiKeyInput] = useState(state.settings.apiKey || '');
    const [isTestingKey, setIsTestingKey] = useState(false);

    const handleSettingChange = <K extends keyof Settings,>(key: K, value: Settings[K]) => {
        dispatch({ type: 'SAVE_SETTINGS', payload: { [key]: value } });
    };

    const handleApiKeySave = () => {
        handleSettingChange('apiKey', apiKeyInput);
        dispatch({ type: 'SHOW_TOAST', payload: { message: 'API Key disimpan', type: 'success' } });
    };
    
    const handleTestApiKey = async () => {
        setIsTestingKey(true);
        const isValid = await testApiKey(apiKeyInput);
        if (isValid) {
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'API Key valid dan berfungsi!', type: 'success' } });
        } else {
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'API Key tidak valid atau gagal terhubung.', type: 'error' } });
        }
        setIsTestingKey(false);
    };

    return (
        <div className="p-4 md:p-6 space-y-8 max-w-2xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-center text-main">Pengaturan</h1>

            <div className="bg-card text-main p-6 rounded-2xl shadow-md border border-main/10 divide-y divide-gray-200">
                <h2 className="text-xl font-bold mb-2">Tampilan Teks Jepang</h2>
                <Toggle
                    label="Mode Kana-Saja"
                    description="Tampilkan semua teks dalam Hiragana/Katakana."
                    enabled={state.settings.kanaOnly && !state.settings.showKanji}
                    onChange={(e) => {
                        handleSettingChange('kanaOnly', e);
                        if (e) handleSettingChange('showKanji', false);
                    }}
                />
                <Toggle
                    label="Tampilkan Kanji"
                    description="Tampilkan kanji jika tersedia."
                    enabled={state.settings.showKanji}
                    onChange={(e) => {
                        handleSettingChange('showKanji', e);
                        if(e) handleSettingChange('kanaOnly', false);
                    }}
                />
                <Toggle
                    label="Tampilkan Furigana"
                    description="Tampilkan cara baca di atas kanji (membutuhkan 'Tampilkan Kanji' aktif)."
                    enabled={state.settings.showFurigana && state.settings.showKanji}
                    onChange={(e) => handleSettingChange('showFurigana', e)}
                />
            </div>

            <div className="bg-card text-main p-6 rounded-2xl shadow-md border border-main/10 divide-y divide-gray-200">
                 <h2 className="text-xl font-bold mb-2">Lainnya</h2>
                 <Toggle
                    label="Mode Kontras Tinggi"
                    description="Gunakan tema warna dengan kontras lebih tinggi."
                    enabled={state.settings.highContrast}
                    onChange={(e) => handleSettingChange('highContrast', e)}
                />
            </div>

            <div className="bg-card text-main p-6 rounded-2xl shadow-md border border-main/10 space-y-4">
                <h2 className="text-xl font-bold">Integrasi Gemini</h2>
                 <p className="text-sm text-gray-500">Masukkan API Key Google Gemini Anda untuk mendapatkan soal-soal yang dibuat secara dinamis. Kunci disimpan di perangkat Anda dan tidak dikirim ke server kami.</p>
                <div>
                    <label htmlFor="api-key" className="block font-medium mb-1">Gemini API Key</label>
                    <input
                        id="api-key"
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Masukkan API Key..."
                    />
                </div>
                <div className="flex gap-4">
                    <button onClick={handleApiKeySave} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                        Simpan
                    </button>
                    <button 
                        onClick={handleTestApiKey} 
                        disabled={isTestingKey || !apiKeyInput}
                        className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition disabled:bg-gray-300"
                    >
                        {isTestingKey ? 'Menguji...' : 'Test API'}
                    </button>
                </div>
            </div>
        </div>
    );
};
