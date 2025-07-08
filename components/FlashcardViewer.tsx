'use client'
import {motion, AnimatePresence} from 'framer-motion'
import {useFlashcards} from '@/contexts/FlashcardContext'
import {useSpeech} from '@/hooks/use-speech'
import {useSwipe} from '@/hooks/use-swipe'
import {useEffect, useState} from 'react'
import {Volume2, Check, X} from 'lucide-react'
import {ProgressCircle} from './ProgressCircle'
import {Skeleton} from './ui/skeleton'

export default function FlashcardViewer() {
  const {
    filteredCards,
    currentIndex,
    next,
    markLearned,
    setFilter,
    filter,
  } = useFlashcards()
  const card = filteredCards[currentIndex]
  const {speak, isSupported, isSpeaking} = useSpeech()
  const [flipped,setFlipped] = useState(false)
  const gradient = 'from-purple-600 via-fuchsia-700 to-indigo-900'
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => handleIncorrect(),
    onSwipeRight: () => handleCorrect(),
  })
  const handleCorrect = () => {
    if(card) markLearned(card.id)
    next()
  }
  const handleIncorrect = () => {
    next()
  }
  const handlePronounce = () => {
    if(card && isSupported) speak(card.term)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if(e.key==='ArrowRight') handleCorrect()
      if(e.key==='ArrowLeft') handleIncorrect()
      if(e.key==='Enter') setFlipped(f=>!f)
      if(e.key===' ') { e.preventDefault(); handlePronounce() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleCorrect, handleIncorrect])

  useEffect(() => { setFlipped(false) }, [card])

  // preload next card pronunciation
  useEffect(() => {
    const nextCard = filteredCards[(currentIndex + 1) % filteredCards.length]
    if(nextCard){
      new SpeechSynthesisUtterance(nextCard.term)
    }
  }, [currentIndex, filteredCards])

  const slideVariants = {
    enter: (dir:number) => ({ x: dir>0?300:-300, opacity:0, rotateY:0 }),
    center: { x:0, opacity:1 },
    exit: (dir:number) => ({ x: dir<0?300:-300, opacity:0 })
  }

  if(!card) return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <Skeleton className="h-80 w-full rounded-xl" />
      <div className="flex justify-between px-8">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  )

  return (
    <div className={`w-full max-w-md mx-auto p-1 rounded-xl bg-gradient-to-br ${gradient}`} {...swipeHandlers}>
      <div className="bg-background rounded-xl p-2">
      <div className="flex justify-between mb-2 items-center">
        <div className="space-x-2 text-sm">
          {[{val:'all',label:'Tümü'},{val:'learned',label:'Öğrendiklerim'},{val:'toLearn',label:'Öğrenmediklerim'}].map(({val,label})=>(
            <button
              key={val}
              onClick={()=>setFilter(val as any)}
              className={`px-3 py-1 rounded-full transition-colors ${filter===val?'bg-primary text-primary-foreground':'bg-muted'}`}
              aria-label={label}
            >{label}</button>
          ))}
        </div>
        {/* Theme toggle handled in page */}
      </div>
      <div className="relative h-80" role="region" aria-label="Flashcard" aria-live="polite">
        <AnimatePresence initial={false} custom={0}>
          <motion.div
            key={card.id + String(flipped)}
            custom={0}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            whileHover={{y:-8}}
            whileTap={{scale:0.97}}
            transition={{type:'spring',stiffness:500,damping:30}}
            className="absolute inset-0 bg-card rounded-xl shadow-xl p-6 cursor-pointer perspective-1000 transition-transform"
            style={{transformStyle:'preserve-3d'}}
            onClick={()=>setFlipped(f=>!f)}
          >
            <div className="absolute inset-0 backface-hidden flex flex-col justify-center items-center p-6 text-center" style={{transform:'rotateY(0deg)'}}>
              <h1 className="text-3xl font-extrabold text-gray-800 mb-1">{card.term}</h1>
              {card.synonym && <p className="italic text-purple-600 text-sm mb-2">{card.synonym}</p>}
              <p className="text-xl font-medium text-gray-800">{card.translation}</p>
            </div>
            <div className="absolute inset-0 backface-hidden flex flex-col justify-center items-center p-6 text-center" style={{transform:'rotateY(180deg)'}}>
              <div className="w-full border-t border-gray-200 pt-4 space-y-1">
                {card.example && <p className="text-sm text-gray-700">{card.example}</p>}
                {card.exampleTranslation && <p className="text-sm text-muted-foreground">{card.exampleTranslation}</p>}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between mt-4 space-x-4">
        <motion.button onClick={handleIncorrect} className="p-3 w-11 h-11 rounded-full bg-muted" whileHover={{scale:1.1,opacity:0.8}} whileTap={{scale:0.9}} aria-label="Yanlış">
          <X className="h-5 w-5" />
        </motion.button>
        <button onClick={handlePronounce} className="relative p-4 w-11 h-11" aria-label={`Pronounce ${card.term}`}>
          <ProgressCircle progress={(currentIndex+1)/filteredCards.length} playing={isSpeaking} />
          <Volume2 className="absolute inset-0 m-auto h-5 w-5" />
        </button>
        <motion.button onClick={handleCorrect} className="p-3 w-11 h-11 rounded-full bg-muted" whileHover={{scale:1.1,opacity:0.8}} whileTap={{scale:0.9}} aria-label="Doğru">
          <Check className="h-5 w-5" />
        </motion.button>
      </div>
      <p className="text-center text-xs mt-2">{currentIndex+1} / {filteredCards.length}</p>
      </div>
    </div>
  )
}
