import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const playerId = searchParams.get('playerId')
    const limit = searchParams.get('limit')

    const sessions = await prisma.session.findMany({
      where: playerId ? { playerId: Number(playerId) } : undefined,
      orderBy: { sessionDate: 'desc' },
      take: limit ? Number(limit) : undefined,
    })
    return NextResponse.json(sessions)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate makes <= attempts
    if (body.freeThrowsMade > body.freeThrowsAttempted)
      return NextResponse.json({ error: 'Free throw makes cannot exceed attempts' }, { status: 400 })
    if (body.spotShootingMade > body.spotShootingAttempted)
      return NextResponse.json({ error: 'Spot shooting makes cannot exceed attempts' }, { status: 400 })
    if (body.closeRangeMade > body.closeRangeAttempted)
      return NextResponse.json({ error: 'Close range makes cannot exceed attempts' }, { status: 400 })

    const session = await prisma.session.create({
      data: {
        playerId: Number(body.playerId),
        sessionDate: new Date(body.sessionDate),
        durationMinutes: body.durationMinutes ? Number(body.durationMinutes) : null,
        leftHandControl: Number(body.leftHandControl),
        rightHandControl: Number(body.rightHandControl),
        formShooting: Number(body.formShooting),
        guideHand: Number(body.guideHand),
        freeThrowsMade: Number(body.freeThrowsMade),
        freeThrowsAttempted: Number(body.freeThrowsAttempted),
        spotShootingMade: Number(body.spotShootingMade),
        spotShootingAttempted: Number(body.spotShootingAttempted),
        closeRangeMade: Number(body.closeRangeMade),
        closeRangeAttempted: Number(body.closeRangeAttempted),
        stopPopSpeed: Number(body.stopPopSpeed),
        footwork: Number(body.footwork),
        bigPlayerSkill: Number(body.bigPlayerSkill),
        confidence: Number(body.confidence),
        coachNotes: body.coachNotes || null,
      },
    })
    return NextResponse.json(session, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create session'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
