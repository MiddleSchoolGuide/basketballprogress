'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react'

interface Drill {
  id: number
  drillName: string
  category: string
  targetReps?: string | null
  description?: string | null
  completed: boolean
  completionId: number | null
  notes: string | null
}

const CATEGORY_COLORS: Record<string, string> = {
  'Weak Hand': '#f97316',
  'Shooting': '#3b82f6',
  'Free Throws': '#22c55e',
  'Footwork': '#a855f7',
  'Game Speed': '#f59e0b',
}

export default function DrillsPage() {
  const [drills, setDrills] = useState<Drill[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    fetch(`/api/drills?date=${today}`)
      .then(r => r.json())
      .then(d => { setDrills(Array.isArray(d) ? d : []); setLoading(false) })
  }, [today])

  async function toggle(drill: Drill) {
    setSaving(drill.id)
    const newCompleted = !drill.completed
    const res = await fetch('/api/drills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drillId: drill.id, date: today, completed: newCompleted, notes: drill.notes }),
    })
    if (res.ok) {
      setDrills(prev => prev.map(d => d.id === drill.id ? { ...d, completed: newCompleted } : d))
    }
    setSaving(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48 gap-3 text-slate-500">
      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      Loading drills...
    </div>
  )

  const completedCount = drills.filter(d => d.completed).length
  const progress = drills.length > 0 ? (completedCount / drills.length) * 100 : 0

  const categories = Array.from(new Set(drills.map(d => d.category)))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-white">Daily Drill Checklist</h1>
        <p className="text-xs text-slate-500 mt-0.5">{format(new Date(), 'EEEE, MMMM d')}</p>
      </div>

      {/* Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-white">Today's Progress</p>
          <span className={`text-sm font-bold ${completedCount === drills.length ? 'text-emerald-400' : 'text-orange-400'}`}>
            {completedCount}/{drills.length}
          </span>
        </div>
        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${completedCount === drills.length ? 'bg-emerald-500' : 'bg-orange-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {completedCount === drills.length && drills.length > 0 && (
          <p className="text-xs text-emerald-400 mt-2 font-medium text-center">
            🔥 Full session complete — great work!
          </p>
        )}
      </div>

      {/* Drills by category */}
      {categories.map(cat => {
        const catDrills = drills.filter(d => d.category === cat)
        const catColor = CATEGORY_COLORS[cat] ?? '#94a3b8'
        const catCompleted = catDrills.filter(d => d.completed).length

        return (
          <div key={cat} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: catColor }} />
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: catColor }}>{cat}</p>
              <span className="text-[10px] text-slate-600">{catCompleted}/{catDrills.length}</span>
            </div>

            {catDrills.map(drill => {
              const isExpanded = expanded === drill.id

              return (
                <div
                  key={drill.id}
                  className={`card transition-all duration-200 ${drill.completed ? 'border-emerald-500/20 bg-emerald-500/5' : 'card-hover'}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggle(drill)}
                      disabled={saving === drill.id}
                      className="flex-shrink-0 mt-0.5 transition-transform active:scale-90"
                    >
                      {saving === drill.id ? (
                        <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                      ) : drill.completed ? (
                        <CheckCircle2 size={20} className="text-emerald-400" />
                      ) : (
                        <Circle size={20} className="text-slate-600" />
                      )}
                    </button>

                    {/* Drill info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${drill.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {drill.drillName}
                        </p>
                        {drill.description && (
                          <button
                            onClick={() => setExpanded(isExpanded ? null : drill.id)}
                            className="text-slate-600 hover:text-slate-400 transition-colors ml-2 flex-shrink-0"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </div>
                      {drill.targetReps && (
                        <p className={`text-xs mt-0.5 ${drill.completed ? 'text-slate-600' : 'text-slate-500'}`}>
                          🎯 {drill.targetReps}
                        </p>
                      )}
                      {isExpanded && drill.description && (
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed border-t border-slate-800 pt-2">
                          {drill.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Encouragement */}
      <div className="card bg-gradient-to-br from-orange-500/5 to-transparent border-orange-500/10">
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="text-orange-400 font-semibold">Pro tip:</span> Check off drills as you complete them during practice. Consistency across all 9 drills each session is what builds elite skill.
        </p>
      </div>
    </div>
  )
}
