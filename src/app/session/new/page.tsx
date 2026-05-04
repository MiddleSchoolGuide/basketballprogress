'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ChevronRight, ChevronLeft, Save } from 'lucide-react'
import RatingSlider from '@/components/session/RatingSlider'
import ShootingInput from '@/components/session/ShootingInput'

type FormData = {
  sessionDate: string
  durationMinutes: string
  leftHandControl: number
  rightHandControl: number
  formShooting: number
  guideHand: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  spotShootingMade: number
  spotShootingAttempted: number
  closeRangeMade: number
  closeRangeAttempted: number
  stopPopSpeed: number
  footwork: number
  bigPlayerSkill: number
  confidence: number
  coachNotes: string
}

const defaultForm: FormData = {
  sessionDate: format(new Date(), 'yyyy-MM-dd'),
  durationMinutes: '60',
  leftHandControl: 5, rightHandControl: 7,
  formShooting: 5, guideHand: 5,
  freeThrowsMade: 0, freeThrowsAttempted: 10,
  spotShootingMade: 0, spotShootingAttempted: 20,
  closeRangeMade: 0, closeRangeAttempted: 10,
  stopPopSpeed: 5, footwork: 5,
  bigPlayerSkill: 5, confidence: 5,
  coachNotes: '',
}

const STEPS = ['Session Info', 'Ball Handling', 'Shooting', 'Athleticism', 'Notes']

export default function NewSessionPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(defaultForm)
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof FormData, val: string | number) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const ftPct = form.freeThrowsAttempted > 0
    ? Math.round((form.freeThrowsMade / form.freeThrowsAttempted) * 100) : null
  const spotPct = form.spotShootingAttempted > 0
    ? Math.round((form.spotShootingMade / form.spotShootingAttempted) * 100) : null

  async function submit() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, playerId: 1 }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Save failed')
      }
      router.push('/dashboard')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-bold text-white">Log Session</h1>
          <span className="text-xs text-slate-500">Step {step + 1} of {STEPS.length}</span>
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-orange-500' : 'bg-slate-800'}`} />
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">{STEPS[step]}</p>
      </div>

      {/* Step 0: Session Info */}
      {step === 0 && (
        <div className="card space-y-4">
          <div>
            <label className="label block mb-2">Session Date</label>
            <input type="date" value={form.sessionDate}
              onChange={e => set('sessionDate', e.target.value)}
              className="input-field" />
          </div>
          <div>
            <label className="label block mb-2">Duration (minutes)</label>
            <input type="number" min={0} value={form.durationMinutes}
              onChange={e => set('durationMinutes', e.target.value)}
              placeholder="60" className="input-field" />
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-1">Player: Marcus · Age 13 · 3/4/5</p>
            <p>Logging for the current player profile. You can manage players in the Profile tab.</p>
          </div>
        </div>
      )}

      {/* Step 1: Ball Handling */}
      {step === 1 && (
        <div className="card space-y-6">
          <RatingSlider label="Left-Hand Control" name="lhc" value={form.leftHandControl}
            onChange={v => set('leftHandControl', v)}
            description="Dribbling control, zig-zag, weak-hand finishing" />
          <div className="border-t border-slate-800" />
          <RatingSlider label="Right-Hand Control" name="rhc" value={form.rightHandControl}
            onChange={v => set('rightHandControl', v)}
            description="Dominant hand dribble control and finishing" />
        </div>
      )}

      {/* Step 2: Shooting */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="card space-y-6">
            <RatingSlider label="Form Shooting" name="form" value={form.formShooting}
              onChange={v => set('formShooting', v)}
              description="Elbow tuck, arc, follow-through consistency" />
            <div className="border-t border-slate-800" />
            <RatingSlider label="Guide Hand" name="guide" value={form.guideHand}
              onChange={v => set('guideHand', v)}
              description="Guide hand balance, not pushing the ball" />
          </div>
          <div className="card space-y-5">
            <ShootingInput label="Free Throws" description="Full routine at the line"
              madeKey="ftMade" attemptedKey="ftAtt"
              made={form.freeThrowsMade} attempted={form.freeThrowsAttempted}
              onChangeMade={v => set('freeThrowsMade', v)}
              onChangeAttempted={v => set('freeThrowsAttempted', v)} />
            <div className="border-t border-slate-800" />
            <ShootingInput label="Spot Shooting" description="Mid-range spots, 5 locations"
              madeKey="spMade" attemptedKey="spAtt"
              made={form.spotShootingMade} attempted={form.spotShootingAttempted}
              onChangeMade={v => set('spotShootingMade', v)}
              onChangeAttempted={v => set('spotShootingAttempted', v)} />
            <div className="border-t border-slate-800" />
            <ShootingInput label="Close Range (5–8 ft)" description="High-percentage finishes"
              madeKey="crMade" attemptedKey="crAtt"
              made={form.closeRangeMade} attempted={form.closeRangeAttempted}
              onChangeMade={v => set('closeRangeMade', v)}
              onChangeAttempted={v => set('closeRangeAttempted', v)} />
          </div>

          {/* Live shooting summary */}
          {(ftPct !== null || spotPct !== null) && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <p className="label mb-2">Session Shooting Preview</p>
              <div className="flex gap-4">
                {ftPct !== null && (
                  <div className="text-center">
                    <p className={`text-xl font-black ${ftPct >= 50 ? 'text-emerald-400' : 'text-orange-400'}`}>{ftPct}%</p>
                    <p className="text-[10px] text-slate-500">Free Throws</p>
                  </div>
                )}
                {spotPct !== null && (
                  <div className="text-center">
                    <p className={`text-xl font-black ${spotPct >= 42 ? 'text-emerald-400' : 'text-orange-400'}`}>{spotPct}%</p>
                    <p className="text-[10px] text-slate-500">Spot Shots</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Athleticism */}
      {step === 3 && (
        <div className="card space-y-6">
          <RatingSlider label="Stop-and-Pop Speed" name="sap" value={form.stopPopSpeed}
            onChange={v => set('stopPopSpeed', v)}
            description="Timing and speed of catch → 1-2 stop → shot" />
          <div className="border-t border-slate-800" />
          <RatingSlider label="Footwork" name="fw" value={form.footwork}
            onChange={v => set('footwork', v)}
            description="Footwork patterns, box-out positioning, pivot steps" />
          <div className="border-t border-slate-800" />
          <RatingSlider label="Big Player Skills" name="bps" value={form.bigPlayerSkill}
            onChange={v => set('bigPlayerSkill', v)}
            description="Post positioning, sealing, rebounding, screen setting" />
          <div className="border-t border-slate-800" />
          <RatingSlider label="Confidence" name="conf" value={form.confidence}
            onChange={v => set('confidence', v)}
            description="Mental energy, aggression, belief in reps" />
        </div>
      )}

      {/* Step 4: Notes */}
      {step === 4 && (
        <div className="card space-y-4">
          <div>
            <label className="label block mb-2">Coach Notes</label>
            <textarea
              value={form.coachNotes}
              onChange={e => set('coachNotes', e.target.value)}
              rows={5}
              placeholder="What stood out? What needs work? Any breakthroughs today?"
              className="input-field resize-none leading-relaxed"
            />
          </div>

          {/* Session summary */}
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-300 mb-3">Session Summary</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <span className="text-slate-500">Left Hand Control</span>
              <span className="text-white font-medium">{form.leftHandControl}/10</span>
              <span className="text-slate-500">Form Shooting</span>
              <span className="text-white font-medium">{form.formShooting}/10</span>
              <span className="text-slate-500">Free Throws</span>
              <span className="text-white font-medium">{form.freeThrowsMade}/{form.freeThrowsAttempted} {ftPct !== null ? `(${ftPct}%)` : ''}</span>
              <span className="text-slate-500">Spot Shooting</span>
              <span className="text-white font-medium">{form.spotShootingMade}/{form.spotShootingAttempted} {spotPct !== null ? `(${spotPct}%)` : ''}</span>
              <span className="text-slate-500">Footwork</span>
              <span className="text-white font-medium">{form.footwork}/10</span>
              <span className="text-slate-500">Confidence</span>
              <span className="text-white font-medium">{form.confidence}/10</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex items-center gap-1.5">
            <ChevronLeft size={16} /> Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} className="btn-primary flex-1 flex items-center justify-center gap-1.5">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={submit} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Session</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
