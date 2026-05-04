'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Trash2, Pencil, ChevronDown, ChevronUp, StickyNote } from 'lucide-react'
import type { Session } from '@/types'
import { calcPct, calcDevelopmentScore } from '@/lib/calculations'

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded" style={{ color, background: `${color}18` }}>
      {children}
    </span>
  )
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/sessions?playerId=1')
      .then(r => r.json())
      .then(d => { setSessions(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  async function deleteSession(id: number) {
    if (!confirm('Delete this session? This cannot be undone.')) return
    setDeleting(id)
    await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
    setSessions(prev => prev.filter(s => s.id !== id))
    setDeleting(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48 gap-3 text-slate-500">
      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      Loading...
    </div>
  )

  if (sessions.length === 0) return (
    <div className="text-center py-20">
      <div className="text-4xl mb-3">📋</div>
      <p className="text-slate-400">No sessions logged yet.</p>
      <a href="/session/new" className="btn-primary inline-block mt-4">Log First Session</a>
    </div>
  )

  const sorted = [...sessions].sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Session History</h1>
        <span className="text-sm text-slate-500">{sorted.length} session{sorted.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-2">
        {sorted.map((s, i) => {
          const ftPct = calcPct(s.freeThrowsMade, s.freeThrowsAttempted)
          const spotPct = calcPct(s.spotShootingMade, s.spotShootingAttempted)
          const devScore = calcDevelopmentScore(s)
          const isExpanded = expanded === s.id
          const isLatest = i === 0

          return (
            <div key={s.id} className={`card-hover overflow-hidden transition-all ${isLatest ? 'border-orange-500/30' : ''}`}>
              {/* Header row */}
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : s.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">
                      {format(new Date(s.sessionDate), 'MMM d, yyyy')}
                    </span>
                    {isLatest && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-medium">Latest</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge color="#f97316">FT: {ftPct}%</Badge>
                    <Badge color="#3b82f6">Spot: {spotPct}%</Badge>
                    <Badge color="#a78bfa">LH: {s.leftHandControl}/10</Badge>
                    <Badge color="#94a3b8">Score: {devScore}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {s.durationMinutes && <span className="text-xs text-slate-500">{s.durationMinutes}m</span>}
                  {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
                  {/* Shooting */}
                  <div>
                    <p className="label mb-2">Shooting</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Free Throws', made: s.freeThrowsMade, att: s.freeThrowsAttempted },
                        { label: 'Spot Shots', made: s.spotShootingMade, att: s.spotShootingAttempted },
                        { label: 'Close Range', made: s.closeRangeMade, att: s.closeRangeAttempted },
                      ].map(({ label, made, att }) => (
                        <div key={label} className="bg-slate-800/60 rounded-lg p-2 text-center">
                          <p className="text-sm font-bold text-white">{calcPct(made, att)}%</p>
                          <p className="text-[10px] text-slate-500">{made}/{att}</p>
                          <p className="text-[9px] text-slate-600 mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="label mb-2">Skill Ratings</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                      {[
                        ['Left Hand', s.leftHandControl],
                        ['Right Hand', s.rightHandControl],
                        ['Form Shooting', s.formShooting],
                        ['Guide Hand', s.guideHand],
                        ['Stop & Pop', s.stopPopSpeed],
                        ['Footwork', s.footwork],
                        ['Big Skills', s.bigPlayerSkill],
                        ['Confidence', s.confidence],
                      ].map(([label, val]) => (
                        <div key={label as string} className="flex items-center justify-between">
                          <span className="text-slate-500">{label}</span>
                          <span className="text-white font-medium">{val}/10</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {s.coachNotes && (
                    <div className="bg-slate-800/40 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <StickyNote size={12} className="text-slate-500" />
                        <p className="label">Coach Notes</p>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed italic">"{s.coachNotes}"</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-1">
                    <a href={`/session/${s.id}/edit`} className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3">
                      <Pencil size={12} /> Edit
                    </a>
                    <button
                      onClick={() => deleteSession(s.id)}
                      disabled={deleting === s.id}
                      className="btn-danger flex items-center gap-1.5"
                    >
                      <Trash2 size={12} />
                      {deleting === s.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
