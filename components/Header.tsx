'use client'

import { Comedien } from '@/lib/supabase'

interface HeaderProps {
  comediens: Comedien[]
  selectedComedien: string | null
  onSelectComedien: (comedien: string | null) => void
  totalSaynetes: number
  filteredCount: number
}

export default function Header({
  comediens,
  selectedComedien,
  onSelectComedien,
  totalSaynetes,
  filteredCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-purple-500/20 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              🎭 LE REVOLVER
            </h1>
            <p className="text-slate-400 mt-1">Aide à la mémorisation - Mémo Troupe</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">
              {filteredCount === totalSaynetes 
                ? `${totalSaynetes} saynètes` 
                : `${filteredCount} sur ${totalSaynetes}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => onSelectComedien(null)}
            className={`btn-small ${
              selectedComedien === null
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Tous
          </button>

          {comediens.map((comedien) => (
            <button
              key={comedien.id}
              onClick={() => onSelectComedien(comedien.nom)}
              className={`btn-small transition-all ${
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
    </header>
  )
}
