
import React from 'react';
import { Language } from '../types';

interface Props {
  current: Language;
  onToggle: (lang: Language) => void;
}

export const LanguageToggle: React.FC<Props> = ({ current, onToggle }) => {
  return (
    <div className="flex bg-gray-200 p-1 rounded-full w-fit">
      <button
        onClick={() => onToggle('en')}
        className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
          current === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onToggle('bn')}
        className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
          current === 'bn' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
        }`}
      >
        বাংলা
      </button>
    </div>
  );
};
