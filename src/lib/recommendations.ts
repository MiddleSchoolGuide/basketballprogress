import type { Session, Recommendation } from '@/types'
import { calcPct, getConsecutiveTrend } from './calculations'

export function generateRecommendations(sessions: Session[]): Recommendation[] {
  if (sessions.length === 0) return []

  const sorted = [...sessions].sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
  const latest = sorted[0]
  const recs: Recommendation[] = []

  const ftPct = calcPct(latest.freeThrowsMade, latest.freeThrowsAttempted)
  const spotPct = calcPct(latest.spotShootingMade, latest.spotShootingAttempted)

  // Weak hand
  if (latest.leftHandControl < 5) {
    recs.push({
      id: 'lhc-low',
      type: 'action',
      priority: 1,
      title: 'Double Weak-Hand Reps',
      message: `Left-hand control is ${latest.leftHandControl}/10 — below the 5/10 target. Start every session with 3 minutes of stationary left-hand dribbles and left-hand zig-zag before anything else.`,
    })
  }

  // Guide hand
  if (latest.guideHand < 6) {
    recs.push({
      id: 'guide-low',
      type: 'action',
      priority: 2,
      title: 'Guide Hand Isolation Work',
      message: `Guide hand is at ${latest.guideHand}/10. Do 20 reps of 1-hand form shots (shooting arm only) then add the guide hand without pushing. Film if possible to track thumb flare.`,
    })
  }

  // Free throws
  if (ftPct < 50) {
    recs.push({
      id: 'ft-low',
      type: 'action',
      priority: 3,
      title: `Free Throw Focus — ${ftPct}% (Target: 50%)`,
      message: 'Shoot 50 free throws every session with a locked-in pre-shot routine. Deep breath, 2 dribbles, bend knees, follow through and hold.',
    })
  }

  // Spot shooting
  if (spotPct < 40) {
    recs.push({
      id: 'spot-low',
      type: 'action',
      priority: 4,
      title: `Build Range Gradually — ${spotPct}% Spot Shooting`,
      message: 'Spot shooting below 40%. Start shooting from 5–8 ft to build rhythm, then extend to mid-range. Range without rhythm creates bad habits.',
    })
  }

  // Stop-and-pop
  if (latest.stopPopSpeed < 5) {
    recs.push({
      id: 'sap-low',
      type: 'action',
      priority: 5,
      title: 'No-Ball Footwork First',
      message: `Stop-and-pop speed is ${latest.stopPopSpeed}/10. Practice the 1-2 stop footwork pattern without the ball 20 times before adding live dribble. The feet need to be automatic.`,
    })
  }

  // Consecutive improvement (3+ sessions)
  const lhcTrend = getConsecutiveTrend(sorted, 'leftHandControl')
  if (lhcTrend.direction === 'improving' && lhcTrend.count >= 3) {
    recs.push({
      id: 'lhc-streak',
      type: 'success',
      priority: 10,
      title: `Left Hand on a ${lhcTrend.count}-Session Hot Streak!`,
      message: 'Weak-hand control has improved in every recent session. Keep the reps going — consistency is building real skill.',
    })
  }

  const ftTrend = getConsecutiveTrend(sorted, 'freeThrowsMade')
  if (ftTrend.direction === 'improving' && ftTrend.count >= 3) {
    recs.push({
      id: 'ft-streak',
      type: 'success',
      priority: 11,
      title: 'Free Throw Routine Is Working!',
      message: `${ftTrend.count} sessions of improvement in free throws. The routine is taking hold. Stay consistent — don't change anything that's working.`,
    })
  }

  // Decline flags
  const formTrend = getConsecutiveTrend(sorted, 'formShooting')
  if (formTrend.direction === 'declining' && formTrend.count >= 2) {
    recs.push({
      id: 'form-decline',
      type: 'warning',
      priority: 6,
      title: 'Form Shooting Sliding — Review Mechanics',
      message: 'Form shooting has dropped 2+ sessions. Go back to 1-hand form shots at 5 ft to reset mechanics before adding distance or speed.',
    })
  }

  if (recs.length === 0) {
    recs.push({
      id: 'great-session',
      type: 'info',
      priority: 20,
      title: 'Solid Session — Stay the Course',
      message: 'All metrics are in a healthy range. Focus on consistency and adding game speed to existing skills.',
    })
  }

  return recs.sort((a, b) => a.priority - b.priority)
}
