'use client'

import { useState, useRef, useEffect } from 'react'
import { Saynete, Comedien, SaynetesComedien, fetchAccessoires, fetchCommentaires, addCommentaire, type Accessoire } from '@/lib/supabase'
import SaynetCard from './SaynetCard'

interface SayneteFeedProps {
  saynetes: Saynete[]
  comediens: Comedien[]
  saynetesComediens: SaynetesComedien[]
  allComediens: Comedien[]
  accessoires: Accessoire[]
  selectedComedien: string | null
  onSelectComedien: (comedien: string | null) => void
}

export default function SayneteFeed({
  saynetes,
  comediens,
  saynetesComediens,
  allComediens,
  accessoires,
  selectedComedien,
  onSelectComedien,
}: SayneteFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null)

  // DEBUG: Log filter button clicks
  const handleComedienClick = (comedienNom: string | null) => {
    console.log('👆 FILTER CLICKED:', comedienNom)
    onSelectComedien(comedienNom)
  }

  const getComediensForSaynete = (sayneteId: number) => {
    return saynetesComediens
      .filter(sc => sc.saynete_id === sayneteId)
      .map(sc => comediens.find(c => c.id === sc.comedien_id))
      .filter(Boolean)
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header Filtre */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-purple-500/20 py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              🎭 LE REVOLVER
            </h1>
            <span className="text-sm text-slate-400">{saynetes.length} saynètes</span>
          </div>

          {/* Filtres comédiens */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => handleComedienClick(null)}
              className={`btn-small whitespace-nowrap ${
                selectedComedien === null
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Tous
            </button>

            {allComediens.map((comedien) => (
              <button
                key={comedien.id}
                onClick={() => handleComedienClick(comedien.nom)}
                className={`btn-small whitespace-nowrap transition-all ${
                  selectedComedien === comedien.nom
                    ? 'text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
                style={
                  selectedComedien === comedien.nom
                    ? { backgroundColor: comedien.couleur, color: 'white' }
                    : { borderColor: comedien.couleur, borderWidth: '1px' }
                }
              >
                {comedien.nom}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory"
        style={{
          scrollBehavior: 'smooth',
          scrollSnapType: 'y mandatory',
        }}
      >
        {saynetes.map((saynete, index) => (
          <div
            key={saynete.id}
            className="w-full min-h-screen snap-center flex items-center justify-center py-4"
          >
            <div className="w-full max-w-2xl px-4">
              <SaynetCard
                saynete={saynete}
                comediens={getComediensForSaynete(saynete.id)}
                allComediens={comediens}
                index={index + 1}
                total={saynetes.length}
                selectedComedien={selectedComedien}
                accessoiresData={accessoires.filter(a => a.saynete_id === saynete.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
