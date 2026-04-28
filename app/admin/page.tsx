export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import {
  fetchSaynetes,
  fetchComediens,
  fetchSaynetesComediens,
  fetchAllAccessoires,
} from '@/lib/supabase'
import AdminPanel from '@/components/AdminPanel'

export default async function AdminPage() {
  noStore()
  try {
    const [saynetes, comediens, saynetesComediens, accessoires] = await Promise.all([
      fetchSaynetes(),
      fetchComediens(),
      fetchSaynetesComediens(),
      fetchAllAccessoires(),
    ])

    return (
      <AdminPanel
        initialSaynetes={saynetes}
        initialComediens={comediens}
        initialSaynetesComediens={saynetesComediens}
        initialAccessoires={accessoires}
      />
    )
  } catch (err) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 max-w-md">
          <h1 className="text-xl font-bold mb-2">Erreur de chargement</h1>
          <p>{err instanceof Error ? err.message : 'Erreur inconnue'}</p>
        </div>
      </div>
    )
  }
}
