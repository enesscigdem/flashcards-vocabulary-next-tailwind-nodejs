"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface Flashcard {
    id: string
    term: string
    translation: string
    example?: string
    exampleTranslation?: string
    synonym?: string
    learned: boolean
    isFavourite: boolean
    timeSpent: number
    difficulty: "easy" | "medium" | "hard"
    reviewCount: number
    easeFactor: number
    interval: number
    category: string
    tags: string[]
}

interface FlashcardContextType {
    cards: Flashcard[]
    filteredCards: Flashcard[]
    currentIndex: number
    currentCard: Flashcard | null
    filter: "all" | "learned" | "toLearn" | "favorite"
    next: () => void
    prev: () => void
    markLearned: (id: string, val: boolean) => Promise<void>
    markFavourite: (id: string, val: boolean) => Promise<void>
    recordTime: (id: string, seconds: number) => Promise<void>
    setFilter: (filter: "all" | "learned" | "toLearn" | "favorite") => void
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined)

export function FlashcardProvider({ children }: { children: ReactNode }) {
    const [cards, setCards] = useState<Flashcard[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [filter, setFilter] = useState<"all"|"learned"|"toLearn"|"favorite">("all")

    // initial fetch & enrich
    useEffect(() => {
        fetch("/api/words")
            .then(res => res.json())
            .then((data: Array<Omit<Flashcard, "difficulty"|"reviewCount"|"easeFactor"|"interval"|"category"|"tags">>) => {
                const enriched = data.map(c => ({
                    ...c,
                    difficulty: "medium" as const,
                    reviewCount: 0,
                    easeFactor: 2.5,
                    interval: 1,
                    category: "word",
                    tags: [] as string[]
                }))
                setCards(enriched)
            })
            .catch(console.error)
    }, [])

    const filteredCards = cards.filter(c => {
        if (filter === "learned")   return c.learned
        if (filter === "toLearn")   return !c.learned
        if (filter === "favorite")  return c.isFavourite
        return true
    })

    const currentCard = filteredCards[currentIndex] || null

    const next = () => {
        if (!filteredCards.length) return
        setCurrentIndex(i => (i + 1) % filteredCards.length)
    }
    const prev = () => {
        if (!filteredCards.length) return
        setCurrentIndex(i => (i - 1 + filteredCards.length) % filteredCards.length)
    }

    const markLearned = async (id: string, val: boolean) => {
        await fetch(`/api/words/${id}/learn`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ learned: val })
        })
        setCards(cs => cs.map(c => c.id === id ? { ...c, learned: val } : c))
    }

    const markFavourite = async (id: string, val: boolean) => {
        await fetch(`/api/words/${id}/favorite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isFavourite: val })
        })
        setCards(cs => cs.map(c => c.id === id ? { ...c, isFavourite: val } : c))
    }

    const recordTime = async (id: string, seconds: number) => {
        if (seconds <= 0) return
        try {
            await fetch(`/api/words/${id}/time`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seconds })
            })
        } catch (err) {
            console.error('Error recording time:', err)
        }
    }

    return (
        <FlashcardContext.Provider value={{
            cards,
            filteredCards,
            currentIndex,
            currentCard,
            filter,
            next,
            prev,
            markLearned,
            markFavourite,
            recordTime,
            setFilter
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
