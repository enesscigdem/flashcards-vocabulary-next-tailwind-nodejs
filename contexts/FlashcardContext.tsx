// contexts/FlashcardContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

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

  // Load all words with learned flag
  useEffect(() => {
    fetch("http://localhost:4000/api/words")
        .then(res => res.json())
        .then((data: Flashcard[]) => setCards(data))
        .catch(console.error);
  }, []);

  // Filtered list
  const filteredCards = useMemo(() => {
    if (filter === "learned") return cards.filter(c => c.learned);
    if (filter === "toLearn") return cards.filter(c => !c.learned);
    return cards;
  }, [cards, filter]);

  // Reset index on filter change
  useEffect(() => setCurrentIndex(0), [filter, filteredCards.length]);

  const clamp = (i: number) =>
      filteredCards.length ? (i + filteredCards.length) % filteredCards.length : 0;
  const next = () => setCurrentIndex(i => clamp(i + 1));
  const prev = () => setCurrentIndex(i => clamp(i - 1));

  // Mark as learned in backend and update state
  const markLearned = async (id: number) => {
    await fetch(`http://localhost:4000/api/words/${id}/learn`, { method: "POST" });
    setCards(prev =>
        prev.map(c => (c.id === id ? { ...c, learned: true } : c))
    );
  };

  return (
      <FlashcardContext.Provider
          value={{ cards, currentIndex, filter, setFilter, next, prev, markLearned, filteredCards }}
      >
        {children}
      </FlashcardContext.Provider>
  );
};
