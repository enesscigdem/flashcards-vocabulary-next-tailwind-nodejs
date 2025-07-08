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

export interface Settings {
  animations: boolean;
  gradient: number;
  fontSize: string;
  theme: string;
}

const defaultSettings: Settings = {
  animations: true,
  gradient: 0,
  fontSize: "md",
  theme: "system",
};

interface FlashcardContextState {
  cards: Flashcard[];
  currentIndex: number;
  learned: Record<number, boolean>;
  filter: Filter;
  settings: Settings;
  setFilter: (f: Filter) => void;
  next: () => void;
  prev: () => void;
  markLearned: (id: number) => void;
  setSettings: (s: Partial<Settings>) => void;
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
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);

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
    const savedSettings = localStorage.getItem("settings");
    if (savedSettings) setSettingsState(prev => ({...prev, ...JSON.parse(savedSettings)}));
  }, []);

  useEffect(() => {
    localStorage.setItem("learnedWords", JSON.stringify(learned));
  }, [learned]);

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

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

  const setSettings = (s:Partial<Settings>) => setSettingsState(prev => ({...prev, ...s}));

  const value: FlashcardContextState = {
    cards,
    currentIndex,
    learned,
    filter,
    settings,
    setFilter,
    next,
    prev,
    markLearned,
    setSettings,
    filteredCards,
  };

  return <FlashcardContext.Provider value={value}>{children}</FlashcardContext.Provider>;
};

