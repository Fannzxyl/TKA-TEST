
import React, { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CheckCircleIcon, XCircleIcon } from './Icon';

export const Toast: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { message, type, visible } = state.toast;

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        dispatch({ type: 'HIDE_TOAST' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, dispatch]);

  if (!visible) return null;

  const baseClasses = "fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg text-white max-w-sm z-50 transition-transform transform";
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div
      className={`${baseClasses} ${typeClasses[type]} animate-fade-in-up`}
      role="alert"
      aria-live="assertive"
    >
      {type === 'success' && <CheckCircleIcon className="w-6 h-6 mr-3" />}
      {type === 'error' && <XCircleIcon className="w-6 h-6 mr-3" />}
      <span>{message}</span>
    </div>
  );
};
