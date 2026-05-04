'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { format } from 'date-fns'

interface DataPoint { date: string; value: number }
interface Props {
  data: DataPoint[]
  label: string
  color?: string
  domain?: [number, number]
  target?: number
  format?: 'percent' | 'rating' | 'number'
  unit?: string
}

function fmt(val: number, f?: string) {
  if (f === 'percent') return `${val}%`
  if (f === 'rating') return `${val}/10`
  return String(val)
}

export default function TrendChart({ data, label, color = '#f97316', domain, target, format: fmtType }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-slate-600 text-sm">
        No data yet
      </div>
    )
  }

  const chartData = data.map(d => ({
    date: format(new Date(d.date), 'M/d'),
    value: d.value,
  }))

  return (
    <div>
      <p className="label mb-3">{label}</p>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis domain={domain} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e2a3a', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(v: number) => [fmt(v, fmtType), label]}
          />
          {target && (
            <ReferenceLine y={target} stroke="#22c55e" strokeDasharray="4 3" strokeWidth={1.5}
              label={{ value: `Goal: ${fmt(target, fmtType)}`, position: 'right', fontSize: 9, fill: '#22c55e' }} />
          )}
          <Line
            type="monotone" dataKey="value"
            stroke={color} strokeWidth={2.5}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
