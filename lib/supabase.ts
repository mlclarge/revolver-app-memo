import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient> | null = null

// Private function - never exported, only used inside this module
const getSupabase = () => {
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabase
}

// Types
export interface Comedien {
  id: number
  nom: string
  couleur: string
  created_at: string
}

export interface Saynete {
  id: number
  numero: number
  titre: string
  jingle: string | null
  mes_document: string | null
  video_url: string | null
  notes: string | null
  emoji: string | null
  created_at: string
}

export interface SaynetesComedien {
  id: number
  saynete_id: number
  comedien_id: number
}

export interface Accessoire {
  id: number
  saynete_id: number
  comedien_id: number | null
  objet: string
  note: string | null
  created_at: string
}

export interface Commentaire {
  id: number
  saynete_id: number
  auteur: string
  type: 'comedien' | 'mes'
  texte: string
  created_at: string
}

// Fetch functions
export const fetchComediens = async () => {
  const { data, error } = await getSupabase()
    .from('comediens')
    .select('*')
    .order('id', { ascending: true })
  
  if (error) throw error
  return data as Comedien[]
}

export const fetchSaynetes = async () => {
  const { data, error } = await getSupabase()
    .from('saynetes')
    .select('*')
    .order('numero', { ascending: true })
  
  if (error) throw error
  return data as Saynete[]
}

export const fetchSaynetesComediens = async () => {
  const { data, error } = await getSupabase()
    .from('saynetes_comediens')
    .select('*')
  
  if (error) throw error
  return data as SaynetesComedien[]
}

export const fetchSaynetesComediensBySaynete = async (sayneteId: number) => {
  const { data, error } = await getSupabase()
    .from('saynetes_comediens')
    .select('*')
    .eq('saynete_id', sayneteId)
  
  if (error) throw error
  return data as SaynetesComedien[]
}

export const fetchAccessoires = async (sayneteId: number) => {
  const { data, error } = await getSupabase()
    .from('accessoires')
    .select('*')
    .eq('saynete_id', sayneteId)
  
  if (error) throw error
  return data as Accessoire[]
}

export const fetchCommentaires = async (sayneteId: number) => {
  const { data, error } = await getSupabase()
    .from('commentaires')
    .select('*')
    .eq('saynete_id', sayneteId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Commentaire[]
}

export const addCommentaire = async (
  sayneteId: number,
  auteur: string,
  type: 'comedien' | 'mes',
  texte: string
) => {
  const { data, error } = await getSupabase()
    .from('commentaires')
    .insert([{ saynete_id: sayneteId, auteur, type, texte }])
    .select()
  
  if (error) throw error
  return data
}

export const deleteCommentaire = async (commentaireId: number) => {
  const { error } = await getSupabase()
    .from('commentaires')
    .delete()
    .eq('id', commentaireId)
  
  if (error) throw error
}

export const updateAccessoire = async (
  accessoireId: number,
  updates: Partial<Accessoire>
) => {
  const { data, error } = await getSupabase()
    .from('accessoires')
    .update(updates)
    .eq('id', accessoireId)
    .select()
  
  if (error) throw error
  return data
}

export const fetchAllAccessoires = async () => {
  const { data, error } = await getSupabase()
    .from('accessoires')
    .select('*')
  
  if (error) throw error
  return data as Accessoire[]
}

export const addAccessoire = async (
  sayneteId: number,
  comedienId: number | null,
  objet: string,
  note: string | null
) => {
  const { data, error } = await getSupabase()
    .from('accessoires')
    .insert([{ saynete_id: sayneteId, comedien_id: comedienId, objet, note }])
    .select()
  
  if (error) throw error
  return data
}

export const deleteAccessoire = async (accessoireId: number) => {
  const { error } = await getSupabase()
    .from('accessoires')
    .delete()
    .eq('id', accessoireId)
  
  if (error) throw error
}
