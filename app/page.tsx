"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react"
import { useSpeech } from "@/hooks/use-speech"
import { useSwipe } from "@/hooks/use-swipe"

interface Flashcard {
  id: number
  term: string
  synonym?: string
  translation: string
  example?: string
  exampleTranslation?: string
}

export default function FlashcardApp() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const currentCard = flashcards[currentIndex]

  const { speak, isSupported } = useSpeech()
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => changeCard(1),
    onSwipeRight: () => changeCard(-1),
  })

  const changeCard = (step: number) => {
    if (step > 0) {
      nextCard()
    } else {
      prevCard()
    }
  }

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x < -100) {
      changeCard(1)
    } else if (info.offset.x > 100) {
      changeCard(-1)
    }
  }

  useEffect(() => {
    console.log('📡 Fetching flashcards...');
    fetch('http://localhost:4000/api/words')
        .then((res) => {
          console.log('📩 Response status:', res.status);
          return res.json();
        })
        .then((data: Flashcard[]) => {
          console.log('📦 Received data:', data);
          setFlashcards(data);
        })
        .catch((err) => {
          console.error('❌ Fetch error:', err);
        });
  }, []);


  // Sonra: conditional return ve event handler’lar
  if (flashcards.length === 0) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
    )
  }

  const nextCard = () => {
    if (flashcards.length === 0) return
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % flashcards.length)
  }

  const prevCard = () => {
    if (flashcards.length === 0) return
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
  }

  const handlePronounce = () => {
    if (isSupported && currentCard) {
      speak(currentCard.term)
    }
  }
  
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
  }

  const transition = {
    type: "spring",
    stiffness: 500,
    damping: 25,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto">
        {/* Flashcard Container */}
        <div
          className="relative h-96 mb-8 perspective-1000"
          {...swipeHandlers}
          role="region"
          aria-label="Flashcard viewer"
          aria-live="polite"
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="absolute inset-0 bg-white rounded-2xl shadow-2xl p-6 flex flex-col justify-between cursor-grab active:cursor-grabbing"
              whileTap={{ scale: 0.98 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
            >
              {/* Pronunciation Button */}
              <div className="flex justify-end">
                <button
                  onClick={handlePronounce}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  aria-label={`Pronounce ${currentCard.term}`}
                  disabled={!isSupported}
                >
                  <Volume2 className="w-5 h-5 text-purple-600" />
                </button>
              </div>

              {/* Card Content */}
              <div className="flex-1 flex flex-col justify-center space-y-4 -mt-8">
                {/* Main Word */}
                <div className="text-center">
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 leading-tight">
                    {currentCard.term}
                  </h1>
                  {currentCard.synonym && (
                    <p className="text-lg italic text-purple-600 font-medium">{currentCard.synonym}</p>
                  )}
                </div>

                {/* Translation */}
                <div className="text-center">
                  <p className="text-xl text-gray-700 font-semibold mb-4">{currentCard.translation}</p>
                </div>

                {/* Example */}
                {currentCard.example && (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <span className="font-medium">Example:</span> {currentCard.example}
                    </p>
                    {currentCard.exampleTranslation && (
                      <p className="text-sm text-gray-500 leading-relaxed">
                        <span className="font-medium">Translation:</span> {currentCard.exampleTranslation}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Card Counter */}
              <div className="text-center">
                <span className="text-xs text-gray-400 font-medium">
                  {currentIndex + 1} of {flashcards.length}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center space-x-8">
          <motion.button
            onClick={prevCard}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Previous flashcard"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <div className="flex space-x-2">
            {flashcards.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? "bg-white" : "bg-white/40"
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: index === currentIndex ? 1.2 : 0.8 }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>

          <motion.button
            onClick={nextCard}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Next flashcard"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
