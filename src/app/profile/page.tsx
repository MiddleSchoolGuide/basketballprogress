'use client'

import { useEffect, useState } from 'react'
import { Save, User, Target, TrendingUp } from 'lucide-react'
import type { Player, Session, Goal } from '@/types'
import { calcPct, calcDevelopmentScore, calcSevenDayAvg, calcFourteenDayAvg } from '@/lib/calculations'

export default function ProfilePage() {
  const [player, setPlayer] = useState<Player | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', age: '', positionFocus: '', notes: '' })

  useEffect(() => {
    Promise.all([
      fetch('/api/players/1').then(r => r.json()),
      fetch('/api/sessions?playerId=1').then(r => r.json()),
      fetch('/api/goals?playerId=1').then(r => r.json()),
    ]).then(([p, s, g]) => {
      setPlayer(p)
      setSessions(Array.isArray(s) ? s : [])
      setGoals(Array.isArray(g) ? g : [])
      setEditForm({ name: p.name, age: String(p.age), positionFocus: p.positionFocus, notes: p.notes ?? '' })
    })
  }, [])

  async function saveProfile() {
    setSaving(true)
    const res = await fetch('/api/players/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editForm, age: Number(editForm.age) }),
    })
    if (res.ok) {
      const updated = await res.json()
      setPlayer(updated)
      setEditing(false)
    }
    setSaving(false)
  }

  if (!player) return (
    <div className="flex items-center justify-center h-48 gap-3 text-slate-500">
      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      Loading...
    </div>
  )

  const sorted = [...sessions].sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
  const latest = sorted[0]
  const first = sorted[sorted.length - 1]

  const avg7day = sessions.length > 0 ? calcSevenDayAvg(sessions, 'leftHandControl') : null
  const avg14day = sessions.length > 0 ? calcFourteenDayAvg(sessions, 'leftHandControl') : null
  const bestScore = sessions.length > 0 ? Math.max(...sessions.map(s => calcDevelopmentScore(s))) : 0

  const getGoal = (name: string) => goals.find(g => g.metricName === name)

  const baselineMetrics = [
    { label: 'Left-Hand Control', baseline: getGoal('leftHandControl')?.baselineValue ?? 2, target: getGoal('leftHandControl')?.targetValue ?? 5, current: latest?.leftHandControl, unit: '/10' },
    { label: 'Form Shooting', baseline: getGoal('formShooting')?.baselineValue ?? 4, target: getGoal('formShooting')?.targetValue ?? 6, current: latest?.formShooting, unit: '/10' },
    { label: 'Free Throw %', baseline: getGoal('freeThrowPct')?.baselineValue ?? 30, target: getGoal('freeThrowPct')?.targetValue ?? 50, current: latest ? calcPct(latest.freeThrowsMade, latest.freeThrowsAttempted) : undefined, unit: '%' },
    { label: 'Spot Shooting %', baseline: getGoal('spotShootingPct')?.baselineValue ?? 30, target: getGoal('spotShootingPct')?.targetValue ?? 42, current: latest ? calcPct(latest.spotShootingMade, latest.spotShootingAttempted) : undefined, unit: '%' },
    { label: 'Footwork', baseline: getGoal('footwork')?.baselineValue ?? 3, target: getGoal('footwork')?.targetValue ?? 6, current: latest?.footwork, unit: '/10' },
    { label: 'Stop-and-Pop Speed', baseline: getGoal('stopPopSpeed')?.baselineValue ?? 4, target: getGoal('stopPopSpeed')?.targetValue ?? 6, current: latest?.stopPopSpeed, unit: '/10' },
  ]

  return (
    <div className="space-y-5">
      {/* Player card */}
      <div className="card bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xl">
              {player.name[0]}
            </div>
            <div>
              {editing ? (
                <input
                  value={editForm.name}
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="input-field text-base font-bold py-1 px-2"
                />
              ) : (
                <h1 className="text-xl font-black text-white">{player.name}</h1>
              )}
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                {editing ? (
                  <>
                    <input value={editForm.age} onChange={e => setEditForm(p => ({ ...p, age: e.target.value }))}
                      className="input-field py-0.5 px-2 w-16 text-xs" type="number" />
                    <span>yrs</span>
                    <input value={editForm.positionFocus} onChange={e => setEditForm(p => ({ ...p, positionFocus: e.target.value }))}
                      className="input-field py-0.5 px-2 w-20 text-xs" />
                  </>
                ) : (
                  <>
                    <span>{player.age} yrs old</span>
                    <span>•</span>
                    <span className="text-orange-400 font-medium">{player.positionFocus} PF</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => editing ? saveProfile() : setEditing(true)}
            disabled={saving}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            {editing ? (saving ? 'Saving...' : <><Save size={12} /> Save</>) : <><User size={12} /> Edit</>}
          </button>
        </div>

        {editing && (
          <div className="mt-3">
            <label className="label block mb-1">Notes</label>
            <textarea rows={2} value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
              className="input-field resize-none text-xs" />
            <button onClick={() => setEditing(false)} className="btn-secondary text-xs mt-2 w-full">Cancel</button>
          </div>
        )}

        {!editing && player.notes && (
          <p className="text-xs text-slate-400 mt-3 leading-relaxed">{player.notes}</p>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-black text-orange-400">{sessions.length}</p>
          <p className="label mt-1">Sessions</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-black text-white">{bestScore}</p>
          <p className="label mt-1">Best Score</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-black text-white">
            {sessions.reduce((a, s) => a + (s.durationMinutes ?? 0), 0)}
          </p>
          <p className="label mt-1">Total Mins</p>
        </div>
      </div>

      {/* Averages */}
      {sessions.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-orange-400" />
            <p className="text-sm font-bold text-white">Averages (Left-Hand Control)</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <p className="text-xl font-black text-white">{avg7day ?? '—'}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">7-Day Avg</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <p className="text-xl font-black text-white">{avg14day ?? '—'}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">14-Day Avg</p>
            </div>
          </div>
        </div>
      )}

      {/* Baseline vs target vs current */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Target size={14} className="text-orange-400" />
          <p className="text-sm font-bold text-white">Baseline → Current → Target</p>
        </div>
        <div className="space-y-3">
          {baselineMetrics.map(({ label, baseline, target, current, unit }) => {
            const improved = current !== undefined && current > baseline
            const met = current !== undefined && current >= target

            return (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{label}</span>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="text-slate-600">{baseline}{unit}</span>
                    <span className="text-slate-600">→</span>
                    <span className={`font-bold ${met ? 'text-emerald-400' : improved ? 'text-orange-400' : 'text-white'}`}>
                      {current !== undefined ? `${current}${unit}` : '—'}
                    </span>
                    <span className="text-slate-600">→</span>
                    <span className="text-slate-500">{target}{unit}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${met ? 'bg-emerald-500' : 'bg-orange-500'}`}
                    style={{ width: current !== undefined ? `${Math.min(((current - baseline) / (target - baseline)) * 100, 100)}%` : '0%' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Development score improvement */}
      {first && latest && first.id !== latest.id && (
        <div className="card border-orange-500/20 bg-orange-500/5">
          <p className="label mb-2">Development Score Improvement</p>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-slate-500">{calcDevelopmentScore(first)}</p>
              <p className="text-[10px] text-slate-600">Session 1</p>
            </div>
            <div className="flex-1 text-center text-orange-400 font-black text-lg">→</div>
            <div className="text-center">
              <p className="text-2xl font-black text-orange-400">{calcDevelopmentScore(latest)}</p>
              <p className="text-[10px] text-slate-500">Latest</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-emerald-400">
                +{calcDevelopmentScore(latest) - calcDevelopmentScore(first)}
              </p>
              <p className="text-[10px] text-slate-500">Growth</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
