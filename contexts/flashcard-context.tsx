// contexts/FlashcardContext.tsx
"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Flashcard {
    id: string
    term: string
    translation: string
    example?: string
    exampleTranslation?: string
    synonym?: string
    // aşağıdakiler veritabanında yok; varsayılan veriyoruz
    difficulty: "easy" | "medium" | "hard"
    learned: boolean
    reviewCount: number
    easeFactor: number
    interval: number
    category: string
    tags: string[]
}

interface SessionStats {
    correct: number
    incorrect: number
    timeSpent: number
    cardsStudied: number
}

interface FlashcardContextType {
    cards: Flashcard[]
    filteredCards: Flashcard[]
    currentIndex: number
    currentCard: Flashcard | null
    filter: string
    sessionStats: SessionStats
    next: () => void
    prev: () => void
    markLearned: (id: string) => void
    markDifficult: (id: string) => void
    setFilter: (filter: string) => void
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined)

export function FlashcardProvider({ children }: { children: ReactNode }) {
    const [cards, setCards] = useState<Flashcard[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [filter, setFilter] = useState<"all"|"learned"|"toLearn">("all")
    const [sessionStats, setSessionStats] = useState<SessionStats>({
        correct: 0, incorrect: 0, timeSpent: 0, cardsStudied: 0,
    })

    // 1) Veritabanından çek
    useEffect(() => {
        fetch("/api/words")
            .then(res => res.json())
            .then((data: {
                id: string
                term: string
                translation: string
                example?: string
                exampleTranslation?: string
                synonym?: string
                learned: boolean
            }[]) => {
                // eksik alanlara default verelim
                const enriched = data.map(c => ({
                    ...c,
                    difficulty: "medium" as const,
                    reviewCount: 0,
                    easeFactor: 2.5,
                    interval: 1,
                    category: "word",
                    tags: [] as string[],
                }))
                setCards(enriched)
            })
            .catch(console.error)
    }, [])

    // filtrelenmiş liste
    const filteredCards = cards.filter(c => {
        if (filter === "learned") return c.learned
        if (filter === "toLearn") return !c.learned
        return true
    })

    // seçili kart
    const currentCard = filteredCards[currentIndex] || null

    const next = () => {
        if (filteredCards.length === 0) return
        setCurrentIndex(i => (i + 1) % filteredCards.length)
        setSessionStats(s => ({ ...s, cardsStudied: s.cardsStudied + 1 }))
    }

    const prev = () => {
        if (filteredCards.length === 0) return
        setCurrentIndex(i => (i - 1 + filteredCards.length) % filteredCards.length)
    }

    const markLearned = (id: string) => {
        setSessionStats(s => ({ ...s, correct: s.correct + 1 }))
        // gerçek uygulamada API çağrısı yapabilirsiniz
        setCards(cs => cs.map(c => c.id === id ? { ...c, learned: true } : c))
    }

    const markDifficult = (id: string) => {
        setSessionStats(s => ({ ...s, incorrect: s.incorrect + 1 }))
        // gerçek uygulamada zorluk ve review ayarları güncellenir
    }

    return (
        <FlashcardContext.Provider value={{
            cards,
            filteredCards,
            currentIndex,
            currentCard,
            filter,
            sessionStats,
            next,
            prev,
            markLearned,
            markDifficult,
            setFilter,
        }}>
            {children}
        </FlashcardContext.Provider>
    )
}

export function useFlashcards() {
    const ctx = useContext(FlashcardContext)
    if (!ctx) throw new Error("useFlashcards must be used within FlashcardProvider")
    return ctx
}
