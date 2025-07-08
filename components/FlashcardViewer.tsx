"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useFlashcards } from '@/contexts/FlashcardContext';
import { useSpeech } from '@/hooks/use-speech';
import { useSwipe } from '@/hooks/use-swipe';
import { Volume2, Check, X, Sun, Moon } from 'lucide-react';
import { ProgressCircle } from './ProgressCircle';

export default function FlashcardViewer() {
  const { filteredCards, currentIndex, next, prev, markLearned, setFilter, filter } = useFlashcards();
  const card = filteredCards[currentIndex];
  const { speak, isSupported, isSpeaking } = useSpeech();
  const [flipped, setFlipped] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const swipe = useSwipe({
    onSwipeLeft: () => prev(),
    onSwipeRight: () => { if (card) markLearned(card.id); next(); }
  });

  useEffect(() => setFlipped(false), [card]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { if (card) markLearned(card.id); next(); }
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Enter') setFlipped(f => !f);
      if (e.key === ' ') { e.preventDefault(); if (card && isSupported) speak(card.term); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [card, next, prev, markLearned, isSupported, speak]);

  if (!card) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  return (
      <div
          className={`min-h-screen flex items-center justify-center transition-colors ${
              darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700\n'
          }`}
          {...swipe}
      >
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <button onClick={() => setDarkMode(d => !d)} aria-label="Toggle theme" className="p-2 rounded-full bg-white/20">
            {darkMode ? <Sun className="text-yellow-300" /> : <Moon className="text-gray-800" />}
          </button>
        </div>

        <div className="w-full max-w-md p-1 rounded-xl bg-transparent">
          <div className={`rounded-xl p-4 transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>

            {/* Filters */}
            <div className="flex space-x-2 mb-4">
              {[
                { val: 'all', label: 'Tümü' },
                { val: 'learned', label: 'Öğrendiklerim' },
                { val: 'toLearn', label: 'Öğrenmediklerim' }
              ].map(({ val, label }) => (
                  <button
                      key={val}
                      onClick={() => setFilter(val as any)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                          filter === val
                              ? 'bg-purple-600 text-white'
                              : darkMode
                                  ? 'bg-gray-700 text-gray-200'
                                  : 'bg-gray-200 text-gray-700'
                      }`}
                      aria-label={label}
                  >
                    {label}
                  </button>
              ))}
            </div>

            {/* Card */}
            <div style={{ perspective: 1000 }} className="relative h-80 mb-4">
              <motion.div
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  className={`relative w-full h-full rounded-xl shadow-xl transition-transform ${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                  onClick={() => setFlipped(f => !f)}
                  role="button"
                  aria-label="Flip flashcard"
              >
                {/* Front */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                  <h1 className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {card.term}
                  </h1>
                  {card.synonym && <p className="italic text-purple-600 mt-1">{card.synonym}</p>}
                  <p className={`text-lg font-medium mt-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {card.translation}
                  </p>
                </div>

                {/* Back */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  {card.example && <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>{card.example}</p>}
                  {card.exampleTranslation && (
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-2`}>
                        {card.exampleTranslation}
                      </p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <button onClick={() => prev()} className="p-3 rounded-full transition-colors" aria-label="Yanlış">
                <X className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} w-5 h-5`} />
              </button>
              <button onClick={() => isSupported && speak(card.term)} className="relative p-4" aria-label={`Ses: ${card.term}`}>
                <ProgressCircle progress={(currentIndex + 1) / filteredCards.length} playing={isSpeaking} />
                <Volume2 className={`absolute inset-0 m-auto w-5 h-5 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} />
              </button>
              <button onClick={() => { markLearned(card.id); next(); }} className="p-3 rounded-full transition-colors" aria-label="Doğru">
                <Check className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} w-5 h-5`} />
              </button>
            </div>

            {/* Progress text */}
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center text-xs mt-2`}>
              {currentIndex + 1} / {filteredCards.length}
            </p>
          </div>
        </div>
      </div>
  );
}
