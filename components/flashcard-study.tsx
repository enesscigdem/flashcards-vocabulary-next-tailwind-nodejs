// components/FlashcardStudy.tsx
"use client"
import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useFlashcards } from "@/contexts/flashcard-context"
import { useSpeech } from "@/hooks/use-speech"
import { useSwipe } from "@/hooks/use-swipe"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    CheckCircle,
    Heart,
    Info,
    Timer as TimerIcon,
    Play,
    Pause,
    Sun,
    Moon,
    Settings,
    Volume2,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { ProgressCircle } from "@/components/ProgressCircle"
import { useTheme } from "next-themes"

export function FlashcardStudy() {
    const {
        cards,
        filteredCards,
        currentIndex,
        currentCard,
        next,
        prev,
        markLearned,
        markFavourite,
        recordTime,
        filter,
        setFilter,
    } = useFlashcards()

    const { speak, isSupported } = useSpeech()
    const { theme, setTheme } = useTheme()
    const swipe = useSwipe({ onSwipeLeft: next, onSwipeRight: prev })

    const [flipped, setFlipped] = useState(false)
    const [sessionTime, setSessionTime] = useState(0)
    const [cardTime, setCardTime] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [showHints, setShowHints] = useState(false)

    // Seed timers when cards load
    useEffect(() => {
        if (!cards.length) return
        const total = cards.reduce((sum, c) => sum + c.timeSpent, 0)
        setSessionTime(total)
        if (currentCard) setCardTime(currentCard.timeSpent)
        setIsLoading(false)
    }, [cards, currentCard])

    // Tick every second
    useEffect(() => {
        if (isPaused) return
        const iv = setInterval(() => {
            setSessionTime(t => t + 1)
            setCardTime(t => t + 1)
        }, 1000)
        return () => clearInterval(iv)
    }, [isPaused])

    // On card change, record previous card’s time
    useEffect(() => {
        if (!currentCard || !filteredCards.length) return
        const prevIdx = (currentIndex - 1 + filteredCards.length) % filteredCards.length
        const prevCard = filteredCards[prevIdx]
        if (prevCard) recordTime(prevCard.id, cardTime)
        setCardTime(currentCard.timeSpent)
        setFlipped(false)
    }, [currentIndex])

    // On unmount
    useEffect(() => {
        return () => {
            if (currentCard) recordTime(currentCard.id, cardTime)
        }
    }, [])

    // Keyboard shortcuts
    const onKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement) return
        switch (e.key) {
            case "ArrowRight":
            case "j":
                next()
                break
            case "ArrowLeft":
            case "k":
                prev()
                break
            case "Enter":
            case " ":
                e.preventDefault()
                setFlipped(f => !f)
                break
            case "s":
                if (isSupported && currentCard) {
                    const text = flipped && currentCard.example
                        ? currentCard.example
                        : currentCard.term
                    speak(text)
                }
                break
            case "f":
                if (currentCard) markFavourite(currentCard.id, !currentCard.isFavourite)
                break
        }
    }, [currentCard, flipped, next, prev, isSupported, speak, markFavourite])

    useEffect(() => {
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [onKeyDown])

    // If no cards
    if (!isLoading && !currentCard) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📚</span>
                    </div>
                    <p className="text-lg font-medium">No cards available</p>
                    <p className="text-slate-500">Add some cards to start studying!</p>
                </div>
            </div>
        )
    }

    const card = currentCard!
    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60)
        const s = sec % 60
        return `${m}:${s.toString().padStart(2, "0")}`
    }

    // toggle learned (no auto-advance)
    const toggleLearned = async () => {
        await markLearned(card.id, !card.learned)
    }

    const learnedCount = filteredCards.filter(c => c.learned).length
    const favouriteCount = filteredCards.filter(c => c.isFavourite).length
    const notLearnedCount = filteredCards.length - learnedCount
    const learningRate = Math.round((learnedCount / (filteredCards.length || 1)) * 100)

    return (
        <div {...swipe} className="min-h-screen flex flex-col relative bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 overflow-x-hidden">
            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 z-10">
                <div className="flex items-center justify-between">
                    {/* filters & timer */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full p-1">
                            {[
                                { val: "all", label: "All" },
                                { val: "toLearn", label: "New" },
                                { val: "learned", label: "Learned" },
                                { val: "favorite", label: "Favorites" },
                            ].map(({ val, label }) => (
                                <Button
                                    key={val}
                                    variant={filter === val ? "default" : "ghost"}
                                    size="sm"
                                    className="rounded-full h-8 px-3 text-xs"
                                    onClick={() => setFilter(val as any)}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                        <div className="flex items-center space-x-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full px-3 py-1">
                            <TimerIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            <span className="text-sm font-medium">{formatTime(sessionTime)}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => setIsPaused(p => !p)}
                            >
                                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                            </Button>
                        </div>
                    </div>
                    {/* theme/settings */}
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        >
                            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full"
                        >
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute top-20 left-4 right-4 z-10">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full p-3">
                    <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {currentIndex + 1} / {filteredCards.length}
            </span>
                        <ProgressCircle progress={(currentIndex + 1) / filteredCards.length} size={24} />
                    </div>
                    <Progress
                        value={((currentIndex + 1) / filteredCards.length) * 100}
                        className="h-2"
                    />
                </div>
            </div>

            {/* Main Card */}
            <div className="flex-1 flex items-center justify-center p-6 pt-32">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div key="skeleton" className="w-full max-w-2xl">
                            <Card className="relative overflow-hidden rounded-xl shadow-2xl bg-white/90 dark:bg-slate-900/90">
                                <CardContent className="p-8 space-y-4">
                                    <div className="h-6 w-24 bg-gray-300 rounded-full animate-pulse" />
                                    <div className="h-12 bg-gray-300 rounded animate-pulse w-3/4" />
                                    <div className="h-8 bg-gray-300 rounded animate-pulse w-1/2" />
                                    <div className="h-6 bg-gray-300 rounded animate-pulse w-1/3 mt-6" />
                                    <div className="h-6 bg-gray-300 rounded animate-pulse w-2/3" />
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={card.id}
                            initial={{ x: 300, opacity: 0, scale: 0.8 }}
                            animate={{ x: 0, opacity: 1, scale: 1 }}
                            exit={{ x: -300, opacity: 0, scale: 0.8 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="w-full max-w-2xl"
                        >
                            <Card className="relative overflow-hidden rounded-xl shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
                                {/* Learned toggle */}
                                <div className="absolute top-4 right-16 z-20">
                                    <button
                                        onClick={toggleLearned}
                                        className={`
                      w-8 h-8 flex items-center justify-center rounded-full
                      bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2
                      ${card.learned ? "border-green-400" : "border-gray-400"}
                      hover:border-slate-300 dark:hover:border-slate-700
                      transition
                    `}
                                    >
                                        <CheckCircle
                                            className={`w-5 h-5 ${card.learned ? "text-green-500" : "text-gray-400"}`}
                                        />
                                    </button>
                                </div>

                                {/* Favorite toggle */}
                                <div className="absolute top-4 right-4 z-20">
                                    <button
                                        onClick={() => markFavourite(card.id, !card.isFavourite)}
                                        className={`
                      w-8 h-8 flex items-center justify-center rounded-full
                      bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2
                      ${card.isFavourite ? "border-red-400" : "border-transparent"}
                      hover:border-slate-300 dark:hover:border-slate-700
                      transition
                    `}
                                    >
                                        <Heart
                                            fill={card.isFavourite ? "currentColor" : "none"}
                                            className={`w-5 h-5 ${card.isFavourite ? "text-red-500" : "text-gray-400"}`}
                                        />
                                    </button>
                                </div>

                                <CardContent className="p-8">
                                    <div className="relative h-96" style={{ perspective: 1000 }}>
                                        <motion.div
                                            animate={{ rotateY: flipped ? 180 : 0 }}
                                            transition={{ duration: 0.6, type: "spring" }}
                                            className="absolute inset-0 w-full h-full cursor-pointer"
                                            style={{ transformStyle: "preserve-3d" }}
                                            onClick={() => setFlipped(f => !f)}
                                        >
                                            {/* Front */}
                                            <div
                                                className="absolute inset-0 flex flex-col items-center justify-center space-y-6"
                                                style={{ backfaceVisibility: "hidden" }}
                                            >
                                                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                                    {card.category}
                                                </Badge>
                                                <h1 className="text-5xl font-bold text-slate-800 dark:text-slate-200">
                                                    {card.term}
                                                </h1>
                                                <p className="text-2xl text-slate-600 dark:text-slate-400">
                                                    {card.translation}
                                                </p>
                                            </div>
                                            {/* Back */}
                                            <div
                                                className="absolute inset-0 flex items-center justify-center p-8"
                                                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                                            >
                                                {card.example && (
                                                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
                                                        <p className="italic text-xl text-blue-800 dark:text-blue-200 mb-3">
                                                            "{card.example}"
                                                        </p>
                                                        {card.exampleTranslation && (
                                                            <p className="text-lg text-blue-600 dark:text-blue-400">
                                                                {card.exampleTranslation}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Controls */}
            <div className="p-6 bg-white/80 dark:bg-slate-900/80 border-t border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row items-center md:justify-between max-w-4xl mx-auto space-y-4 md:space-y-0">
                    {/* Buttons */}
                    <div className="flex items-center space-x-3">
                        <Button variant="outline" size="lg" onClick={prev} disabled={currentIndex === 0}>
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => isSupported && speak(flipped && card.example ? card.example : card.term)}
                            disabled={!isSupported}
                        >
                            <Volume2 className="w-5 h-5 mr-2" />
                            Listen
                        </Button>
                        <Button
                            size="lg"
                            onClick={next}
                            className="ml-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                            Next
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-row flex-wrap justify-center items-center space-x-4 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                            <span>Favorites: {favouriteCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            <span>Learned: {learnedCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                            <span>Not Learned: {notLearnedCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            <span>Rate: {learningRate}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info-Popup */}
            <div className="absolute bottom-4 left-4 z-30">
                <button
                    onClick={() => setShowHints(x => !x)}
                    className="p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full shadow"
                >
                    <Info className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
                {showHints && (
                    <div className="absolute bottom-10 left-0 w-40 bg-white/90 dark:bg-slate-800/90 p-2 rounded-lg shadow-lg text-xs text-slate-800 dark:text-slate-300 space-y-1">
                        <p>← → Navigate</p>
                        <p>Space &nbsp;Flip</p>
                        <p>S &nbsp;Audio</p>
                        <p>F &nbsp;Favorite</p>
                    </div>
                )}
            </div>
        </div>
    )
}
