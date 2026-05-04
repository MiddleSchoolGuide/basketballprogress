'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, History, User, CheckSquare, PlusCircle } from 'lucide-react'

const links = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/session/new', icon: PlusCircle, label: 'Log' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/drills', icon: CheckSquare, label: 'Drills' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#060c1a]/95 backdrop-blur border-t border-slate-800">
      <div className="max-w-2xl mx-auto flex items-stretch">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                active ? 'text-orange-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className={`text-[10px] font-medium ${active ? 'text-orange-400' : ''}`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
