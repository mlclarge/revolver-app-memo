'use client'

import { useState, useEffect } from 'react'
import { Saynete, Comedien, SaynetesComedien, type Accessoire } from '@/lib/supabase'
import SaynetCard from './SaynetCard'
import SayneteMini from './SayneteMini'

// Formate le numéro de scène: 8 → "8a", 8.5 → "8b"
const formatNumero = (n: number | string, allNumeros?: (number | string)[]): string => {
  const isBis = String(n).includes('.')
  if (isBis) return `${String(n).split('.')[0]}b`
  const hasBis = allNumeros?.some(x => String(x).startsWith(String(n) + '.'))
  if (hasBis) return `${n}a`
  return String(n)
}

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
  const allNumeros = saynetes.map(s => s.numero)

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
                  {formatNumero(saynete.numero, allNumeros)}
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
          {/* Navigation contexte - Avant / Scène actuelle / Après */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 items-center">

            {/* Avant */}
            {prevSaynete ? (
              <button
                onClick={() => setSelectedSaynete(prevSaynete.numero)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-slate-600 bg-slate-800/50 hover:bg-slate-700/80 hover:border-slate-400 transition-all group text-left"
              >
                <span className="text-xs text-slate-400 group-hover:text-slate-200 flex items-center gap-1">
                  ◀ <span className="font-semibold">PRÉCÉDENTE</span>
                </span>
                <span className="text-2xl">{prevSaynete.emoji || '🎭'}</span>
                <span className="text-xs font-bold text-slate-300 text-center leading-tight line-clamp-2">
                  <span className="text-slate-500">#{formatNumero(prevSaynete.numero, allNumeros)}</span>{' '}
                  {prevSaynete.titre}
                </span>
              </button>
            ) : (
              <div className="flex items-center justify-center p-3 rounded-xl border border-slate-700/40 bg-slate-900/30">
                <span className="text-xs text-slate-600 italic">Début du spectacle</span>
              </div>
            )}

            {/* Scène actuelle — grand et mis en valeur */}
            {currentSaynete && (
              <div
                className="flex flex-col items-center gap-1 p-3 rounded-xl border-2"
                style={{ borderColor: '#8B3A5F', backgroundColor: 'rgba(139, 58, 95, 0.15)' }}
              >
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#C06090' }}>
                  ▶ EN COURS
                </span>
                <span className="text-4xl">{currentSaynete.emoji || '🎭'}</span>
                <span className="text-sm font-extrabold text-white text-center leading-tight">
                  <span className="opacity-60">#{formatNumero(currentSaynete.numero, allNumeros)}</span>{' '}
                  {currentSaynete.titre}
                </span>
              </div>
            )}

            {/* Après */}
            {nextSaynete ? (
              <button
                onClick={() => setSelectedSaynete(nextSaynete.numero)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-slate-600 bg-slate-800/50 hover:bg-slate-700/80 hover:border-slate-400 transition-all group text-right"
              >
                <span className="text-xs text-slate-400 group-hover:text-slate-200 flex items-center gap-1 self-end">
                  <span className="font-semibold">SUIVANTE</span> ▶
                </span>
                <span className="text-2xl">{nextSaynete.emoji || '🎭'}</span>
                <span className="text-xs font-bold text-slate-300 text-center leading-tight line-clamp-2">
                  <span className="text-slate-500">#{formatNumero(nextSaynete.numero, allNumeros)}</span>{' '}
                  {nextSaynete.titre}
                </span>
              </button>
            ) : (
              <div className="flex items-center justify-center p-3 rounded-xl border border-slate-700/40 bg-slate-900/30">
                <span className="text-xs text-slate-600 italic">Fin du spectacle</span>
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
                total={filteredSaynetes.filter(s => !String(s.numero).includes('.')).length}
                selectedComedien={selectedComedien}
                accessoiresData={accessoires.filter(a => a.saynete_id === currentSaynete.id)}
                allNumeros={allNumeros}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
