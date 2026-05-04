'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { TrendDirection } from '@/types'

interface Props {
  score: number
  previousScore?: number
  trend: TrendDirection
}

function getScoreLabel(score: number) {
  if (score >= 80) return { label: 'Elite', color: '#22c55e' }
  if (score >= 65) return { label: 'Advanced', color: '#84cc16' }
  if (score >= 50) return { label: 'Developing', color: '#f97316' }
  if (score >= 35) return { label: 'Building', color: '#fb923c' }
  return { label: 'Early Stage', color: '#94a3b8' }
}

export default function DevelopmentScore({ score, previousScore, trend }: Props) {
  const { label, color } = getScoreLabel(score)
  const delta = previousScore !== undefined ? score - previousScore : null
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="card flex items-center gap-6 bg-gradient-to-br from-slate-900 to-slate-900/80 border-slate-800">
      {/* Circular gauge */}
      <div className="relative flex-shrink-0 w-28 h-28">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#1e2a3a" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white leading-none score-glow">{score}</span>
          <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">/ 100</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="label mb-1">Development Score</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl font-bold text-white">{label}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {delta !== null && (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              delta > 0 ? 'bg-emerald-400/10 text-emerald-400' :
              delta < 0 ? 'bg-red-400/10 text-red-400' :
              'bg-slate-700 text-slate-400'
            }`}>
              {delta > 0 ? <TrendingUp size={11} /> : delta < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
              {delta > 0 ? '+' : ''}{delta} from last
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            trend === 'improving' ? 'badge-improving' :
            trend === 'declining' ? 'badge-declining' : 'badge-flat'
          }`}>
            {trend === 'improving' ? '↑ Trending Up' :
             trend === 'declining' ? '↓ Trending Down' : '→ Stable'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">Weighted across 7 key metrics</p>
      </div>
    </div>
  )
}
