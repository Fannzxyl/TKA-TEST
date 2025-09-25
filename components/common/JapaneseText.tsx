
import React from 'react';
import { useAppContext } from '../../context/AppContext';

interface JapaneseTextProps {
  jp: string;
  kana: string;
  className?: string;
}

// A simple utility to check if a character is likely a Kanji.
const isKanji = (char: string) => {
  const code = char.charCodeAt(0);
  return (code >= 0x4e00 && code <= 0x9faf) || (code >= 0x3400 && code <= 0x4dbf);
};

// This is a simplified furigana renderer. A robust solution is much more complex.
// It assumes `jp` and `kana` have a direct relationship for simple words.
const renderWithFurigana = (jp: string, kana: string) => {
    // If the strings are identical, no furigana needed.
    if (jp === kana) {
        return <>{jp}</>;
    }

    // This is a very basic heuristic. If the whole `jp` string contains kanji,
    // we wrap the whole thing. This works for single kanji words or simple compounds.
    if (Array.from(jp).some(isKanji)) {
        return (
            <ruby>
                {jp}
                <rt className="text-xs text-gray-500">{kana}</rt>
            </ruby>
        );
    }

    // Fallback if logic fails
    return <>{jp}</>;
};

export const JapaneseText: React.FC<JapaneseTextProps> = ({ jp, kana, className }) => {
  const { state } = useAppContext();
  const { kanaOnly, showKanji, showFurigana } = state.settings;

  if (kanaOnly && !showKanji) {
    return <span className={className}>{kana}</span>;
  }

  if (showKanji) {
    if (showFurigana) {
      return <span className={className}>{renderWithFurigana(jp, kana)}</span>;
    }
    return <span className={className}>{jp}</span>;
  }
  
  // Default to kana if settings are in a weird state
  return <span className={className}>{kana}</span>;
};
