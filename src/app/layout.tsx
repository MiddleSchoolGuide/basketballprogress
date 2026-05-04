import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navigation from '@/components/layout/Navigation'

export const metadata: Metadata = {
  title: 'Hoop Dev — Basketball Progress Tracker',
  description: '13U basketball player development dashboard',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#060c1a] text-slate-100">
        <div className="flex flex-col min-h-screen">
          {/* Top header bar */}
          <header className="sticky top-0 z-50 bg-[#060c1a]/90 backdrop-blur border-b border-slate-800/60">
            <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🏀</span>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">Hoop Dev</p>
                  <p className="text-[10px] text-slate-500 leading-tight">13U Player Tracker</p>
                </div>
              </div>
              <a href="/session/new" className="btn-primary text-xs px-3 py-2 rounded-lg">
                + Log Session
              </a>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 max-w-2xl mx-auto w-full px-4 pb-24 pt-4">
            {children}
          </main>

          {/* Bottom navigation */}
          <Navigation />
        </div>
      </body>
    </html>
  )
}
