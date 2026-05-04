import type { Session, SessionMetrics, TrendDirection } from '@/types'

export function calcPct(made: number, attempted: number): number {
  if (attempted === 0) return 0
  return Math.round((made / attempted) * 100)
}

export function calcSessionMetrics(s: Session): SessionMetrics {
  const freeThrowPct = calcPct(s.freeThrowsMade, s.freeThrowsAttempted)
  const spotShootingPct = calcPct(s.spotShootingMade, s.spotShootingAttempted)
  const closeRangePct = calcPct(s.closeRangeMade, s.closeRangeAttempted)

  const totalMade = s.freeThrowsMade + s.spotShootingMade + s.closeRangeMade
  const totalAttempted = s.freeThrowsAttempted + s.spotShootingAttempted + s.closeRangeAttempted
  const overallShootingPct = calcPct(totalMade, totalAttempted)

  const developmentScore = calcDevelopmentScore(s)

  return { freeThrowPct, spotShootingPct, closeRangePct, overallShootingPct, developmentScore }
}

export function calcDevelopmentScore(s: Session): number {
  const ftPct = calcPct(s.freeThrowsMade, s.freeThrowsAttempted)
  const spotPct = calcPct(s.spotShootingMade, s.spotShootingAttempted)

  const score =
    (s.leftHandControl / 10) * 100 * 0.20 +
    (s.formShooting / 10) * 100 * 0.20 +
    ftPct * 0.15 +
    spotPct * 0.15 +
    (s.footwork / 10) * 100 * 0.15 +
    (s.stopPopSpeed / 10) * 100 * 0.10 +
    (s.confidence / 10) * 100 * 0.05

  return Math.round(score)
}

export function getTrend(values: number[]): TrendDirection {
  if (values.length < 2) return 'flat'
  const recent = values.slice(-3)
  if (recent.length < 2) return 'flat'

  const diffs = recent.slice(1).map((v, i) => v - recent[i])
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length

  if (avgDiff > 0.3) return 'improving'
  if (avgDiff < -0.3) return 'declining'
  return 'flat'
}

export function getConsecutiveTrend(sessions: Session[], metric: keyof Session): { direction: TrendDirection; count: number } {
  if (sessions.length < 2) return { direction: 'flat', count: 0 }

  const sorted = [...sessions].sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())
  const values = sorted.map(s => s[metric] as number)

  let count = 1
  let direction: TrendDirection = 'flat'

  for (let i = values.length - 1; i > 0; i--) {
    const diff = values[i] - values[i - 1]
    if (i === values.length - 1) {
      direction = diff > 0 ? 'improving' : diff < 0 ? 'declining' : 'flat'
    } else if (direction === 'improving' && diff > 0) {
      count++
    } else if (direction === 'declining' && diff < 0) {
      count++
    } else {
      break
    }
  }

  return { direction, count }
}

export function calcSevenDayAvg(sessions: Session[], metric: keyof Session): number | null {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recent = sessions.filter(s => new Date(s.sessionDate) >= cutoff)
  if (recent.length === 0) return null
  const sum = recent.reduce((acc, s) => acc + (s[metric] as number), 0)
  return Math.round((sum / recent.length) * 10) / 10
}

export function calcFourteenDayAvg(sessions: Session[], metric: keyof Session): number | null {
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  const recent = sessions.filter(s => new Date(s.sessionDate) >= cutoff)
  if (recent.length === 0) return null
  const sum = recent.reduce((acc, s) => acc + (s[metric] as number), 0)
  return Math.round((sum / recent.length) * 10) / 10
}
