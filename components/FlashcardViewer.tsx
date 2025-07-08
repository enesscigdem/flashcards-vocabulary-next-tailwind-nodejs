'use client'
import {motion, AnimatePresence} from 'framer-motion'
import {useFlashcards} from '@/contexts/FlashcardContext'
import {useSpeech} from '@/hooks/use-speech'
import {useSwipe} from '@/hooks/use-swipe'
import {useEffect, useState} from 'react'
import {Volume2, Check, X, Settings as SettingsIcon} from 'lucide-react'
import {ProgressCircle} from './ProgressCircle'
import {Dialog, DialogContent, DialogTrigger, DialogTitle} from './ui/dialog'
import SettingsPanel from './SettingsPanel'
import {Skeleton} from './ui/skeleton'

export default function FlashcardViewer() {
  const {
    filteredCards,
    currentIndex,
    next,
    prev,
    markLearned,
    settings,
    setFilter,
    filter,
  } = useFlashcards()
  const card = filteredCards[currentIndex]
  const {speak, isSupported, isSpeaking} = useSpeech()
  const [flipped,setFlipped] = useState(false)
  const gradients = [
    'from-purple-600 via-purple-700 to-indigo-900',
    'from-teal-500 via-green-600 to-emerald-700',
    'from-amber-500 via-orange-600 to-rose-700',
  ]
  const gradient = gradients[settings.gradient % gradients.length]
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
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleCorrect, handleIncorrect])

  useEffect(() => { setFlipped(false) }, [card])

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
          {['all','learned','toLearn'].map(f=>(
            <button
              key={f}
              onClick={()=>setFilter(f as any)}
              className={`px-2 py-1 rounded ${filter===f?'bg-primary text-primary-foreground':'bg-muted'}`}
            >{f}</button>
          ))}
        </div>
        <Dialog>
          <DialogTrigger aria-label="Open settings" className="p-2"><SettingsIcon size={18}/></DialogTrigger>
          <DialogContent><DialogTitle>Settings</DialogTitle><SettingsPanel/></DialogContent>
        </Dialog>
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
            transition={{type:'spring',stiffness:500,damping:30}}
            className={`absolute inset-0 bg-card rounded-xl shadow-xl p-6 cursor-pointer perspective-1000 ${settings.animations?'transition-transform':''}`}
            style={{transformStyle:'preserve-3d'}}
            onClick={()=>setFlipped(f=>!f)}
          >
            <div className={`absolute inset-0 backface-hidden flex flex-col justify-center items-center gap-2 ${settings.fontSize==='lg'?'text-2xl':settings.fontSize==='sm'?'text-lg':'text-xl'}`}
                 style={{transform:'rotateY(0deg)'}}>
              <h1 className="font-extrabold tracking-tight text-foreground text-center" style={{textShadow:'0 1px 1px rgba(0,0,0,0.2)'}}>{card.term}</h1>
              {card.synonym && <p className="text-muted-foreground text-sm italic">{card.synonym}</p>}
            </div>
            <div className="absolute inset-0 backface-hidden flex flex-col justify-center items-center p-4 text-center" style={{transform:'rotateY(180deg)'}}>
              <p className="font-semibold mb-2">{card.translation}</p>
              {card.example && <p className="text-sm">{card.example}</p>}
              {card.exampleTranslation && <p className="text-sm text-muted-foreground">{card.exampleTranslation}</p>}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between mt-4 space-x-4">
        <motion.button onClick={prev} className="p-3 rounded-full bg-muted" whileTap={{scale:0.9}} aria-label="Previous card">
          <X className="h-5 w-5" />
        </motion.button>
        <button onClick={handlePronounce} className="relative p-4" aria-label={`Pronounce ${card.term}`}>
          <ProgressCircle progress={(currentIndex+1)/filteredCards.length} playing={isSpeaking} />
          <Volume2 className="absolute inset-0 m-auto h-5 w-5" />
        </button>
        <motion.button onClick={handleCorrect} className="p-3 rounded-full bg-muted" whileTap={{scale:0.9}} aria-label="Next card">
          <Check className="h-5 w-5" />
        </motion.button>
      </div>
      <p className="text-center text-xs mt-2">{currentIndex+1} / {filteredCards.length}</p>
      </div>
    </div>
  )
}
