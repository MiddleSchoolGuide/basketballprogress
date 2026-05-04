'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  unit?: string
  baseline?: number
  target?: number
  trend?: 'improving' | 'declining' | 'flat'
  delta?: string
  color?: string
}

export default function StatsCard({ label, value, unit, trend, delta, color = '#f97316' }: Props) {
  return (
    <div className="card-hover flex flex-col gap-2">
      <p className="label">{label}</p>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-black text-white tabular-nums leading-none" style={{ color }}>
          {value}
        </span>
        {unit && <span className="text-base text-slate-400 mb-0.5 font-medium">{unit}</span>}
      </div>
      {delta && (
        <div className={`flex items-center gap-1 text-xs font-medium ${
          trend === 'improving' ? 'text-emerald-400' :
          trend === 'declining' ? 'text-red-400' : 'text-slate-500'
        }`}>
          {trend === 'improving' ? <TrendingUp size={12} /> :
           trend === 'declining' ? <TrendingDown size={12} /> : <Minus size={12} />}
          {delta}
        </div>
      )}
    </div>
  )
}
