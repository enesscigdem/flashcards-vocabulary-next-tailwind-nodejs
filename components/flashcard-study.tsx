"use client"
import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useFlashcards } from "@/contexts/flashcard-context"
import { useSpeech } from "@/hooks/use-speech"
import { useSwipe } from "@/hooks/use-swipe"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Volume2, Check, X, RotateCcw, Lightbulb, Timer, Pause, Play, Sun, Moon, Settings } from "lucide-react"
import { ProgressCircle } from "@/components/ProgressCircle"
import { useTheme } from "next-themes"

export function FlashcardStudy() {
    const {
        filteredCards,
        currentIndex,
        next,
        prev,
        markLearned,
        currentCard,
        sessionStats,
        filter,
        setFilter,
        cards
    } = useFlashcards()

    const { speak, isSupported } = useSpeech()
    const { theme, setTheme } = useTheme()
    const swipe = useSwipe({ onSwipeLeft: next, onSwipeRight: prev })

    const [flipped, setFlipped] = useState(false)
    const [showHint, setShowHint] = useState(false)
    const [sessionTime, setSessionTime] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [showSettings, setShowSettings] = useState(false)

    // Session timer
    useEffect(() => {
        if (isPaused) return
        const interval = setInterval(() => setSessionTime((prev) => prev + 1), 1000)
        return () => clearInterval(interval)
    }, [isPaused])

    // Reset flip when card changes
    useEffect(() => {
        setFlipped(false)
        setShowHint(false)
    }, [currentCard])

    // Keyboard controls
    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
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
                    setFlipped((f) => !f)
                    break
                case "s":
                    if (currentCard && isSupported) {
                        speak(flipped && currentCard.example ? currentCard.example : currentCard.term)
                    }
                    break
                case "h":
                    setShowHint((s) => !s)
                    break
            }
        },
        [currentCard, flipped, next, prev, isSupported, speak]
    )

    useEffect(() => {
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [onKeyDown])

    if (!currentCard) {
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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    // Learn handler
    const handleLearned = async () => {
        await markLearned(currentCard.id)
        next()
    }

    // Stats: Learned, Not Learned, Rate
    const learnedCount = cards.filter(c => c.learned).length
    const notLearnedCount = cards.length - learnedCount
    const learningRate = Math.round((learnedCount / (cards.length || 1)) * 100)

    return (
        <div
            className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 relative"
            {...swipe}
        >
            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 z-10">
                <div className="flex items-center justify-between">
                    {/* Left: Filter & Timer */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full p-1">
                            {[
                                { val: "all", label: "All" },
                                { val: "toLearn", label: "New" },
                                { val: "learned", label: "Learned" },
                            ].map(({ val, label }) => (
                                <Button
                                    key={val}
                                    variant={filter === val ? "default" : "ghost"}
                                    size="sm"
                                    className="rounded-full h-8 px-3 text-xs"
                                    onClick={() => setFilter(val)}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                        <div className="flex items-center space-x-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full px-3 py-1">
                            <Timer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            <span className="text-sm font-medium">{formatTime(sessionTime)}</span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsPaused((p) => !p)}>
                                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                            </Button>
                        </div>
                    </div>
                    {/* Right: Theme & Settings */}
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
                            onClick={() => setShowSettings((s) => !s)}
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
                    <Progress value={((currentIndex + 1) / filteredCards.length) * 100} className="h-2" />
                </div>
            </div>

            {/* Main Card Area */}
            <div className="flex-1 flex items-center justify-center p-6 pt-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCard.id}
                        initial={{ x: 300, opacity: 0, scale: 0.8 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: -300, opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-full max-w-2xl"
                    >
                        <Card className="relative overflow-hidden shadow-2xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
                            <CardContent className="p-0">
                                <div className="relative h-96" style={{ perspective: 1000 }}>
                                    <motion.div
                                        animate={{ rotateY: flipped ? 180 : 0 }}
                                        transition={{ duration: 0.6, type: "spring" }}
                                        className="absolute inset-0 w-full h-full cursor-pointer"
                                        style={{ transformStyle: "preserve-3d" }}
                                        onClick={() => setFlipped((f) => !f)}
                                    >
                                        {/* Front */}
                                        <div
                                            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8"
                                            style={{ backfaceVisibility: "hidden" }}
                                        >
                                            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                                                {currentCard.category ?? "Word"}
                                            </Badge>
                                            <h1 className="text-5xl font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                                {currentCard.term}
                                            </h1>
                                            <p className="text-2xl text-slate-600 dark:text-slate-400 font-medium mt-4">
                                                {currentCard.translation}
                                            </p>
                                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                                                <motion.p
                                                    className="text-sm text-slate-400 flex items-center space-x-2"
                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                                                >
                                                    <span>Click to flip or press Space</span>
                                                </motion.p>
                                            </div>
                                        </div>

                                        {/* Back */}
                                        <div
                                            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8"
                                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                                        >
                                            {currentCard.example && (
                                                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
                                                    <p className="text-xl italic text-blue-800 dark:text-blue-200 mb-3">
                                                        "{currentCard.example}"
                                                    </p>
                                                    {currentCard.exampleTranslation && (
                                                        <p className="text-lg text-blue-600 dark:text-blue-400">
                                                            {currentCard.exampleTranslation}
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
                </AnimatePresence>
            </div>

            {/* Bottom Controls */}
            <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    {/* Nav & Audio */}
                    <div className="flex items-center space-x-3">
                        <Button variant="outline" size="lg" onClick={prev} disabled={currentIndex===0} className="h-12 px-6">
                            Previous
                        </Button>
                        <Button variant="outline" size="lg" onClick={()=>isSupported&&speak(flipped&&currentCard.example?currentCard.example:currentCard.term)} disabled={!isSupported} className="h-12 px-6">
                            <Volume2 className="w-5 h-5 mr-2"/> Listen
                        </Button>
                    </div>

                    {/* Learned */}
                    {flipped && (
                        <Button size="lg" onClick={handleLearned} className="h-12 px-6 bg-green-500 hover:bg-green-600 text-white">
                            <Check className="w-5 h-5 mr-2"/> Learned
                        </Button>
                    )}

                    {/* Next */}
                    {!flipped && (
                        <Button size="lg" onClick={next} className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                            Next
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center space-x-8 mt-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span>Learned: {learnedCount}</span></div>
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span>Not Learned: {notLearnedCount}</span></div>
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span>Rate: {learningRate}%</span></div>
                </div>
            </div>

            {/* Shortcuts */}
            <div className="absolute bottom-4 left-4 text-xs text-slate-400">←→ Navigate • Space Flip • S Audio • H Hint</div>
        </div>
    )
}
