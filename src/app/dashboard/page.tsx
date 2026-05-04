'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, Flame } from 'lucide-react'
import type { Session, Goal } from '@/types'
import { calcSessionMetrics, calcDevelopmentScore, calcPct, getTrend } from '@/lib/calculations'
import { generateRecommendations } from '@/lib/recommendations'
import DevelopmentScore from '@/components/dashboard/DevelopmentScore'
import StatsCard from '@/components/dashboard/StatsCard'
import TargetProgressBar from '@/components/dashboard/TargetProgressBar'
import TrendChart from '@/components/dashboard/TrendChart'
import SkillBarChart from '@/components/dashboard/SkillBarChart'
import RecommendationCard from '@/components/dashboard/RecommendationCard'

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/sessions?playerId=1').then(r => r.json()),
      fetch('/api/goals?playerId=1').then(r => r.json()),
    ]).then(([s, g]) => {
      setSessions(Array.isArray(s) ? s : [])
      setGoals(Array.isArray(g) ? g : [])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-slate-500">
        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        Loading dashboard...
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🏀</div>
        <h2 className="text-xl font-bold text-white mb-2">No Sessions Yet</h2>
        <p className="text-slate-400 mb-6">Log your first training session to start tracking progress.</p>
        <a href="/session/new" className="btn-primary inline-block">Log First Session</a>
      </div>
    )
  }

  const sorted = [...sessions].sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
  const latest = sorted[0]
  const previous = sorted[1]

  const latestMetrics = calcSessionMetrics(latest)
  const prevScore = previous ? calcDevelopmentScore(previous) : undefined

  // Build trend data (chronological)
  const chrono = [...sorted].reverse()
  const lhcTrend = chrono.map(s => ({ date: s.sessionDate, value: s.leftHandControl }))
  const fsTrend = chrono.map(s => ({ date: s.sessionDate, value: s.formShooting }))
  const ftTrend = chrono.map(s => ({ date: s.sessionDate, value: calcPct(s.freeThrowsMade, s.freeThrowsAttempted) }))
  const spotTrend = chrono.map(s => ({ date: s.sessionDate, value: calcPct(s.spotShootingMade, s.spotShootingAttempted) }))
  const devTrend = chrono.map(s => calcDevelopmentScore(s))
  const trendDir = getTrend(devTrend)

  const recs = generateRecommendations(sessions)

  const skills = [
    { name: 'Left Hand', value: latest.leftHandControl },
    { name: 'Form Shot', value: latest.formShooting },
    { name: 'Guide Hand', value: latest.guideHand },
    { name: 'Stop & Pop', value: latest.stopPopSpeed },
    { name: 'Footwork', value: latest.footwork },
    { name: 'Big Skills', value: latest.bigPlayerSkill },
    { name: 'Confidence', value: latest.confidence },
  ]

  const getGoal = (name: string) => goals.find(g => g.metricName === name)

  return (
    <div className="space-y-5">
      {/* Session header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Marcus</h1>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
            <span className="flex items-center gap-1"><Calendar size={11} /> {format(new Date(latest.sessionDate), 'MMM d, yyyy')}</span>
            {latest.durationMinutes && <span className="flex items-center gap-1"><Clock size={11} /> {latest.durationMinutes} min</span>}
            <span className="text-orange-400 font-medium flex items-center gap-1"><Flame size={11} /> {sorted.length} sessions</span>
          </div>
        </div>
        <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded-lg font-medium">
          3/4/5 PF
        </span>
      </div>

      {/* Development Score */}
      <DevelopmentScore score={latestMetrics.developmentScore} previousScore={prevScore} trend={trendDir} />

      {/* Key shooting stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatsCard
          label="Free Throws"
          value={latestMetrics.freeThrowPct}
          unit="%"
          trend={ftTrend.length >= 2 ? (ftTrend.at(-1)!.value >= ftTrend.at(-2)!.value ? 'improving' : 'declining') : 'flat'}
          delta={ftTrend.length >= 2 ? `${ftTrend.at(-1)!.value - ftTrend.at(-2)!.value > 0 ? '+' : ''}${ftTrend.at(-1)!.value - ftTrend.at(-2)!.value}% from last` : undefined}
          color={latestMetrics.freeThrowPct >= 50 ? '#22c55e' : '#f97316'}
        />
        <StatsCard
          label="Spot Shoot"
          value={latestMetrics.spotShootingPct}
          unit="%"
          trend={spotTrend.length >= 2 ? (spotTrend.at(-1)!.value >= spotTrend.at(-2)!.value ? 'improving' : 'declining') : 'flat'}
          delta={spotTrend.length >= 2 ? `${spotTrend.at(-1)!.value - spotTrend.at(-2)!.value > 0 ? '+' : ''}${spotTrend.at(-1)!.value - spotTrend.at(-2)!.value}% from last` : undefined}
          color={latestMetrics.spotShootingPct >= 42 ? '#22c55e' : '#f97316'}
        />
        <StatsCard
          label="Left Hand"
          value={latest.leftHandControl}
          unit="/10"
          trend={lhcTrend.length >= 2 ? (lhcTrend.at(-1)!.value >= lhcTrend.at(-2)!.value ? 'improving' : 'declining') : 'flat'}
          delta={lhcTrend.length >= 2 ? `${lhcTrend.at(-1)!.value - lhcTrend.at(-2)!.value > 0 ? '+' : ''}${lhcTrend.at(-1)!.value - lhcTrend.at(-2)!.value} from last` : undefined}
          color={latest.leftHandControl >= 5 ? '#22c55e' : '#f97316'}
        />
      </div>

      {/* 2-week target progress */}
      <div className="card space-y-4">
        <h2 className="text-sm font-bold text-white">2-Week Target Progress</h2>
        <TargetProgressBar
          label="Left-Hand Control"
          current={latest.leftHandControl}
          baseline={getGoal('leftHandControl')?.baselineValue ?? 2}
          target={getGoal('leftHandControl')?.targetValue ?? 5}
          format="rating"
        />
        <TargetProgressBar
          label="Form Shooting"
          current={latest.formShooting}
          baseline={getGoal('formShooting')?.baselineValue ?? 4}
          target={getGoal('formShooting')?.targetValue ?? 6}
          format="rating"
        />
        <TargetProgressBar
          label="Free Throw %"
          current={latestMetrics.freeThrowPct}
          baseline={getGoal('freeThrowPct')?.baselineValue ?? 30}
          target={getGoal('freeThrowPct')?.targetValue ?? 50}
          format="percent"
        />
        <TargetProgressBar
          label="Spot Shooting %"
          current={latestMetrics.spotShootingPct}
          baseline={getGoal('spotShootingPct')?.baselineValue ?? 30}
          target={getGoal('spotShootingPct')?.targetValue ?? 42}
          format="percent"
        />
        <TargetProgressBar
          label="Footwork"
          current={latest.footwork}
          baseline={getGoal('footwork')?.baselineValue ?? 3}
          target={getGoal('footwork')?.targetValue ?? 6}
          format="rating"
        />
      </div>

      {/* Trend Charts */}
      <div className="card space-y-6">
        <h2 className="text-sm font-bold text-white">Progress Trends</h2>
        <TrendChart data={lhcTrend} label="Left-Hand Control" color="#f97316" domain={[0, 10]} target={5} format="rating" />
        <div className="border-t border-slate-800" />
        <TrendChart data={fsTrend} label="Form Shooting" color="#fb923c" domain={[0, 10]} target={6} format="rating" />
        <div className="border-t border-slate-800" />
        <TrendChart data={ftTrend} label="Free Throw %" color="#22c55e" domain={[0, 100]} target={50} format="percent" />
        <div className="border-t border-slate-800" />
        <TrendChart data={spotTrend} label="Spot Shooting %" color="#3b82f6" domain={[0, 100]} target={42} format="percent" />
      </div>

      {/* Latest session skills */}
      <div className="card">
        <SkillBarChart skills={skills} title="Latest Session — Skill Ratings" />
      </div>

      {/* Coach recommendations */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span>🎯</span> Coach Recommendations
        </h2>
        {recs.map(rec => <RecommendationCard key={rec.id} rec={rec} />)}
      </div>

      {/* Coach notes */}
      {latest.coachNotes && (
        <div className="card bg-slate-900/50">
          <p className="label mb-2">Coach Notes — Last Session</p>
          <p className="text-sm text-slate-300 leading-relaxed italic">"{latest.coachNotes}"</p>
        </div>
      )}

      {/* Aggregate stats */}
      <div className="card">
        <p className="label mb-3">Overall Shooting</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-black text-white">{latestMetrics.freeThrowPct}%</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Free Throws</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">{latestMetrics.spotShootingPct}%</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Spot Shots</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">{latestMetrics.closeRangePct}%</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Close Range</p>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-3 pt-3 text-center">
          <p className="text-3xl font-black text-orange-400">{latestMetrics.overallShootingPct}%</p>
          <p className="text-xs text-slate-500">Overall Shooting</p>
        </div>
      </div>
    </div>
  )
}
