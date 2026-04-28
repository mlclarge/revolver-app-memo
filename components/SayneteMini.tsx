'use client'

import { Saynete, Comedien, fetchSaynetesComediensBySaynete } from '@/lib/supabase'
import { useEffect, useState } from 'react'

interface SayneteMiniProps {
  saynete: Saynete
  comediens: Comedien[]
  highlight?: boolean
}

export default function SayneteMini({
  saynete,
  comediens,
  highlight = false,
}: SayneteMiniProps) {
  const [saynetesComediens, setSaynetesComediens] = useState<any[]>([])

  useEffect(() => {
    const loadComediens = async () => {
      const data = await fetchSaynetesComediensBySaynete(saynete.id)
      setSaynetesComediens(data)
    }
    loadComediens()
  }, [saynete.id])

  const sceneComediens = saynetesComediens
    .map(sc => comediens.find(c => c.id === sc.comedien_id))
    .filter(Boolean)

  return (
    <div
      className={`rounded-lg p-3 backdrop-blur border transition-all ${
        highlight
          ? 'border-purple-400/50 bg-purple-900/30'
          : 'border-slate-600/50 bg-slate-800/30 hover:bg-slate-800/50'
      }`}
    >
      {/* Numéro + Titre */}
      <div className="mb-2">
        <p className="text-xs text-slate-400">#{saynete.numero}</p>
        <h3 className="font-bold text-sm line-clamp-2">
          {saynete.emoji?.startsWith('/')
            ? <img src={saynete.emoji} alt="" className="h-5 w-auto object-contain mr-1 inline-block align-middle" />
            : <span className="text-lg mr-1">{saynete.emoji || '🎭'}</span>}
          {saynete.titre}
        </h3>
      </div>

      {/* Comédiens */}
      {sceneComediens.length > 0 && (
        <div className="mb-2">
          <div className="flex gap-1 flex-wrap">
            {sceneComediens.slice(0, 3).map((com) => (
              <span
                key={com?.id}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: com?.couleur + '40',
                  color: com?.couleur,
                }}
                title={com?.nom}
              >
                {com?.nom.substring(0, 3)}
              </span>
            ))}
            {sceneComediens.length > 3 && (
              <span className="text-xs px-2 py-0.5 text-slate-400">
                +{sceneComediens.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="flex gap-1 text-xs">
        {saynete.jingle && <span className="text-blue-300">🎵</span>}
        {saynete.mes_document && <span className="text-green-300">📄</span>}
        {saynete.video_url && <span className="text-red-300">🎬</span>}
      </div>
    </div>
  )
}
