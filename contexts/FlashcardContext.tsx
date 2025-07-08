// contexts/FlashcardContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""; // Örn: https://myapp.vercel.app

export interface Flashcard {
  id: number;
  term: string;
  synonym?: string;
  translation: string;
  example?: string;
  exampleTranslation?: string;
  learned: boolean;
}

export type Filter = "all" | "learned" | "toLearn";

interface FlashcardContextState {
  cards: Flashcard[];
  currentIndex: number;
  filter: Filter;
  setFilter: (f: Filter) => void;
  next: () => void;
  prev: () => void;
  markLearned: (id: number) => Promise<void>;
  filteredCards: Flashcard[];
}

const FlashcardContext = createContext<FlashcardContextState | undefined>(undefined);

export const useFlashcards = () => {
  const ctx = useContext(FlashcardContext);
  if (!ctx) throw new Error("FlashcardContext not found");
  return ctx;
};

export const FlashcardProvider = ({ children }: { children: React.ReactNode }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    fetch(`${API_BASE}/api/words`)
        .then(res => res.json())
        .then((data: Flashcard[]) => setCards(data))
        .catch(console.error);
  }, []);

  // 2) Filtre uygulanmış liste
  const filteredCards = useMemo(() => {
    if (filter === "learned") return cards.filter(c => c.learned);
    if (filter === "toLearn") return cards.filter(c => !c.learned);
    return cards;
  }, [cards, filter]);

  // 3) Filtre değişince index sıfırla
  useEffect(() => setCurrentIndex(0), [filter, filteredCards.length]);

  const clamp = (i: number) =>
      filteredCards.length ? (i + filteredCards.length) % filteredCards.length : 0;
  const next = () => setCurrentIndex(i => clamp(i + 1));
  const prev = () => setCurrentIndex(i => clamp(i - 1));

  // 4) Öğrenildi olarak işaretle
  const markLearned = async (id: number) => {
    await fetch(`${API_BASE}/api/words/${id}/learn`, { method: "POST" });
    setCards(prev => prev.map(c => (c.id === id ? { ...c, learned: true } : c)));
  };

  return (
      <FlashcardContext.Provider
          value={{ cards, currentIndex, filter, setFilter, next, prev, markLearned, filteredCards }}
      >
        {children}
      </FlashcardContext.Provider>
  );
};
