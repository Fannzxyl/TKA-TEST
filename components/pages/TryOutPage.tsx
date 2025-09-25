import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { getRandomQuestions } from '../../utils/utils';
import { AcademicCapIcon } from '../common/Icon';

export const TryOutPage: React.FC = () => {
    const { dispatch } = useAppContext();
    const [timerEnabled, setTimerEnabled] = useState(true);

    const startTryOut = () => {
        const questions = getRandomQuestions(10);
        dispatch({ type: 'START_SESSION', payload: { questions, isTryout: true } });
        // Timer logic will be handled inside the session view
    };

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in max-w-2xl mx-auto text-center">
            {/* Fix: Imported AcademicCapIcon to resolve component not found error. */}
            <AcademicCapIcon className="w-16 h-16 mx-auto text-primary" />
            <h1 className="text-3xl font-bold text-main">Try Out TKA</h1>
            <p className="text-gray-600">
                Uji kemampuanmu dengan 10 soal campuran dalam batas waktu 10 menit.
                Ini akan mensimulasikan kondisi ujian yang sebenarnya.
            </p>

            <div className="bg-card text-main p-6 rounded-2xl shadow-md border border-main/10 inline-block">
                <div className="flex items-center justify-center space-x-3">
                    <input
                        type="checkbox"
                        id="timer-toggle"
                        checked={timerEnabled}
                        onChange={() => setTimerEnabled(!timerEnabled)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="timer-toggle" className="font-medium">Gunakan Timer 10 Menit</label>
                </div>
                {/* Note: Timer enabled state is just for UI, actual timer logic is part of tryout session */}
            </div>

            <div className="mt-8">
                <button
                    onClick={startTryOut}
                    className="w-full max-w-sm bg-accent text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-green-700 transition transform hover:scale-105 active:scale-98"
                >
                    Mulai Try Out
                </button>
            </div>
        </div>
    );
};