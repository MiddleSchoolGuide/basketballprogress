import { PrismaClient } from '@prisma/client'
import { subDays, startOfDay } from 'date-fns'

const prisma = new PrismaClient()

const GOAL_SEED = [
  { metricName: 'leftHandControl', baselineValue: 2, targetValue: 5 },
  { metricName: 'formShooting', baselineValue: 4, targetValue: 6 },
  { metricName: 'freeThrowPct', baselineValue: 30, targetValue: 50 },
  { metricName: 'spotShootingPct', baselineValue: 30, targetValue: 42 },
  { metricName: 'footwork', baselineValue: 3, targetValue: 6 },
  { metricName: 'stopPopSpeed', baselineValue: 4, targetValue: 6 },
] as const

const DRILL_SEED = [
  { drillName: 'Left-Hand Zig-Zag Dribble', category: 'Weak Hand', targetReps: '3 x down & back', description: 'Low dribble zig-zag coast to coast using only left hand' },
  { drillName: 'Weak-Hand Finishing', category: 'Weak Hand', targetReps: '10 makes', description: 'Left-hand layups from both sides' },
  { drillName: 'Stationary Left-Hand Dribble', category: 'Weak Hand', targetReps: '60 seconds', description: 'Stationary pound dribbles, left hand only, low and controlled' },
  { drillName: '1-Hand Form Shooting', category: 'Shooting', targetReps: '20 makes', description: 'Shooting arm only, 5 ft from basket, perfect arc and follow-through' },
  { drillName: 'Guide Hand Shooting', category: 'Shooting', targetReps: '15 makes', description: 'Full shot focusing on guide hand staying still and not pushing' },
  { drillName: 'Spot Shooting', category: 'Shooting', targetReps: '20 attempts', description: 'Mid-range spot shots from 5 spots on the floor' },
  { drillName: 'Free Throws', category: 'Free Throws', targetReps: '20 attempts', description: 'Full routine free throws with consistent pre-shot process' },
  { drillName: 'Footwork Slides', category: 'Footwork', targetReps: '3 x width', description: 'Defensive slides and offensive footwork patterns' },
  { drillName: 'Stop-and-Pop Shooting', category: 'Game Speed', targetReps: '10 makes', description: 'Catch off dribble, 1-2 stop, set shot - game speed' },
] as const

const SESSION_SEED = [
  {
    daysAgo: 14,
    leftHandControl: 2, rightHandControl: 7, formShooting: 4, guideHand: 3,
    freeThrowsMade: 3, freeThrowsAttempted: 10,
    spotShootingMade: 6, spotShootingAttempted: 20,
    closeRangeMade: 7, closeRangeAttempted: 10,
    stopPopSpeed: 4, footwork: 3, bigPlayerSkill: 4, confidence: 5,
    durationMinutes: 60,
    coachNotes: 'First session. Baseline established. Weak hand needs major work. Form shooting has elbow drift.',
  },
  {
    daysAgo: 11,
    leftHandControl: 2, rightHandControl: 7, formShooting: 4, guideHand: 3,
    freeThrowsMade: 4, freeThrowsAttempted: 10,
    spotShootingMade: 7, spotShootingAttempted: 20,
    closeRangeMade: 7, closeRangeAttempted: 10,
    stopPopSpeed: 4, footwork: 3, bigPlayerSkill: 4, confidence: 5,
    durationMinutes: 65,
    coachNotes: 'Slight FT improvement. Left hand still inconsistent. Keep pushing reps.',
  },
  {
    daysAgo: 8,
    leftHandControl: 3, rightHandControl: 7, formShooting: 5, guideHand: 4,
    freeThrowsMade: 4, freeThrowsAttempted: 10,
    spotShootingMade: 8, spotShootingAttempted: 20,
    closeRangeMade: 8, closeRangeAttempted: 10,
    stopPopSpeed: 4, footwork: 4, bigPlayerSkill: 4, confidence: 6,
    durationMinutes: 70,
    coachNotes: 'Big improvement in form shooting today. Left hand starting to show control. Guide hand stayed quiet.',
  },
  {
    daysAgo: 5,
    leftHandControl: 4, rightHandControl: 8, formShooting: 5, guideHand: 4,
    freeThrowsMade: 5, freeThrowsAttempted: 10,
    spotShootingMade: 8, spotShootingAttempted: 20,
    closeRangeMade: 8, closeRangeAttempted: 10,
    stopPopSpeed: 5, footwork: 5, bigPlayerSkill: 5, confidence: 6,
    durationMinutes: 75,
    coachNotes: 'Hit the 50% FT target for the first time! Footwork is coming along. Stop-and-pop timing improving.',
  },
  {
    daysAgo: 2,
    leftHandControl: 4, rightHandControl: 8, formShooting: 5, guideHand: 5,
    freeThrowsMade: 5, freeThrowsAttempted: 11,
    spotShootingMade: 9, spotShootingAttempted: 22,
    closeRangeMade: 9, closeRangeAttempted: 11,
    stopPopSpeed: 5, footwork: 5, bigPlayerSkill: 5, confidence: 7,
    durationMinutes: 75,
    coachNotes: 'Consistent session. Guide hand holding form. Spot shooting trending up. Keep the routine.',
  },
] as const

async function main() {
  const targetDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

  // Create player
  const player = await prisma.player.upsert({
    where: { id: 1 },
    update: {
      name: 'Marcus',
      age: 13,
      positionFocus: '3/4/5',
      notes: '13U player focused on big-man skill development, weak-hand control, and shooting mechanics.',
    },
    create: {
      name: 'Marcus',
      age: 13,
      positionFocus: '3/4/5',
      notes: '13U player focused on big-man skill development, weak-hand control, and shooting mechanics.',
    },
  })

  // Replace existing seed goals so reruns stay deterministic.
  await prisma.goal.deleteMany({ where: { playerId: player.id } })
  for (const goal of GOAL_SEED) {
    await prisma.goal.create({
      data: { ...goal, playerId: player.id, targetDate },
    })
  }

  // Replace existing drills and their completions so ids stay aligned with the seeded checklist.
  await prisma.sessionDrillCompletion.deleteMany({
    where: { drill: { drillName: { in: DRILL_SEED.map((drill) => drill.drillName) } } },
  })
  await prisma.drillChecklistItem.deleteMany({
    where: { drillName: { in: DRILL_SEED.map((drill) => drill.drillName) } },
  })
  for (const drill of DRILL_SEED) {
    await prisma.drillChecklistItem.create({ data: drill })
  }

  // Replace seeded sessions for the baseline player so reruns do not duplicate history.
  await prisma.sessionDrillCompletion.deleteMany({
    where: { session: { playerId: player.id } },
  })
  await prisma.session.deleteMany({ where: { playerId: player.id } })
  for (const s of SESSION_SEED) {
    await prisma.session.create({
      data: {
        playerId: player.id,
        sessionDate: startOfDay(subDays(new Date(), s.daysAgo)),
        durationMinutes: s.durationMinutes,
        leftHandControl: s.leftHandControl,
        rightHandControl: s.rightHandControl,
        formShooting: s.formShooting,
        guideHand: s.guideHand,
        freeThrowsMade: s.freeThrowsMade,
        freeThrowsAttempted: s.freeThrowsAttempted,
        spotShootingMade: s.spotShootingMade,
        spotShootingAttempted: s.spotShootingAttempted,
        closeRangeMade: s.closeRangeMade,
        closeRangeAttempted: s.closeRangeAttempted,
        stopPopSpeed: s.stopPopSpeed,
        footwork: s.footwork,
        bigPlayerSkill: s.bigPlayerSkill,
        confidence: s.confidence,
        coachNotes: s.coachNotes,
      },
    })
  }

  console.log('Seed complete: baseline player, goals, drills, and sample sessions synced.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
