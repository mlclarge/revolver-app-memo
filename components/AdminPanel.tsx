'use client'

import { useState } from 'react'
import {
  Saynete,
  Comedien,
  SaynetesComedien,
  Accessoire,
  addAccessoire,
  updateAccessoire,
  deleteAccessoire,
  addSaynetesComedien,
  deleteSaynetesComedien,
  updateComedien,
} from '@/lib/supabase'

interface AdminPanelProps {
  initialSaynetes: Saynete[]
  initialComediens: Comedien[]
  initialSaynetesComediens: SaynetesComedien[]
  initialAccessoires: Accessoire[]
}

type Tab = 'saynetes' | 'comediens'

// ─── Sous-composant : édition d'un accessoire ───────────────────────────────

function AccessoireRow({
  acc,
  comediens,
  onUpdate,
  onDelete,
}: {
  acc: Accessoire
  comediens: Comedien[]
  onUpdate: (id: number, updates: Partial<Accessoire>) => Promise<void>
  onDelete: (id: number) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [objet, setObjet] = useState(acc.objet)
  const [note, setNote] = useState(acc.note ?? '')
  const [comedienId, setComedienId] = useState<number | ''>(acc.comedien_id ?? '')
  const [saving, setSaving] = useState(false)

  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      await onUpdate(acc.id, {
        objet,
        note: note || null,
        comedien_id: comedienId === '' ? null : comedienId,
      })
      setEditing(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : (err as any)?.message ?? JSON.stringify(err))
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    const comedien = comediens.find(c => c.id === acc.comedien_id)
    return (
      <div className="flex items-center gap-2 py-1 group">
        <span className="flex-1 text-sm">
          <span className="font-medium text-white">{acc.objet}</span>
          {acc.note && <span className="text-slate-400 ml-1">({acc.note})</span>}
          {comedien && (
            <span
              className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold text-slate-900"
              style={{ backgroundColor: comedien.couleur }}
            >
              {comedien.nom}
            </span>
          )}
          {!comedien && (
            <span className="ml-2 text-slate-500 text-xs italic">partagé / sans attribution</span>
          )}
        </span>
        <button
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 text-xs text-blue-400 hover:text-blue-300 transition-opacity px-2 py-0.5 rounded border border-blue-800 hover:border-blue-600"
        >
          ✏️ modifier
        </button>
        <button
          onClick={() => onDelete(acc.id)}
          className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-300 transition-opacity px-2 py-0.5 rounded border border-red-800 hover:border-red-600"
        >
          🗑️
        </button>
      </div>
    )
  }

  return (
    <div className="bg-slate-700/60 rounded-lg p-3 mb-1 border border-slate-600">
      <div className="flex gap-2 mb-2">
        <input
          className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
          value={objet}
          onChange={e => setObjet(e.target.value)}
          placeholder="Nom de l'accessoire"
        />
        <input
          className="w-32 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Note"
        />
      </div>
      <div className="mb-2">
        <label className="text-xs text-slate-400 block mb-1">Attribué à :</label>
        <select
          className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
          value={comedienId}
          onChange={e => setComedienId(e.target.value === '' ? '' : Number(e.target.value))}
        >
          <option value="">— partagé / sans attribution —</option>
          {comediens.map(c => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => setEditing(false)}
          className="px-4 py-1.5 text-sm rounded bg-slate-600 hover:bg-slate-500 text-white"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !objet.trim()}
          className="px-4 py-1.5 text-sm font-semibold rounded bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white"
        >
          {saving ? 'Enregistrement…' : '✓ Enregistrer'}
        </button>
      </div>
      {saveError && (
        <p className="mt-2 text-xs text-red-400">⚠️ {saveError}</p>
      )}
    </div>
  )
}

// ─── Sous-composant : ajout d'un accessoire ─────────────────────────────────

function AddAccessoireForm({
  sayneteId,
  comediens,
  onAdded,
}: {
  sayneteId: number
  comediens: Comedien[]
  onAdded: (acc: Accessoire) => void
}) {
  const [open, setOpen] = useState(false)
  const [objet, setObjet] = useState('')
  const [note, setNote] = useState('')
  const [comedienId, setComedienId] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)

  const [addError, setAddError] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!objet.trim()) return
    setSaving(true)
    setAddError(null)
    try {
      const result = await addAccessoire(
        sayneteId,
        comedienId === '' ? null : comedienId,
        objet.trim(),
        note.trim() || null
      )
      if (result && result[0]) {
        onAdded(result[0] as Accessoire)
      }
      setObjet('')
      setNote('')
      setComedienId('')
      setOpen(false)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : (err as any)?.message ?? JSON.stringify(err))
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-1 text-xs text-slate-400 hover:text-white border border-dashed border-slate-600 hover:border-slate-400 rounded px-3 py-1 transition-colors"
      >
        + Ajouter un accessoire
      </button>
    )
  }

  return (
    <div className="mt-2 bg-slate-700/60 rounded-lg p-3 border border-slate-500">
      <div className="flex gap-2 mb-2">
        <input
          className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
          value={objet}
          onChange={e => setObjet(e.target.value)}
          placeholder="Nom de l'accessoire *"
          autoFocus
        />
        <input
          className="w-32 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Note"
        />
      </div>
      <div className="mb-2">
        <label className="text-xs text-slate-400 block mb-1">Attribué à :</label>
        <select
          className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
          value={comedienId}
          onChange={e => setComedienId(e.target.value === '' ? '' : Number(e.target.value))}
        >
          <option value="">— partagé / sans attribution —</option>
          {comediens.map(c => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => setOpen(false)}
          className="px-4 py-1.5 text-sm rounded bg-slate-600 hover:bg-slate-500 text-white"
        >
          Annuler
        </button>
        <button
          onClick={handleAdd}
          disabled={saving || !objet.trim()}
          className="px-4 py-1.5 text-sm font-semibold rounded bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white"
        >
          {saving ? 'Enregistrement…' : '✓ Enregistrer'}
        </button>
      </div>
      {addError && (
        <p className="mt-2 text-xs text-red-400">⚠️ {addError}</p>
      )}
    </div>
  )
}

// ─── Sous-composant : carte d'une saynète ────────────────────────────────────

function SayneteAdminCard({
  saynete,
  comediens,
  castLinks,
  accessoiresInit,
  onCastAdd,
  onCastRemove,
}: {
  saynete: Saynete
  comediens: Comedien[]
  castLinks: SaynetesComedien[]
  accessoiresInit: Accessoire[]
  onCastAdd: (sayneteId: number, comedienId: number) => Promise<void>
  onCastRemove: (linkId: number) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [accessoires, setAccessoires] = useState<Accessoire[]>(accessoiresInit)
  const [addCastId, setAddCastId] = useState<number | ''>('')
  const [castSaving, setCastSaving] = useState(false)

  // Comédiens déjà dans le cast
  const castComedienIds = castLinks.map(l => l.comedien_id)
  // Comédiens qui ont des accessoires dans cette saynète
  const mesComedienIds = accessoires.map(a => a.comedien_id).filter(Boolean) as number[]

  const handleUpdateAcc = async (id: number, updates: Partial<Accessoire>) => {
    await updateAccessoire(id, updates)
    setAccessoires(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  const handleDeleteAcc = async (id: number) => {
    await deleteAccessoire(id)
    setAccessoires(prev => prev.filter(a => a.id !== id))
  }

  const handleAddAcc = (acc: Accessoire) => {
    setAccessoires(prev => [...prev, acc])
  }

  const handleAddCast = async () => {
    if (addCastId === '') return
    setCastSaving(true)
    await onCastAdd(saynete.id, addCastId as number)
    setAddCastId('')
    setCastSaving(false)
  }

  // Comédiens disponibles à ajouter au cast (pas déjà dedans)
  const availableForCast = comediens.filter(c => !castComedienIds.includes(c.id))

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden mb-3">
      {/* Header cliquable */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/80 hover:bg-slate-700/80 transition-colors text-left"
      >
        {saynete.emoji?.startsWith('/')
          ? <img src={saynete.emoji} alt="" className="h-6 w-auto object-contain inline-block" />
          : <span className="text-lg">{saynete.emoji || '🎭'}</span>}
        <span className="font-bold text-white flex-1">
          #{saynete.numero} — {saynete.titre}
        </span>
        <span className="text-xs text-slate-400">
          {castLinks.length} comédien{castLinks.length !== 1 ? 's' : ''} · {accessoires.length} accessoire{accessoires.length !== 1 ? 's' : ''}
        </span>
        <span className="text-slate-400 ml-2">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 py-4 bg-slate-800/40 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Distribution (qui joue) ── */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              🎭 Distribution (qui joue)
            </h4>
            <div className="space-y-1 mb-3">
              {castLinks.length === 0 && (
                <p className="text-slate-500 text-sm italic">Aucun comédien</p>
              )}
              {castLinks.map(link => {
                const com = comediens.find(c => c.id === link.comedien_id)
                const alsoMES = mesComedienIds.includes(link.comedien_id)
                return (
                  <div key={link.id} className="flex items-center gap-2 group">
                    {com && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold text-slate-900"
                        style={{ backgroundColor: com.couleur }}
                      >
                        {com.nom}
                      </span>
                    )}
                    {alsoMES && (
                      <span className="text-xs text-amber-400" title="Joue ET met en place des accessoires">
                        🔧 aussi MES
                      </span>
                    )}
                    <button
                      onClick={() => onCastRemove(link.id)}
                      className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-300 transition-opacity ml-auto"
                      title="Retirer du cast"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
            {/* Ajouter au cast */}
            <div className="flex gap-2">
              <select
                className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                value={addCastId}
                onChange={e => setAddCastId(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="">— ajouter un comédien —</option>
                {availableForCast.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
              <button
                onClick={handleAddCast}
                disabled={castSaving || addCastId === ''}
                className="px-3 py-1 text-xs rounded bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white"
              >
                {castSaving ? '…' : '+ Ajouter'}
              </button>
            </div>
          </div>

          {/* ── Accessoires (mise en place) ── */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              🔧 Accessoires (mise en place)
            </h4>
            <div className="space-y-0.5">
              {accessoires.length === 0 && (
                <p className="text-slate-500 text-sm italic">Aucun accessoire</p>
              )}
              {accessoires.map(acc => (
                <AccessoireRow
                  key={acc.id}
                  acc={acc}
                  comediens={comediens}
                  onUpdate={handleUpdateAcc}
                  onDelete={handleDeleteAcc}
                />
              ))}
            </div>
            <AddAccessoireForm
              sayneteId={saynete.id}
              comediens={comediens}
              onAdded={handleAddAcc}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sous-composant : édition d'un comédien ──────────────────────────────────

function ComedienRow({
  comedien,
  onSave,
}: {
  comedien: Comedien
  onSave: (id: number, updates: Partial<Pick<Comedien, 'nom' | 'couleur'>>) => Promise<void>
}) {
  const [nom, setNom] = useState(comedien.nom)
  const [couleur, setCouleur] = useState(comedien.couleur)
  const [saving, setSaving] = useState(false)
  const dirty = nom !== comedien.nom || couleur !== comedien.couleur

  const handleSave = async () => {
    if (!nom.trim()) return
    setSaving(true)
    await onSave(comedien.id, { nom: nom.trim(), couleur })
    setSaving(false)
  }

  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-700/50">
      <input
        type="color"
        value={couleur}
        onChange={e => setCouleur(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
        title="Couleur du comédien"
      />
      <input
        className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
        value={nom}
        onChange={e => setNom(e.target.value)}
      />
      <span
        className="px-3 py-1 rounded-full text-xs font-semibold text-slate-900"
        style={{ backgroundColor: couleur }}
      >
        {nom || '…'}
      </span>
      <button
        onClick={handleSave}
        disabled={saving || !dirty || !nom.trim()}
        className="px-3 py-1 text-xs rounded bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white transition-colors"
      >
        {saving ? '…' : '✓ Enregistrer'}
      </button>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AdminPanel({
  initialSaynetes,
  initialComediens,
  initialSaynetesComediens,
  initialAccessoires,
}: AdminPanelProps) {
  const [tab, setTab] = useState<Tab>('saynetes')
  const [comediens, setComediens] = useState<Comedien[]>(initialComediens)
  const [castLinks, setCastLinks] = useState<SaynetesComedien[]>(initialSaynetesComediens)
  const [error, setError] = useState<string | null>(null)

  const wrap = async (fn: () => Promise<void>) => {
    try {
      setError(null)
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  const handleCastAdd = async (sayneteId: number, comedienId: number) => {
    await wrap(async () => {
      const result = await addSaynetesComedien(sayneteId, comedienId)
      if (result && result[0]) {
        setCastLinks(prev => [...prev, result[0] as SaynetesComedien])
      }
    })
  }

  const handleCastRemove = async (linkId: number) => {
    await wrap(async () => {
      await deleteSaynetesComedien(linkId)
      setCastLinks(prev => prev.filter(l => l.id !== linkId))
    })
  }

  const handleComedienSave = async (
    id: number,
    updates: Partial<Pick<Comedien, 'nom' | 'couleur'>>
  ) => {
    await wrap(async () => {
      await updateComedien(id, updates)
      setComediens(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Barre de navigation */}
      <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur border-b border-slate-700 px-6 py-3 flex items-center gap-4">
        <a
          href="/"
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          ← Retour au front
        </a>
        <h1 className="text-lg font-bold text-white flex-1">🎭 Back-office — LE REVOLVER</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('saynetes')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === 'saynetes'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 Saynètes
          </button>
          <button
            onClick={() => setTab('comediens')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === 'comediens'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👤 Comédiens
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 bg-red-900/50 border border-red-500 rounded-lg px-4 py-3 text-sm text-red-200">
            ⚠️ {error}
          </div>
        )}

        {/* ── Onglet Saynètes ── */}
        {tab === 'saynetes' && (
          <section>
            <p className="text-slate-400 text-sm mb-4">
              Cliquez sur une saynète pour modifier sa distribution et ses accessoires.
              <br />
              <span className="text-amber-400">🔧 aussi MES</span> indique qu'un comédien joue <em>et</em> met en place des accessoires.
            </p>
            {initialSaynetes.map(saynete => (
              <SayneteAdminCard
                key={saynete.id}
                saynete={saynete}
                comediens={comediens}
                castLinks={castLinks.filter(l => l.saynete_id === saynete.id)}
                accessoiresInit={initialAccessoires.filter(a => a.saynete_id === saynete.id)}
                onCastAdd={handleCastAdd}
                onCastRemove={handleCastRemove}
              />
            ))}
          </section>
        )}

        {/* ── Onglet Comédiens ── */}
        {tab === 'comediens' && (
          <section>
            <p className="text-slate-400 text-sm mb-4">
              Modifiez le nom ou la couleur d'un comédien. La couleur est utilisée partout dans l'application.
            </p>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 px-4 py-2">
              {comediens.map(com => (
                <ComedienRow
                  key={com.id}
                  comedien={com}
                  onSave={handleComedienSave}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
