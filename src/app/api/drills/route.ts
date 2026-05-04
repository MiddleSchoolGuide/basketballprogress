import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { format } from 'date-fns'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') ?? format(new Date(), 'yyyy-MM-dd')

    const [drills, completions] = await Promise.all([
      prisma.drillChecklistItem.findMany({ orderBy: { id: 'asc' } }),
      prisma.sessionDrillCompletion.findMany({ where: { date } }),
    ])

    const result = drills.map(d => ({
      ...d,
      completed: completions.find(c => c.drillId === d.id)?.completed ?? false,
      completionId: completions.find(c => c.drillId === d.id)?.id ?? null,
      notes: completions.find(c => c.drillId === d.id)?.notes ?? null,
    }))

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch drills' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { drillId, date, completed, notes, sessionId } = body

    const existing = await prisma.sessionDrillCompletion.findFirst({
      where: { drillId: Number(drillId), date },
    })

    if (existing) {
      const updated = await prisma.sessionDrillCompletion.update({
        where: { id: existing.id },
        data: { completed, notes, sessionId: sessionId ? Number(sessionId) : null },
      })
      return NextResponse.json(updated)
    }

    const created = await prisma.sessionDrillCompletion.create({
      data: {
        drillId: Number(drillId),
        date,
        completed,
        notes,
        sessionId: sessionId ? Number(sessionId) : null,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to save drill completion' }, { status: 500 })
  }
}
