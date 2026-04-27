'use client'

import { useState, useEffect } from 'react'
import { Saynete, Comedien, SaynetesComedien, type Accessoire } from '@/lib/supabase'
import SaynetCard from './SaynetCard'
import SayneteMini from './SayneteMini'

interface TimelineViewProps {
  saynetes: Saynete[]
  comediens: Comedien[]
  saynetesComediens: SaynetesComedien[]
  allComediens: Comedien[]
  accessoires: Accessoire[]
  selectedComedien: string | null
  onSelectComedien: (comedien: string | null) => void
}

export default function TimelineView({
  saynetes,
  comediens,
  saynetesComediens,
  allComediens,
  accessoires,
  selectedComedien,
  onSelectComedien,
}: TimelineViewProps) {
  const [selectedSaynete, setSelectedSaynete] = useState<number>(1)

  const handleComedienClick = (comedienNom: string | null) => {
    onSelectComedien(comedienNom)
  }

  const getComediensForSaynete = (sayneteId: number) => {
    return saynetesComediens
      .filter(sc => sc.saynete_id === sayneteId)
      .map(sc => comediens.find(c => c.id === sc.comedien_id))
      .filter(Boolean)
  }

  // Filtrer les saynètes basées sur le comédien sélectionné
  const filteredSaynetes = selectedComedien
    ? saynetes.filter((saynete) => {
        const comedienId = comediens.find(c => c.nom === selectedComedien)?.id
        
        // Check if comédien joue (saynetes_comediens)
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



  // Si le comédien est filtré et la saynète courante n'est plus dans la liste, sélectionner la première
  useEffect(() => {
    if (!filteredSaynetes.find(s => s.numero === selectedSaynete)) {
      if (filteredSaynetes.length > 0) {
        setSelectedSaynete(filteredSaynetes[0].numero)
      }
    }
  }, [selectedComedien, filteredSaynetes.length])

  const currentSaynete = filteredSaynetes.find(s => s.numero === selectedSaynete)
  const currentIndex = filteredSaynetes.findIndex(s => s.numero === selectedSaynete)
  const prevSaynete = currentIndex > 0 ? filteredSaynetes[currentIndex - 1] : null
  const nextSaynete = currentIndex < filteredSaynetes.length - 1 ? filteredSaynetes[currentIndex + 1] : null

  return (
    <div className="w-full h-screen flex flex-col" style={{ backgroundColor: '#8B3A5F' }}>
      {/* Filtre Comédiens - Mobile First */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b py-3 px-3 md:px-4" style={{ borderBottomColor: 'rgba(139, 58, 95, 0.3)' }}>
        <div className="max-w-7xl mx-auto space-y-2">
          {/* Bouton "Tous" en exergue */}
          <button
            onClick={() => handleComedienClick(null)}
            className={`w-full btn-small font-bold text-sm transition-all ${
              selectedComedien === null
                ? 'text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:text-white'
            }`}
            style={selectedComedien === null ? { backgroundColor: '#8B3A5F', boxShadow: '0 0 20px rgba(139, 58, 95, 0.5)' } : {}}
          >
            🎬 TOUTES LES SAYNÈTES
          </button>

          {/* Autres comédiens - Grille responsive mobile first */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {allComediens.map((comedien) => (
              <button
                key={comedien.id}
                onClick={() => handleComedienClick(comedien.nom)}
                className={`btn-small text-xs whitespace-nowrap transition-all ${
                  selectedComedien === comedien.nom
                    ? 'text-white font-bold shadow-lg'
                    : 'text-slate-300 hover:text-white'
                }`}
                style={
                  selectedComedien === comedien.nom
                    ? { backgroundColor: comedien.couleur, color: 'white' }
                    : { borderColor: comedien.couleur, borderWidth: '1px' }
                }
                title={comedien.nom}
              >
                {comedien.nom}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Navigation - Carousel avec flèches */}
      <div className="bg-slate-800/50 border-b px-2 md:px-4 py-3" style={{ borderBottomColor: 'rgba(139, 58, 95, 0.3)' }}>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Flèche gauche */}
          <button
            onClick={() => {
              const currentIdx = filteredSaynetes.findIndex(s => s.numero === selectedSaynete)
              if (currentIdx > 0) setSelectedSaynete(filteredSaynetes[currentIdx - 1].numero)
            }}
            className="flex-shrink-0 p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white transition-all text-lg md:text-xl font-bold"
            title="Scène précédente"
          >
            ◀
          </button>

          {/* Carousel */}
          <div className="flex-1 overflow-x-auto scroll-smooth">
            <div className="flex gap-1 min-w-max px-1">
              {filteredSaynetes.map((saynete) => (
                <button
                  key={saynete.id}
                  onClick={() => setSelectedSaynete(saynete.numero)}
                  className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                    selectedSaynete === saynete.numero
                      ? 'text-white shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  style={selectedSaynete === saynete.numero ? { backgroundColor: '#8B3A5F', boxShadow: '0 0 15px rgba(139, 58, 95, 0.5)' } : {}}
                  title={saynete.titre}
                >
                  {saynete.numero}
                </button>
              ))}
            </div>
          </div>

          {/* Flèche droite */}
          <button
            onClick={() => {
              const currentIdx = filteredSaynetes.findIndex(s => s.numero === selectedSaynete)
              if (currentIdx < filteredSaynetes.length - 1) setSelectedSaynete(filteredSaynetes[currentIdx + 1].numero)
            }}
            className="flex-shrink-0 p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white transition-all text-lg md:text-xl font-bold"
            title="Scène suivante"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Scènes filtrées list */}
      {selectedComedien && (
        <div className="bg-slate-900/80 border-b px-4 py-2" style={{ borderBottomColor: 'rgba(139, 58, 95, 0.3)' }}>
          <p className="text-xs text-slate-400">
            <span className="font-semibold" style={{ color: '#8B3A5F' }}>{selectedComedien}</span> joue dans{' '}
            <span className="font-bold" style={{ color: '#A85090' }}>{filteredSaynetes.length}</span> scènes :{'  '}
            <span className="text-slate-200 font-mono">
              {filteredSaynetes.map(s => s.numero).join(', ')}
            </span>
          </p>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6">
          {/* Avant / Après Context - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {/* Avant */}
            {prevSaynete ? (
              <div
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => setSelectedSaynete(prevSaynete.numero)}
              >
                <p className="text-xs text-slate-400 mb-2">◀ Avant</p>
                <SayneteMini saynete={prevSaynete} comediens={comediens} />
              </div>
            ) : (
              <div className="text-center text-slate-600 hidden md:block">
                <p className="text-xs">─ Début ─</p>
              </div>
            )}

            {/* Current (highlight) */}
            {currentSaynete && (
              <div className="border-2 rounded-lg p-2" style={{ borderColor: 'rgba(139, 58, 95, 0.5)', backgroundColor: 'rgba(139, 58, 95, 0.1)' }}>
                <p className="text-xs font-bold mb-2" style={{ color: '#8B3A5F' }}>● FOCUS</p>
                <SayneteMini saynete={currentSaynete} comediens={comediens} highlight />
              </div>
            )}

            {/* Après */}
            {nextSaynete ? (
              <div
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => setSelectedSaynete(nextSaynete.numero)}
              >
                <p className="text-xs text-slate-400 mb-2">Après ▶</p>
                <SayneteMini saynete={nextSaynete} comediens={comediens} />
              </div>
            ) : (
              <div className="text-center text-slate-600 hidden md:block">
                <p className="text-xs">─ Fin ─</p>
              </div>
            )}
          </div>

          {/* Détail complet */}
          {currentSaynete && (
            <div className="border-t border-slate-700 pt-4 md:pt-6">
              <SaynetCard
                saynete={currentSaynete}
                comediens={getComediensForSaynete(currentSaynete.id)}
                allComediens={comediens}
                index={currentIndex + 1}
                total={filteredSaynetes.length}
                selectedComedien={selectedComedien}
                accessoiresData={accessoires.filter(a => a.saynete_id === currentSaynete.id)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
