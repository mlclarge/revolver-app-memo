import type { Metadata } from "next"
import "@/app/globals.css"

export const metadata: Metadata = {
  title: "🎭 LE REVOLVER - Mémo Troupe",
  description: "Aide à la mémorisation pour la pièce LE REVOLVER",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
