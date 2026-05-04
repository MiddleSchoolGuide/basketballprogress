import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await prisma.session.findUnique({ where: { id: Number(params.id) } })
    if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(session)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()

    if (body.freeThrowsMade > body.freeThrowsAttempted)
      return NextResponse.json({ error: 'Free throw makes cannot exceed attempts' }, { status: 400 })
    if (body.spotShootingMade > body.spotShootingAttempted)
      return NextResponse.json({ error: 'Spot shooting makes cannot exceed attempts' }, { status: 400 })
    if (body.closeRangeMade > body.closeRangeAttempted)
      return NextResponse.json({ error: 'Close range makes cannot exceed attempts' }, { status: 400 })

    const session = await prisma.session.update({
      where: { id: Number(params.id) },
      data: {
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
    return NextResponse.json(session)
  } catch {
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.sessionDrillCompletion.deleteMany({ where: { sessionId: Number(params.id) } })
    await prisma.session.delete({ where: { id: Number(params.id) } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
  }
}
