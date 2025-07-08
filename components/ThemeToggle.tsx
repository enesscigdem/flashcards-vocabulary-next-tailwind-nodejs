'use client'
import {useTheme} from 'next-themes'
import {Sun, Moon} from 'lucide-react'
import {useEffect, useState} from 'react'

export default function ThemeToggle(){
  const {theme,setTheme}=useTheme()
  const [mounted,setMounted]=useState(false)
  useEffect(()=>{setMounted(true)},[])
  if(!mounted) return null
  const toggle=()=>setTheme(theme==='light'?'dark':'light')
  return (
    <button
      aria-label="Tema değiştir"
      onClick={toggle}
      className="absolute top-4 right-4 p-2 w-10 h-10 rounded-full bg-background/50 backdrop-blur hover:bg-background/70 transition"
    >
      {theme==='light'?<Moon className="w-5 h-5"/>:<Sun className="w-5 h-5"/>}
    </button>
  )
}
