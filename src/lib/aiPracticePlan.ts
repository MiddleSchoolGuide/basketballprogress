import type { Goal, Player, Recommendation, Session } from '@/types'
import { calcDevelopmentScore, calcPct } from './calculations'

export interface AiPracticePlan {
  headline: string
  summary: string
  focusAreas: AiFocusArea[]
  nextSessionPlan: AiSessionBlock[]
  caution: string | null
}

export interface AiFocusArea {
  title: string
  reason: string
  adjustment: string
}

export interface AiSessionBlock {
  phase: string
  drill: string
  minutes: number
  target: string
}

export const practicePlanSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['headline', 'summary', 'focusAreas', 'nextSessionPlan', 'caution'],
  properties: {
    headline: { type: 'string' },
    summary: { type: 'string' },
    focusAreas: {
      type: 'array',
      minItems: 2,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'reason', 'adjustment'],
        properties: {
          title: { type: 'string' },
          reason: { type: 'string' },
          adjustment: { type: 'string' },
        },
      },
    },
    nextSessionPlan: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['phase', 'drill', 'minutes', 'target'],
        properties: {
          phase: { type: 'string' },
          drill: { type: 'string' },
          minutes: { type: 'integer', minimum: 5, maximum: 25 },
          target: { type: 'string' },
        },
      },
    },
    caution: {
      anyOf: [
        { type: 'string' },
        { type: 'null' },
      ],
    },
  },
} as const

export const practicePlanInstructions = `
You are a youth basketball development planner.
Build a next-session practice adjustment plan from the supplied stats.
Use only the supplied data.
Keep the plan age-appropriate for a 13U athlete.
Do not diagnose injuries or medical issues.
Do not recommend extreme volume spikes.
The plan should complement, not replace, the deterministic coaching rules already in the app.
Mention concrete shooting percentages and trends when relevant.
`.trim()

export function buildPracticePlanInput(
  player: Player,
  sessions: Session[],
  goals: Goal[],
  fallbackRecommendations: Recommendation[],
): string {
  const latest = sessions.reduce((best, session) => {
    if (!best) return session
    return new Date(session.sessionDate) > new Date(best.sessionDate) ? session : best
  }, sessions[0])
  const recent = [...sessions]
    .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
    .slice(0, 5)
  const recentSummary = recent.map(session =>
    `- ${session.sessionDate}: score ${calcDevelopmentScore(session)}, FT ${calcPct(session.freeThrowsMade, session.freeThrowsAttempted)}%, Spot ${calcPct(session.spotShootingMade, session.spotShootingAttempted)}%, Close ${calcPct(session.closeRangeMade, session.closeRangeAttempted)}%, Left ${session.leftHandControl}/10, Form ${session.formShooting}/10, Footwork ${session.footwork}/10`
  ).join('\n')
  const goalSummary = goals.length === 0
    ? '- No explicit goals loaded.'
    : goals.map(goal => `- ${goal.metricName}: baseline ${goal.baselineValue}, target ${goal.targetValue}`).join('\n')
  const fallbackSummary = fallbackRecommendations.length === 0
    ? '- No fallback recommendations available.'
    : fallbackRecommendations.map(rec => `- ${rec.title}: ${rec.message}`).join('\n')

  const totalMade = sessions.reduce((sum, s) => sum + s.freeThrowsMade + s.spotShootingMade + s.closeRangeMade, 0)
  const totalAttempted = sessions.reduce((sum, s) => sum + s.freeThrowsAttempted + s.spotShootingAttempted + s.closeRangeAttempted, 0)

  return `
Player profile:
- Name: ${player.name}
- Age: ${player.age}
- Position focus: ${player.positionFocus}
- Notes: ${player.notes ?? ''}

Latest session:
- Date: ${latest.sessionDate}
- Development score: ${calcDevelopmentScore(latest)}
- Duration: ${latest.durationMinutes ?? 0} minutes
- Free throw percentage: ${calcPct(latest.freeThrowsMade, latest.freeThrowsAttempted)}%
- Spot shooting percentage: ${calcPct(latest.spotShootingMade, latest.spotShootingAttempted)}%
- Close range percentage: ${calcPct(latest.closeRangeMade, latest.closeRangeAttempted)}%
- Left hand: ${latest.leftHandControl}/10
- Form shooting: ${latest.formShooting}/10
- Guide hand: ${latest.guideHand}/10
- Footwork: ${latest.footwork}/10
- Stop-pop speed: ${latest.stopPopSpeed}/10
- Confidence: ${latest.confidence}/10

Aggregate shooting:
- Free Throws %: ${calcPct(sessions.reduce((sum, s) => sum + s.freeThrowsMade, 0), sessions.reduce((sum, s) => sum + s.freeThrowsAttempted, 0))}%
- Spot Shots %: ${calcPct(sessions.reduce((sum, s) => sum + s.spotShootingMade, 0), sessions.reduce((sum, s) => sum + s.spotShootingAttempted, 0))}%
- Close Range %: ${calcPct(sessions.reduce((sum, s) => sum + s.closeRangeMade, 0), sessions.reduce((sum, s) => sum + s.closeRangeAttempted, 0))}%
- Overall Shooting %: ${calcPct(totalMade, totalAttempted)}%

Recent sessions:
${recentSummary}

Current goals:
${goalSummary}

Deterministic fallback recommendations:
${fallbackSummary}
`.trim()
}
