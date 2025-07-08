"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
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
    step > 0 ? nextCard() : prevCard()
  }

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x < -80) changeCard(1)
    else if (info.offset.x > 80) changeCard(-1)
  }

  useEffect(() => {
    fetch('http://localhost:4000/api/words')
        .then((res) => res.json())
        .then((data: Flashcard[]) => setFlashcards(data))
        .catch(console.error)
  }, [])

  if (!flashcards.length) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
    )
  }

  const nextCard = () => {
    setDirection(1)
    setCurrentIndex((i) => (i + 1) % flashcards.length)
  }

  const prevCard = () => {
    setDirection(-1)
    setCurrentIndex((i) => (i - 1 + flashcards.length) % flashcards.length)
  }

  const handlePronounce = () => {
    if (isSupported) speak(currentCard.term)
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div
              className="relative h-96 mb-8"
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
                  transition={{
                    type: "spring",
                    stiffness: 1000,
                    damping: 25,
                  }}
                  className="absolute inset-0 bg-white rounded-2xl shadow-2xl p-6 flex flex-col justify-between cursor-grab active:cursor-grabbing"
                  whileTap={{ scale: 0.97 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.8}
                  dragTransition={{
                    power: 0.6,
                    timeConstant: 150,
                    bounceStiffness: 700,
                    bounceDamping: 20,
                  }}
                  onDragEnd={handleDragEnd}
              >
                <div className="flex justify-end">
                  <button
                      onClick={handlePronounce}
                      className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      aria-label={`Pronounce ${currentCard.term}`}
                      disabled={!isSupported}
                  >
                    <Volume2 className="w-5 h-5 text-purple-600" />
                  </button>
                </div>

                <div className="flex-1 flex flex-col justify-center space-y-4 -mt-8">
                  <div className="text-center">
                    <h1 className="text-4xl font-black text-gray-900 leading-tight">
                      {currentCard.term}
                    </h1>
                    {currentCard.synonym && (
                        <p className="mt-1 text-lg italic text-purple-600">{currentCard.synonym}</p>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-xl text-gray-700 font-semibold">
                      {currentCard.translation}
                    </p>
                  </div>

                  {currentCard.example && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Example:</strong> {currentCard.example}
                        </p>
                        {currentCard.exampleTranslation && (
                            <p className="text-sm text-gray-500">
                              <strong>Translation:</strong> {currentCard.exampleTranslation}
                            </p>
                        )}
                      </div>
                  )}
                </div>

                <div className="text-center">
                <span className="text-xs text-gray-400">
                  {currentIndex + 1} / {flashcards.length}
                </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center space-x-6">
            <motion.button
                onClick={prevCard}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Previous flashcard"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            <Progress
                value={((currentIndex + 1) / flashcards.length) * 100}
                className="flex-1 h-2 rounded"
            />

            <motion.button
                onClick={nextCard}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                whileHover={{ scale: 1.15 }}
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
