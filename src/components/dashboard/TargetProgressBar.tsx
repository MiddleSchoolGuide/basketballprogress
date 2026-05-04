'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface Props {
  label: string
  current: number
  baseline: number
  target: number
  unit?: string
  format?: 'decimal' | 'percent' | 'rating'
}

function fmt(val: number, format: string, unit?: string) {
  if (format === 'percent') return `${Math.round(val)}%`
  if (format === 'rating') return `${val}/10`
  return `${val}${unit ?? ''}`
}

export default function TargetProgressBar({ label, current, baseline, target, unit, format = 'decimal' }: Props) {
  const [animated, setAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimated(true) }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const range = target - baseline
  const progress = range > 0 ? Math.min(((current - baseline) / range) * 100, 100) : 0
  const pct = Math.max(0, Math.min(100, progress))
  const met = current >= target

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {met && <CheckCircle2 size={13} className="text-emerald-400" />}
          <span className="text-sm font-medium text-slate-200">{label}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className={`font-bold ${met ? 'text-emerald-400' : 'text-white'}`}>{fmt(current, format, unit)}</span>
          <span>→</span>
          <span className="text-slate-500">Goal: {fmt(target, format, unit)}</span>
        </div>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${met ? 'bg-emerald-500' : 'bg-orange-500'}`}
          style={{ width: animated ? `${pct}%` : '0%' }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-600">
        <span>Baseline: {fmt(baseline, format, unit)}</span>
        <span className="text-orange-500/70">{Math.round(pct)}% of goal</span>
      </div>
    </div>
  )
}
