'use client'

import { useState, useEffect } from 'react'
import { Saynete, Comedien, fetchAccessoires, fetchCommentaires, addCommentaire, deleteCommentaire } from '@/lib/supabase'

const formatNumero = (n: number, allNumeros?: number[]): string => {
  if (n % 1 === 0.5) return `${Math.floor(n)}b`
  if (allNumeros?.includes(n + 0.5)) return `${n}a`
  return String(n)
}

interface SaynetCardProps {
  saynete: Saynete
  comediens: (Comedien | undefined)[]
  allComediens: Comedien[]
  index: number
  total: number
  selectedComedien?: string | null
  accessoiresData?: any[]
  allNumeros?: number[]
}

export default function SaynetCard({
  saynete,
  comediens,
  allComediens,
  index,
  total,
  selectedComedien = null,
  accessoiresData = [],
  allNumeros,
}: SaynetCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [accessoires, setAccessoires] = useState<any[]>(accessoiresData)
  const [commentaires, setCommentaires] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentAuteur, setCommentAuteur] = useState('')
  const [commentType, setCommentType] = useState<'comedien' | 'mes'>('comedien')
  const [loading, setLoading] = useState(false)

  // Mettre à jour les accessoires quand la saynète change ou quand accessoiresData change
  useEffect(() => {
    setAccessoires(accessoiresData || [])
    setCommentaires([])
  }, [saynete.id, accessoiresData])

  useEffect(() => {
    if (expanded) {
      loadData()
    }
  }, [expanded, saynete.id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [acc, com] = await Promise.all([
        fetchAccessoires(saynete.id),
        fetchCommentaires(saynete.id),
      ])
      setAccessoires(acc)
      setCommentaires(com)
    } catch (err) {
      console.error('Error loading:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !commentAuteur.trim()) return
    try {
      await addCommentaire(saynete.id, commentAuteur, commentType, newComment)
      await loadData()
      setNewComment('')
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleDeleteComment = async (id: number) => {
    try {
      await deleteCommentaire(id)
      setCommentaires(c => c.filter(x => x.id !== id))
    } catch (err) {
      console.error('Error:', err)
    }
  }

  // Get comédiens avec accessoires (MES - mise en scène)
  const mesComedienIds = accessoires
    .map(a => a.comedien_id)
    .filter((id, idx, arr) => id && arr.indexOf(id) === idx)

  // Get cast comédiens (jouent) = Dans saynetes_comediens MAIS PAS dans les accessoires
  const castComediens = comediens.filter(com => !mesComedienIds.includes(com?.id))

  // Get MES comédiens
  const mesComediens = mesComedienIds
    .map(id => allComediens.find(c => c.id === id))
    .filter(Boolean)

  return (
    <div className={`saynete-card transition-all duration-300 overflow-y-auto pointer-events-auto ${expanded ? 'max-h-none' : 'max-h-screen'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="inline-block px-3 py-1 rounded-full text-sm font-bold mb-2" style={{ backgroundColor: '#8B3A5F', color: 'white' }}>
            #{formatNumero(saynete.numero, allNumeros)} / {total}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-4xl md:text-5xl mr-3">{saynete.emoji || '🎭'}</span>
            {saynete.titre}
          </h2>
          <p className="text-sm text-slate-400">Saynète #{formatNumero(saynete.numero, allNumeros)}</p>
        </div>
      </div>

      {/* Cast - Comédiens qui jouent (sans accessoires) */}
      {castComediens.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-2">🎭 <span className="font-bold">ACTEUR</span> (joue la saynète):</p>
          <div className="flex gap-2 flex-wrap">
            {castComediens.map((com) => (
              <div
                key={com?.id}
                className="badge text-xs px-3 py-1 border-2 font-semibold"
                style={{
                  backgroundColor: com?.couleur + '40',
                  color: com?.couleur,
                  borderColor: com?.couleur
                }}
              >
                {com?.nom}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audio - Jingle d'entrée EN PREMIER */}
      {saynete.jingle && (
        <div className="mb-4 bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 pointer-events-auto">
          <p className="text-xs text-blue-300 mb-2">🎵 Jingle d'entrée</p>
          <audio
            src={`/audio/${saynete.jingle}`}
            controls
            className="w-full h-12"
            preload="metadata"
            onError={(e) => console.error('Audio error:', e)}
          />
        </div>
      )}

      {/* DÉCOR - Comédiens en rôle de décor */}
      {mesComediens.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-2">🎬 <span className="font-bold">DÉCOR</span></p>
          <div className="space-y-2">
            {mesComediens.map((com) => {
              const comAccessoires = accessoires.filter(a => a.comedien_id === com?.id)
              return (
                <div key={com?.id} className="bg-slate-900/50 border border-slate-700 rounded p-2">
                  <div
                    className="text-xs px-2 py-1 rounded inline-block mb-1"
                    style={{
                      backgroundColor: com?.couleur + '30',
                      color: com?.couleur,
                    }}
                  >
                    {com?.nom}
                  </div>
                  {comAccessoires.length > 0 && (
                    <div className="text-xs text-slate-300 ml-2">
                      {comAccessoires.map(acc => acc.objet).join(', ')}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Vidéo */}
      {saynete.video_url && (
        <div className="mb-4 bg-red-900/30 border border-red-500/50 rounded-lg p-4 pointer-events-auto">
          <p className="text-xs text-red-300 mb-2">🎬 Vidéo gestuelle</p>
          <video
            src={`/video/${saynete.video_url}`}
            controls
            className="w-full h-auto rounded"
            preload="metadata"
            onError={(e) => {
              console.error('Video error:', e, {
                src: `/video/${saynete.video_url}`,
                error: e.currentTarget.error?.message
              })
            }}
            onLoadedMetadata={() => console.log('✅ Vidéo chargée:', saynete.video_url)}
          />
          <p className="text-xs text-slate-400 mt-2">{saynete.video_url}</p>
        </div>
      )}

      {/* Toggle Détails */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="btn-primary w-full mt-4 mb-4 text-white"
        style={{ backgroundColor: '#8B3A5F' }}
      >
        {expanded ? '▼ Fermer détails' : '▶ Voir détails'}
      </button>

      {/* Détails (expandable) */}
      {expanded && (
        <div className="space-y-4 mt-4 pt-4 border-t border-slate-700">
          {/* PDF */}
          {saynete.mes_document && (
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
              <p className="text-xs text-green-300 mb-2">📄 Document MES</p>
              <a
                href={`/pdf/${saynete.mes_document}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm inline-block"
              >
                Ouvrir PDF →
              </a>
              <p className="text-xs text-slate-400 mt-2">{saynete.mes_document}</p>
            </div>
          )}

          {/* Accessoires - Décor, mise en scène, vos notes */}
          {accessoires.length > 0 && (
            <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4">
              <p className="text-xs text-purple-300 mb-3 font-bold">🎬 Décor, mise en scène, vos notes</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {accessoires.map((acc) => {
                  const com = allComediens.find(c => c.id === acc.comedien_id)
                  return (
                    <div key={acc.id} className="flex items-start gap-2 bg-slate-800/50 p-2 rounded text-sm">
                      <div className="flex-1">
                        {com && (
                          <span
                            className="inline-block px-2 py-1 rounded text-xs mr-2 mb-1"
                            style={{ backgroundColor: com.couleur, color: 'white' }}
                          >
                            {com.nom}
                          </span>
                        )}
                        <p className="font-medium">{acc.objet}</p>
                      </div>
                      {acc.note && <span className="text-xs text-slate-400 mt-1">{acc.note}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Commentaires */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-slate-300 mb-3 font-bold">💬 Commentaires</p>

            {/* Add Comment */}
            <div className="bg-slate-900/50 p-3 rounded-lg mb-3 space-y-2">
              <input
                type="text"
                placeholder="Votre nom"
                value={commentAuteur}
                onChange={(e) => setCommentAuteur(e.target.value)}
                className="input-field text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setCommentType('comedien')}
                  className={`flex-1 btn-small text-xs ${
                    commentType === 'comedien' ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                >
                  Comédien
                </button>
                <button
                  onClick={() => setCommentType('mes')}
                  className={`flex-1 btn-small text-xs ${
                    commentType === 'mes' ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                >
                  MES
                </button>
              </div>
              <textarea
                placeholder="Votre commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input-field text-sm h-16"
              />
              <button onClick={handleAddComment} className="btn-primary w-full text-sm">
                Ajouter
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {commentaires.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-slate-900/50 border-l-4 p-3 rounded text-sm"
                  style={{
                    borderColor: comment.type === 'comedien' ? '#a855f7' : '#10b981',
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-bold text-xs">{comment.auteur}</p>
                      <p className="text-xs text-slate-400">
                        {comment.type === 'comedien' ? '👤' : '🎭'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-slate-200 text-xs">{comment.texte}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
