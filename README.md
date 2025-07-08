# Flashcard App

A polished, production-ready flashcard application built with Next.js 14, featuring smooth animations, swipe gestures, and text-to-speech functionality.

## Features

- 🎯 **Smooth Animations**: Powered by Framer Motion with spring transitions
- 📱 **Mobile-First Design**: Optimized for touch interactions and responsive across all devices
- 🎵 **Text-to-Speech**: Built-in pronunciation using the Web Speech API
- 👆 **Swipe Gestures**: Navigate cards with touch swipes or mouse drag
- ♿ **Accessible**: Semantic HTML, ARIA attributes, and keyboard navigation
- 🎨 **Beautiful UI**: Gradient backgrounds, smooth shadows, and crisp typography
- ⚡ **Performance Optimized**: Lazy loading and minimal bundle size

## Tech Stack

- **Next.js 14** (App Router)
- **React 18+**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Lucide React** (icons)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd flashcard-app
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

\`\`\`bash
npm run build
npm run start
\`\`\`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Manual Deployment

\`\`\`bash
npm run build
npm run start
\`\`\`

## Project Structure

\`\`\`
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx          # Main flashcard component
├── hooks/
│   ├── use-speech.ts     # Text-to-speech functionality
│   └── use-swipe.ts      # Swipe gesture detection
├── lib/
│   └── utils.ts          # Shared utility functions
└── README.md
\`\`\`

## Backend API

Flashcards are loaded from a Node.js backend that listens on [http://localhost:4000](http://localhost:4000). Start it from the `backend/` directory:

```bash
cd backend
npm install
npm start
```

Make sure the backend is running on port **4000** when using the frontend at [http://localhost:3000](http://localhost:3000).

The API exposes:

- `GET /api/words` – list all flashcards
- `GET /api/words/:id` – get a single flashcard by `id`


### Styling

The app uses Tailwind CSS. Modify classes in components or extend the theme in \`tailwind.config.ts\`.

## Browser Support

- Modern browsers with ES2020+ support
- Text-to-Speech requires browsers with Web Speech API support
- Touch gestures work on all mobile devices

## Performance

- Lazy-loaded Framer Motion components
- Optimized animations with hardware acceleration
- Minimal JavaScript bundle size
- Responsive images and assets

## Accessibility

- Semantic HTML structure
- ARIA labels and live regions
- Keyboard navigation support
- Screen reader compatible
- High contrast ratios

## License

MIT License - feel free to use this project for personal or commercial purposes.
\`\`\`
