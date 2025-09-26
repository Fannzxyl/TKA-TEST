
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Settings } from '../../types';
import { testApiKey } from '../../services/geminiService';

const SettingsPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [settings, setSettings] = useState<Settings>(state.settings);
    const [apiKeyStatus, setApiKeyStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');

    useEffect(() => {
        setSettings(state.settings);
        if (state.settings.apiKey) {
            setApiKeyStatus('idle');
        }
    }, [state.settings]);

    const handleSave = () => {
        dispatch({ type: 'SAVE_SETTINGS', payload: settings });
        dispatch({ type: 'SHOW_TOAST', payload: { message: 'Pengaturan berhasil disimpan!', type: 'success' } });
    };

    const handleApiKeyTest = async () => {
        if (!settings.apiKey) {
            setApiKeyStatus('invalid');
            return;
        }
        setApiKeyStatus('testing');
        const isValid = await testApiKey(settings.apiKey);
        setApiKeyStatus(isValid ? 'valid' : 'invalid');
        if (isValid) {
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'API Key valid!', type: 'success' } });
        } else {
             dispatch({ type: 'SHOW_TOAST', payload: { message: 'API Key tidak valid.', type: 'error' } });
        }
    };

    const handleCheckboxChange = (key: keyof Settings, value: boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Pengaturan</h1>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
                <h2 className="text-xl font-semibold border-b pb-2 dark:border-gray-600">Tampilan Latihan</h2>
                
                <div className="flex items-center justify-between">
                    <label htmlFor="showKanji" className="font-medium">Tampilkan Kanji</label>
                    <input type="checkbox" id="showKanji" checked={settings.showKanji} onChange={e => handleCheckboxChange('showKanji', e.target.checked)} className="form-checkbox h-6 w-6 text-indigo-600 rounded" />
                </div>
                
                <div className={`flex items-center justify-between ${!settings.showKanji ? 'opacity-50' : ''}`}>
                    <label htmlFor="showFurigana" className="font-medium">Tampilkan Furigana</label>
                    <input type="checkbox" id="showFurigana" disabled={!settings.showKanji} checked={settings.showFurigana} onChange={e => handleCheckboxChange('showFurigana', e.target.checked)} className="form-checkbox h-6 w-6 text-indigo-600 rounded" />
                </div>
                
                <h2 className="text-xl font-semibold border-b pb-2 dark:border-gray-600">Lainnya</h2>
                <div className="flex items-center justify-between">
                    <label htmlFor="sound" className="font-medium">Efek Suara</label>
                    <input type="checkbox" id="sound" checked={settings.sound} onChange={e => handleCheckboxChange('sound', e.target.checked)} className="form-checkbox h-6 w-6 text-indigo-600 rounded" />
                </div>
                 <div className="flex items-center justify-between">
                    <label htmlFor="highContrast" className="font-medium">Kontras Tinggi</label>
                    <input type="checkbox" id="highContrast" checked={settings.highContrast} onChange={e => handleCheckboxChange('highContrast', e.target.checked)} className="form-checkbox h-6 w-6 text-indigo-600 rounded" />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
                 <h2 className="text-xl font-semibold border-b pb-2 dark:border-gray-600">Integrasi Gemini AI</h2>
                 <p className="text-sm text-gray-600 dark:text-gray-400">Dapatkan soal latihan tak terbatas yang dibuat oleh AI. Fitur ini masih dalam tahap eksperimen.</p>
                 <div>
                    <label htmlFor="apiKey" className="block font-medium mb-1">Google AI API Key</label>
                    <div className="flex gap-2">
                        <input 
                            type="password" 
                            id="apiKey" 
                            placeholder="Masukkan API Key Anda" 
                            value={settings.apiKey || ''} 
                            onChange={e => setSettings(s => ({ ...s, apiKey: e.target.value }))}
                            className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        />
                        <button onClick={handleApiKeyTest} disabled={apiKeyStatus === 'testing'} className="bg-gray-200 dark:bg-gray-600 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50">
                            {apiKeyStatus === 'testing' ? 'Menguji...' : 'Uji'}
                        </button>
                    </div>
                    {apiKeyStatus === 'valid' && <p className="text-green-600 text-sm mt-1">API Key valid.</p>}
                    {apiKeyStatus === 'invalid' && <p className="text-red-600 text-sm mt-1">API Key tidak valid atau gagal diuji.</p>}
                 </div>
            </div>

            <div className="flex justify-end">
                <button onClick={handleSave} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700">
                    Simpan Pengaturan
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
