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
    filter: "all" | "learned" | "toLearn"
    sessionStats: SessionStats
    next: () => void
    prev: () => void
    markLearned: (id: string) => Promise<void>
    markDifficult: (id: string) => void
    setFilter: (filter: "all" | "learned" | "toLearn") => void
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined)

export function FlashcardProvider({ children }: { children: ReactNode }) {
    const [cards, setCards] = useState<Flashcard[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [filter, setFilter] = useState<"all" | "learned" | "toLearn">("all")
    const [sessionStats, setSessionStats] = useState<SessionStats>({
        correct: 0, incorrect: 0, timeSpent: 0, cardsStudied: 0,
    })

    // Veritabanından çek
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

    const filteredCards = cards.filter(c => {
        if (filter === "learned") return c.learned
        if (filter === "toLearn") return !c.learned
        return true
    })

    const currentCard = filteredCards[currentIndex] || null

    const next = () => {
        if (!filteredCards.length) return
        setCurrentIndex(i => (i + 1) % filteredCards.length)
        setSessionStats(s => ({ ...s, cardsStudied: s.cardsStudied + 1 }))
    }

    const prev = () => {
        if (!filteredCards.length) return
        setCurrentIndex(i => (i - 1 + filteredCards.length) % filteredCards.length)
    }

    // Öğrendi olarak işaretle: API çağrısı ve state güncelleme
    const markLearned = async (id: string) => {
        try {
            const res = await fetch(`/api/words/${id}/learn`, { method: 'POST' })
            if (!res.ok) throw new Error(`Failed to mark learned: ${res.status}`)
            setSessionStats(s => ({ ...s, correct: s.correct + 1 }))
            setCards(cs => cs.map(c => c.id === id ? { ...c, learned: true } : c))
        } catch (err) {
            console.error('Error marking learned:', err)
        }
    }

    const markDifficult = (id: string) => {
        setSessionStats(s => ({ ...s, incorrect: s.incorrect + 1 }))
        // update difficulty or schedule as needed
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
