'use client'

import { useState, useEffect } from 'react'
import {
  fetchSaynetes,
  fetchComediens,
  fetchSaynetesComediens,
  type Saynete,
  type Comedien,
  type SaynetesComedien,
  type Accessoire,
} from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import SayneteFeed from '@/components/SayneteFeed'
import TimelineView from '@/components/TimelineView'

export default function Home() {
  const [saynetes, setSaynetes] = useState<Saynete[]>([])
  const [comediens, setComediens] = useState<Comedien[]>([])
  const [saynetesComediens, setSaynetesComediens] = useState<SaynetesComedien[]>([])
  const [accessoires, setAccessoires] = useState<Accessoire[]>([])
  const [selectedComedien, setSelectedComedien] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [s, c, sc] = await Promise.all([
          fetchSaynetes(),
          fetchComediens(),
          fetchSaynetesComediens(),
        ])
        setSaynetes(s)
        setComediens(c)
        setSaynetesComediens(sc)
        
        // Load all accessoires
        const { data: acc, error: accError } = await supabase
          .from('accessoires')
          .select('*')
        if (accError) throw accError
        setAccessoires(acc as Accessoire[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

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

  // DEBUG: Log filter state
  useEffect(() => {
    if (selectedComedien) {
      const comedienId = comediens.find(c => c.nom === selectedComedien)?.id
      const actorIn = saynetes.filter(s => 
        saynetesComediens.some(sc => sc.saynete_id === s.id && sc.comedien_id === comedienId)
      ).map(s => s.numero)
      const mesIn = saynetes.filter(s =>
        accessoires.some(a => a.saynete_id === s.id && a.comedien_id === comedienId)
      ).map(s => s.numero)
    }
  }, [selectedComedien, filteredSaynetes.length])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-xl">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 max-w-md">
          <h1 className="text-xl font-bold mb-2">Erreur</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

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
