
import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { TABS } from './constants';
import HomePage from './components/pages/HomePage';
import ParticlesPage from './components/pages/ParticlesPage';
import VocabularyPage from './components/pages/VocabularyPage';
import PracticePage from './components/pages/PracticePage';
import TryOutPage from './components/pages/TryOutPage';
import HistoryPage from './components/pages/HistoryPage';
import SettingsPage from './components/pages/SettingsPage';
import { Toast } from './components/common/Toast';
import { HomeIcon, BookOpenIcon, SparklesIcon, BeakerIcon, AcademicCapIcon, ChartBarIcon, CogIcon } from './components/common/Icon';

const tabIcons: { [key: string]: React.FC<{className?: string}> } = {
  beranda: HomeIcon,
  partikel: SparklesIcon,
  kosakata: BookOpenIcon,
  latihan: BeakerIcon,
  tryout: AcademicCapIcon,
  riwayat: ChartBarIcon,
  pengaturan: CogIcon,
};


const App: React.FC = () => {
  const { state, dispatch } = useAppContext();

  const renderTab = () => {
    switch (state.tab) {
      case 'beranda':
        return <HomePage />;
      case 'partikel':
        return <ParticlesPage />;
      case 'kosakata':
        return <VocabularyPage />;
      case 'latihan':
        return <PracticePage />;
      case 'tryout':
        return <TryOutPage />;
      case 'riwayat':
        return <HistoryPage />;
      case 'pengaturan':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <nav className="w-full md:w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">TKA Jepang</h1>
        </div>
        <ul>
          {TABS.map(tab => {
            const Icon = tabIcons[tab.id];
            return (
              <li key={tab.id}>
                <button
                  onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
                  className={`flex items-center w-full text-left p-4 text-sm font-medium transition-colors duration-200 ${
                    state.tab === tab.id
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-r-4 border-indigo-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5 mr-3" />}
                  {tab.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        {renderTab()}
      </main>
      <Toast />
    </div>
  );
};

// This is the component that will be imported in index.tsx
const AppWrapper: React.FC = () => {
    return (
        <AppProvider>
            <App />
        </AppProvider>
    )
}

export default AppWrapper;
