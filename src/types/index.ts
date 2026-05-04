export interface Player {
  id: number
  name: string
  age: number
  positionFocus: string
  notes?: string | null
  createdAt: string
}

export interface Session {
  id: number
  playerId: number
  sessionDate: string
  durationMinutes?: number | null
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
  coachNotes?: string | null
  createdAt: string
  updatedAt: string
}

export interface Goal {
  id: number
  playerId: number
  metricName: string
  baselineValue: number
  targetValue: number
  targetDate?: string | null
  createdAt: string
}

export interface DrillChecklistItem {
  id: number
  drillName: string
  category: string
  targetReps?: string | null
  description?: string | null
}

export interface SessionDrillCompletion {
  id: number
  sessionId?: number | null
  drillId: number
  date: string
  completed: boolean
  notes?: string | null
  drill: DrillChecklistItem
}

export interface SessionMetrics {
  freeThrowPct: number
  spotShootingPct: number
  closeRangePct: number
  overallShootingPct: number
  developmentScore: number
}

export interface TrendPoint {
  date: string
  value: number
  label: string
}

export type TrendDirection = 'improving' | 'declining' | 'flat'

export interface Recommendation {
  id: string
  type: 'warning' | 'success' | 'info' | 'action'
  title: string
  message: string
  priority: number
}
