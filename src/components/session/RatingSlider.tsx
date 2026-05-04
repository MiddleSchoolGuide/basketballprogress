'use client'

const LABELS: Record<number, string> = {
  1: 'Very Poor', 2: 'Poor', 3: 'Below Avg', 4: 'Fair', 5: 'Average',
  6: 'Good', 7: 'Very Good', 8: 'Great', 9: 'Excellent', 10: 'Elite'
}

const COLOR_MAP: Record<number, string> = {
  1: '#ef4444', 2: '#ef4444', 3: '#f97316', 4: '#f97316', 5: '#f59e0b',
  6: '#84cc16', 7: '#22c55e', 8: '#22c55e', 9: '#10b981', 10: '#06b6d4'
}

interface Props {
  label: string
  name: string
  value: number
  onChange: (val: number) => void
  description?: string
}

export default function RatingSlider({ label, name, value, onChange, description }: Props) {
  const color = COLOR_MAP[value]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor={name} className="text-sm font-medium text-slate-200">{label}</label>
          {description && <p className="text-[11px] text-slate-500">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{LABELS[value]}</span>
          <span className="text-xl font-black tabular-nums w-6 text-right" style={{ color }}>{value}</span>
        </div>
      </div>
      <div className="relative">
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-1">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{ width: `${(value / 10) * 100}%`, backgroundColor: color }}
          />
        </div>
        <input
          id={name}
          type="range"
          min={1} max={10} step={1}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer w-full"
          style={{ height: '24px', top: '-6px' }}
        />
        <div className="flex justify-between px-0.5">
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`text-[9px] font-medium transition-colors ${
                n === value ? 'text-white' : n <= value ? 'text-slate-600' : 'text-slate-800'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
