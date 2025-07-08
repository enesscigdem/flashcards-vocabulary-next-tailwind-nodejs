'use client'
import React from 'react'
import {useFlashcards} from '@/contexts/FlashcardContext'
import {useTheme} from 'next-themes'

export default function SettingsPanel(){
  const {settings, setSettings} = useFlashcards()
  const {setTheme} = useTheme()

  React.useEffect(() => {
    setTheme(settings.theme)
  }, [settings.theme, setTheme])
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="animations" className="text-sm">Animations</label>
        <input id="animations" type="checkbox" checked={settings.animations} onChange={e=>setSettings({animations:e.target.checked})} />
      </div>
      <div className="flex items-center justify-between">
        <label htmlFor="font" className="text-sm">Font Size</label>
        <select id="font" value={settings.fontSize} onChange={e=>setSettings({fontSize:e.target.value})} className="border rounded px-2 py-1 text-sm">
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <label htmlFor="grad" className="text-sm">Gradient</label>
        <select id="grad" value={settings.gradient} onChange={e=>setSettings({gradient:parseInt(e.target.value)})} className="border rounded px-2 py-1 text-sm">
          <option value={0}>Purple</option>
          <option value={1}>Green</option>
          <option value={2}>Orange</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <label htmlFor="theme" className="text-sm">Theme</label>
        <select id="theme" value={settings.theme} onChange={e=>{setSettings({theme:e.target.value});setTheme(e.target.value);}} className="border rounded px-2 py-1 text-sm">
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
    </div>
  )
}
