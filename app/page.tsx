export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import {
  fetchSaynetes,
  fetchComediens,
  fetchSaynetesComediens,
  fetchAllAccessoires,
  type Saynete,
  type Comedien,
  type SaynetesComedien,
  type Accessoire,
} from '@/lib/supabase'
import HomeClient from '@/components/HomeClient'

export default async function Home() {
  noStore()
  try {
    const [saynetes, comediens, saynetesComediens, accessoires] = await Promise.all([
      fetchSaynetes(),
      fetchComediens(),
      fetchSaynetesComediens(),
      fetchAllAccessoires(),
    ])

    return (
      <HomeClient
        saynetes={saynetes}
        comediens={comediens}
        saynetesComediens={saynetesComediens}
        accessoires={accessoires}
      />
    )
  } catch (err) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 max-w-md">
          <h1 className="text-xl font-bold mb-2">Erreur</h1>
          <p>{err instanceof Error ? err.message : 'Erreur de chargement'}</p>
        </div>
      </div>
    )
  }
}
