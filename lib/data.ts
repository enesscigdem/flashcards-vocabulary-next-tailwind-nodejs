export interface Flashcard {
  term: string
  synonym?: string
  translation: string
  example?: string
  exampleTranslation?: string
}

export const flashcards: Flashcard[] = [
  {
    term: "Serendipity",
    synonym: "Happy accident",
    translation: "Tesadüf",
    example: "Finding this book was pure serendipity.",
    exampleTranslation: "Bu kitabı bulmak tamamen tesadüftü.",
  },
  {
    term: "Ephemeral",
    synonym: "Fleeting",
    translation: "Geçici",
    example: "The beauty of cherry blossoms is ephemeral.",
    exampleTranslation: "Kiraz çiçeklerinin güzelliği geçicidir.",
  },
  {
    term: "Wanderlust",
    synonym: "Travel desire",
    translation: "Gezme tutkusu",
    example: "Her wanderlust led her to explore distant lands.",
    exampleTranslation: "Gezme tutkusu onu uzak diyarları keşfetmeye yöneltti.",
  },
  {
    term: "Mellifluous",
    synonym: "Sweet-sounding",
    translation: "Tatlı sesli",
    example: "The singer's mellifluous voice captivated the audience.",
    exampleTranslation: "Şarkıcının tatlı sesi dinleyicileri büyüledi.",
  },
  {
    term: "Petrichor",
    synonym: "Rain scent",
    translation: "Yağmur kokusu",
    example: "The petrichor after the storm was refreshing.",
    exampleTranslation: "Fırtınadan sonraki yağmur kokusu ferahlatıcıydı.",
  },
  {
    term: "Luminous",
    synonym: "Radiant",
    translation: "Işıltılı",
    example: "The luminous moon lit up the night sky.",
    exampleTranslation: "Işıltılı ay gece gökyüzünü aydınlattı.",
  },
  {
    term: "Eloquent",
    synonym: "Articulate",
    translation: "Güzel konuşan",
    example: "His eloquent speech moved everyone to tears.",
    exampleTranslation: "Onun güzel konuşması herkesi gözyaşlarına boğdu.",
  },
  {
    term: "Resilient",
    synonym: "Strong",
    translation: "Dayanıklı",
    example: "She remained resilient despite all challenges.",
    exampleTranslation: "Tüm zorluklara rağmen dayanıklı kaldı.",
  },
]
