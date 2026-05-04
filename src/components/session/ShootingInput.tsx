'use client'

interface Props {
  label: string
  description?: string
  madeKey: string
  attemptedKey: string
  made: number
  attempted: number
  onChangeMade: (val: number) => void
  onChangeAttempted: (val: number) => void
  error?: string
}

export default function ShootingInput({
  label, description, made, attempted, onChangeMade, onChangeAttempted, error
}: Props) {
  const pct = attempted > 0 ? Math.round((made / attempted) * 100) : null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-200">{label}</p>
          {description && <p className="text-[11px] text-slate-500">{description}</p>}
        </div>
        {pct !== null && (
          <span className={`text-sm font-bold tabular-nums ${
            pct >= 50 ? 'text-emerald-400' : pct >= 35 ? 'text-orange-400' : 'text-red-400'
          }`}>{pct}%</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Made</label>
          <input
            type="number"
            min={0} max={attempted || 999}
            value={made}
            onChange={e => {
              const v = Math.max(0, Number(e.target.value))
              onChangeMade(Math.min(v, attempted))
            }}
            className="input-field text-center text-lg font-bold"
          />
        </div>
        <div className="text-slate-600 text-xl font-light mt-5">/</div>
        <div className="flex-1">
          <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Attempted</label>
          <input
            type="number"
            min={0}
            value={attempted}
            onChange={e => {
              const v = Math.max(0, Number(e.target.value))
              onChangeAttempted(v)
              if (made > v) onChangeMade(v)
            }}
            className="input-field text-center text-lg font-bold"
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
