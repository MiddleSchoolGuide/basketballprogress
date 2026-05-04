import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const playerId = searchParams.get('playerId')
    const goals = await prisma.goal.findMany({
      where: playerId ? { playerId: Number(playerId) } : undefined,
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(goals)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const goal = await prisma.goal.create({
      data: {
        playerId: Number(body.playerId),
        metricName: body.metricName,
        baselineValue: Number(body.baselineValue),
        targetValue: Number(body.targetValue),
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
      },
    })
    return NextResponse.json(goal, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}
