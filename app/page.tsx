'use client'
import FlashcardViewer from '@/components/FlashcardViewer'
import ThemeToggle from '@/components/ThemeToggle'

export default function Page(){
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-700 via-fuchsia-800 to-indigo-900 relative">
      <ThemeToggle />
      <FlashcardViewer />
    </div>
  )
}
