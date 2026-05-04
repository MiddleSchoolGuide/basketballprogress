'use client'

import { AlertTriangle, CheckCircle, Info, Target } from 'lucide-react'
import type { Recommendation } from '@/types'

const styles = {
  warning: { bg: 'bg-red-400/5 border-red-400/20', icon: AlertTriangle, iconColor: 'text-red-400', titleColor: 'text-red-300' },
  success: { bg: 'bg-emerald-400/5 border-emerald-400/20', icon: CheckCircle, iconColor: 'text-emerald-400', titleColor: 'text-emerald-300' },
  action: { bg: 'bg-orange-400/5 border-orange-400/20', icon: Target, iconColor: 'text-orange-400', titleColor: 'text-orange-300' },
  info: { bg: 'bg-blue-400/5 border-blue-400/20', icon: Info, iconColor: 'text-blue-400', titleColor: 'text-blue-300' },
}

export default function RecommendationCard({ rec }: { rec: Recommendation }) {
  const s = styles[rec.type]
  const Icon = s.icon

  return (
    <div className={`rounded-xl border p-3.5 ${s.bg}`}>
      <div className="flex gap-3">
        <Icon size={16} className={`flex-shrink-0 mt-0.5 ${s.iconColor}`} />
        <div>
          <p className={`text-sm font-semibold mb-0.5 ${s.titleColor}`}>{rec.title}</p>
          <p className="text-xs text-slate-400 leading-relaxed">{rec.message}</p>
        </div>
      </div>
    </div>
  )
}
