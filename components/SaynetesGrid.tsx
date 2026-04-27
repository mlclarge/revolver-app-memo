'use client'

import { Saynete, Comedien, SaynetesComedien } from '@/lib/supabase'

interface SaynetesGridProps {
  saynetes: Saynete[]
  comediens: Comedien[]
  saynetesComediens: SaynetesComedien[]
  onSelectSaynete: (saynete: Saynete) => void
}

export default function SaynetesGrid({
  saynetes,
  comediens,
  saynetesComediens,
  onSelectSaynete,
}: SaynetesGridProps) {
  const getComediensForSaynete = (sayneteId: number) => {
    return saynetesComediens
      .filter(sc => sc.saynete_id === sayneteId)
      .map(sc => comediens.find(c => c.id === sc.comedien_id))
      .filter(Boolean)
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {saynetes.map((saynete) => {
          const comediensInSaynete = getComediensForSaynete(saynete.id)
          return (
            <div
              key={saynete.id}
              onClick={() => onSelectSaynete(saynete)}
              className="saynete-card cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-3xl font-bold text-purple-400">#{saynete.numero}</div>
                  <h2 className="text-xl font-bold mt-2 group-hover:text-purple-300 transition-colors">
                    {saynete.titre}
                  </h2>
                </div>
              </div>

              {comediensInSaynete.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-2">Comédiens:</p>
                  <div className="flex gap-2 flex-wrap">
                    {comediensInSaynete.map((comedien) => (
                      <div
                        key={comedien?.id}
                        className="badge text-xs"
                        style={{ backgroundColor: comedien?.couleur + '40', color: comedien?.couleur }}
                      >
                        {comedien?.nom}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 flex-wrap text-xs">
                {saynete.jingle && (
                  <span className="badge bg-blue-500/20 text-blue-300">🎵 Jingle</span>
                )}
                {saynete.mes_document && (
                  <span className="badge bg-green-500/20 text-green-300">📄 MES</span>
                )}
                {saynete.video_url && (
                  <span className="badge bg-red-500/20 text-red-300">🎬 Vidéo</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
