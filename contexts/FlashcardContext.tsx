import React, {createContext, useContext, useEffect, useMemo, useState} from "react";

export interface Flashcard {
  id: number;
  term: string;
  synonym?: string;
  translation: string;
  example?: string;
  exampleTranslation?: string;
}

export type Filter = "all" | "learned" | "toLearn";

// Context sadece kart verisi, filtre ve öğrenilen kelimeleri saklar.

interface FlashcardContextState {
  cards: Flashcard[];
  currentIndex: number;
  learned: Record<number, boolean>;
  filter: Filter;
  setFilter: (f: Filter) => void;
  next: () => void;
  prev: () => void;
  markLearned: (id: number) => void;
  filteredCards: Flashcard[];
}

const FlashcardContext = createContext<FlashcardContextState | undefined>(undefined);

export const useFlashcards = () => {
  const ctx = useContext(FlashcardContext);
  if (!ctx) throw new Error("FlashcardContext not found");
  return ctx;
};

export const FlashcardProvider = ({children}:{children:React.ReactNode}) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learned, setLearned] = useState<Record<number, boolean>>({});
  const [filter, setFilter] = useState<Filter>("all");

  // Load data
  useEffect(() => {
    fetch("http://localhost:4000/api/words")
      .then(res => res.json())
      .then((data: Flashcard[]) => setCards(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("learnedWords");
    if (saved) setLearned(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("learnedWords", JSON.stringify(learned));
  }, [learned]);


  const filteredCards = useMemo(() => {
    if (filter === "learned") return cards.filter(c => learned[c.id]);
    if (filter === "toLearn") return cards.filter(c => !learned[c.id]);
    return cards;
  }, [cards, filter, learned]);

  const clampIndex = (i:number) => {
    const len = filteredCards.length;
    if (len === 0) return 0;
    return (i + len) % len;
  };

  const next = () => setCurrentIndex(i => clampIndex(i + 1));
  const prev = () => setCurrentIndex(i => clampIndex(i - 1));

  const markLearned = (id:number) => setLearned(l => ({...l, [id]: true}));

  const value: FlashcardContextState = {
    cards,
    currentIndex,
    learned,
    filter,
    setFilter,
    next,
    prev,
    markLearned,
    filteredCards,
  };

  return <FlashcardContext.Provider value={value}>{children}</FlashcardContext.Provider>;
};

