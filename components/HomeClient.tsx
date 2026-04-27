'use client'

import { useState } from 'react'
import { Saynete, Comedien, SaynetesComedien, Accessoire } from '@/lib/supabase'
import TimelineView from './TimelineView'

interface HomeClientProps {
  saynetes: Saynete[]
  comediens: Comedien[]
  saynetesComediens: SaynetesComedien[]
  accessoires: Accessoire[]
}

export default function HomeClient({
  saynetes,
  comediens,
  saynetesComediens,
  accessoires,
}: HomeClientProps) {
  const [selectedComedien, setSelectedComedien] = useState<string | null>(null)

  const filteredSaynetes = selectedComedien
    ? saynetes.filter((saynete) => {
        const comedienId = comediens.find(c => c.nom === selectedComedien)?.id
        
        // Check if comédien est acteur (saynetes_comediens)
        const isActor = saynetesComediens.some(
          sc => sc.saynete_id === saynete.id && sc.comedien_id === comedienId
        )
        
        // Check if comédien a des accessoires (mise en scène)
        const hasMES = accessoires.some(
          a => a.saynete_id === saynete.id && a.comedien_id === comedienId
        )
        
        return isActor || hasMES
      })
    : saynetes

  return (
    <main className="w-full h-screen overflow-hidden">
      <TimelineView
        saynetes={saynetes}
        comediens={comediens}
        saynetesComediens={saynetesComediens}
        allComediens={comediens}
        accessoires={accessoires}
        selectedComedien={selectedComedien}
        onSelectComedien={setSelectedComedien}
      />
    </main>
  )
}
