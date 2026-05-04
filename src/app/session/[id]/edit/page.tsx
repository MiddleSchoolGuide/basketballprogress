'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Save, ArrowLeft } from 'lucide-react'
import type { Session } from '@/types'
import RatingSlider from '@/components/session/RatingSlider'
import ShootingInput from '@/components/session/ShootingInput'

export default function EditSessionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/sessions/${params.id}`)
      .then(r => r.json())
      .then(s => setSession(s))
  }, [params.id])

  if (!session) return (
    <div className="flex items-center justify-center h-48 gap-3 text-slate-500">
      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      Loading...
    </div>
  )

  const set = (key: keyof Session, val: unknown) =>
    setSession(prev => prev ? { ...prev, [key]: val } : prev)

  async function save() {
    if (!session) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...session,
          sessionDate: format(new Date(session.sessionDate), 'yyyy-MM-dd'),
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Save failed')
      }
      router.push('/history')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
      setSaving(false)
    }
  }

  const ftPct = session.freeThrowsAttempted > 0
    ? Math.round((session.freeThrowsMade / session.freeThrowsAttempted) * 100) : null

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-white">Edit Session</h1>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="label block mb-2">Session Date</label>
          <input type="date"
            value={format(new Date(session.sessionDate), 'yyyy-MM-dd')}
            onChange={e => set('sessionDate', e.target.value)}
            className="input-field" />
        </div>
        <div>
          <label className="label block mb-2">Duration (minutes)</label>
          <input type="number" min={0}
            value={session.durationMinutes ?? ''}
            onChange={e => set('durationMinutes', Number(e.target.value))}
            className="input-field" />
        </div>
      </div>

      <div className="card space-y-6">
        <p className="text-sm font-bold text-white">Ball Handling</p>
        <RatingSlider label="Left-Hand Control" name="lhc" value={session.leftHandControl}
          onChange={v => set('leftHandControl', v)} />
        <div className="border-t border-slate-800" />
        <RatingSlider label="Right-Hand Control" name="rhc" value={session.rightHandControl}
          onChange={v => set('rightHandControl', v)} />
      </div>

      <div className="card space-y-6">
        <p className="text-sm font-bold text-white">Shooting</p>
        <RatingSlider label="Form Shooting" name="form" value={session.formShooting}
          onChange={v => set('formShooting', v)} />
        <div className="border-t border-slate-800" />
        <RatingSlider label="Guide Hand" name="guide" value={session.guideHand}
          onChange={v => set('guideHand', v)} />
        <div className="border-t border-slate-800" />
        <ShootingInput label="Free Throws"
          madeKey="ftm" attemptedKey="fta"
          made={session.freeThrowsMade} attempted={session.freeThrowsAttempted}
          onChangeMade={v => set('freeThrowsMade', v)}
          onChangeAttempted={v => set('freeThrowsAttempted', v)} />
        <div className="border-t border-slate-800" />
        <ShootingInput label="Spot Shooting"
          madeKey="spm" attemptedKey="spa"
          made={session.spotShootingMade} attempted={session.spotShootingAttempted}
          onChangeMade={v => set('spotShootingMade', v)}
          onChangeAttempted={v => set('spotShootingAttempted', v)} />
        <div className="border-t border-slate-800" />
        <ShootingInput label="Close Range"
          madeKey="crm" attemptedKey="cra"
          made={session.closeRangeMade} attempted={session.closeRangeAttempted}
          onChangeMade={v => set('closeRangeMade', v)}
          onChangeAttempted={v => set('closeRangeAttempted', v)} />
      </div>

      <div className="card space-y-6">
        <p className="text-sm font-bold text-white">Athleticism</p>
        <RatingSlider label="Stop-and-Pop Speed" name="sap" value={session.stopPopSpeed}
          onChange={v => set('stopPopSpeed', v)} />
        <div className="border-t border-slate-800" />
        <RatingSlider label="Footwork" name="fw" value={session.footwork}
          onChange={v => set('footwork', v)} />
        <div className="border-t border-slate-800" />
        <RatingSlider label="Big Player Skills" name="bps" value={session.bigPlayerSkill}
          onChange={v => set('bigPlayerSkill', v)} />
        <div className="border-t border-slate-800" />
        <RatingSlider label="Confidence" name="conf" value={session.confidence}
          onChange={v => set('confidence', v)} />
      </div>

      <div className="card">
        <label className="label block mb-2">Coach Notes</label>
        <textarea rows={4}
          value={session.coachNotes ?? ''}
          onChange={e => set('coachNotes', e.target.value)}
          className="input-field resize-none" />
      </div>

      {error && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-sm text-red-400">{error}</div>
      )}

      <button onClick={save} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
        {saving ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
        ) : (
          <><Save size={16} /> Save Changes</>
        )}
      </button>
    </div>
  )
}
