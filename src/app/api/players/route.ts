import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const players = await prisma.player.findMany({ orderBy: { createdAt: 'asc' } })
    return NextResponse.json(players)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const player = await prisma.player.create({
      data: {
        name: body.name,
        age: body.age,
        positionFocus: body.positionFocus ?? '3/4/5',
        notes: body.notes,
      },
    })
    return NextResponse.json(player, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 })
  }
}
