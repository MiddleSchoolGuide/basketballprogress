'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Skill { name: string; value: number; max?: number }
interface Props { skills: Skill[]; title?: string }

const COLORS = ['#f97316', '#fb923c', '#fed7aa', '#f59e0b', '#fbbf24', '#fde68a', '#a3e635']

export default function SkillBarChart({ skills, title }: Props) {
  return (
    <div>
      {title && <p className="label mb-3">{title}</p>}
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={skills} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" horizontal={false} />
          <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={90} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e2a3a', borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => [`${v}/10`]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
            {skills.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
