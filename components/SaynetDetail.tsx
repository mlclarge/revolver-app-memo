'use client'

import { useState, useEffect } from 'react'
import {
  Saynete,
  Comedien,
  fetchAccessoires,
  fetchCommentaires,
  addCommentaire,
  Accessoire,
  Commentaire,
  deleteCommentaire,
} from '@/lib/supabase'

interface SaynetDetailProps {
  saynete: Saynete
  comediens: Comedien[]
  onBack: () => void
}

export default function SaynetDetail({
  saynete,
  comediens,
  onBack,
}: SaynetDetailProps) {
  const [accessoires, setAccessoires] = useState<Accessoire[]>([])
  const [commentaires, setCommentaires] = useState<Commentaire[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentAuteur, setCommentAuteur] = useState('')
  const [commentType, setCommentType] = useState<'comedien' | 'mes'>('comedien')
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [acc, com] = await Promise.all([
          fetchAccessoires(saynete.id),
          fetchCommentaires(saynete.id),
        ])
        setAccessoires(acc)
        setCommentaires(com)
      } catch (err) {
        console.error('Error loading detail:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [saynete.id])

  const handleAddComment = async () => {
    if (!newComment.trim() || !commentAuteur.trim()) return
    try {
      await addCommentaire(saynete.id, commentAuteur, commentType, newComment)
      const updated = await fetchCommentaires(saynete.id)
      setCommentaires(updated)
      setNewComment('')
    } catch (err) {
      console.error('Error adding comment:', err)
    }
  }

  const handleDeleteComment = async (id: number) => {
    try {
      await deleteCommentaire(id)
      setCommentaires(c => c.filter(x => x.id !== id))
    } catch (err) {
      console.error('Error deleting comment:', err)
    }
  }

  const getComedienColor = (name: string) => {
    return comediens.find(c => c.nom === name)?.couleur || '#666'
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 overflow-y-auto">
      <button
        onClick={onBack}
        className="fixed top-6 left-6 z-50 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        ← Retour
      </button>

      <div className="max-w-4xl mx-auto p-8 pt-20">
        <div className="bg-slate-900 rounded-lg p-8 border border-purple-500/20">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-2">{saynete.titre}</h1>
            <p className="text-slate-400 text-lg">Saynète #{saynete.numero}</p>
          </div>

          {/* Jingle Audio */}
          {saynete.jingle && (
            <div className="mb-8 bg-blue-900/30 border border-blue-500/50 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">🎵 Jingle d'entrée</h2>
              <audio
                src={`/audio/${saynete.jingle}`}
                controls
                className="w-full"
                preload="metadata"
              />
              <p className="text-sm text-slate-400 mt-2">{saynete.jingle}</p>
            </div>
          )}

          {/* MES Document */}
          {saynete.mes_document && (
            <div className="mb-8 bg-green-900/30 border border-green-500/50 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">📄 Document MES</h2>
              <div className="flex items-center gap-4">
                <a
                  href={`/pdf/${saynete.mes_document}`}
                  target="_blank"
                  className="btn-primary inline-block"
                >
                  Ouvrir PDF
                </a>
                <p className="text-sm text-slate-400">{saynete.mes_document}</p>
              </div>
            </div>
          )}

          {/* Video */}
          {saynete.video_url && (
            <div className="mb-8 bg-red-900/30 border border-red-500/50 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">🎬 {saynete.video_url}</h2>
            </div>
          )}

          {/* Accessoires */}
          {accessoires.length > 0 && (
            <div className="mb-8 bg-purple-900/30 border border-purple-500/50 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">📦 Accessoires</h2>
              <div className="space-y-3">
                {accessoires.map((acc) => {
                  const comedien = comediens.find(c => c.id === acc.comedien_id)
                  return (
                    <div key={acc.id} className="flex items-start justify-between bg-slate-800/50 p-3 rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {comedien && (
                            <span
                              className="badge text-xs"
                              style={{ backgroundColor: comedien.couleur, color: 'white' }}
                            >
                              {comedien.nom}
                            </span>
                          )}
                          {acc.note && (
                            <span className="badge bg-slate-700 text-xs">{acc.note}</span>
                          )}
                        </div>
                        <p className="mt-2 font-semibold">{acc.objet}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Commentaires */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">💬 Commentaires</h2>

            {/* Add Comment */}
            <div className="mb-6 bg-slate-800/50 p-4 rounded-lg">
              <div className="grid gap-3">
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={commentAuteur}
                  onChange={(e) => setCommentAuteur(e.target.value)}
                  className="input-field"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setCommentType('comedien')}
                    className={`flex-1 btn-small ${
                      commentType === 'comedien'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700'
                    }`}
                  >
                    Comédien
                  </button>
                  <button
                    onClick={() => setCommentType('mes')}
                    className={`flex-1 btn-small ${
                      commentType === 'mes'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700'
                    }`}
                  >
                    MES
                  </button>
                </div>
                <textarea
                  placeholder="Votre commentaire..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="input-field min-h-20"
                />
                <button
                  onClick={handleAddComment}
                  className="btn-primary"
                >
                  Ajouter commentaire
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {commentaires.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-slate-800/50 border-l-4 p-4 rounded"
                  style={{ borderColor: comment.type === 'comedien' ? '#a855f7' : '#10b981' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold">{comment.auteur}</p>
                      <p className="text-xs text-slate-400">
                        {comment.type === 'comedien' ? '👤 Comédien' : '🎭 MES'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-slate-200">{comment.texte}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(comment.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
