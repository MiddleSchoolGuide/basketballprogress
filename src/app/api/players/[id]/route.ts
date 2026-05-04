import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const player = await prisma.player.findUnique({ where: { id: Number(params.id) } })
    if (!player) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(player)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch player' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const player = await prisma.player.update({
      where: { id: Number(params.id) },
      data: {
        name: body.name,
        age: body.age,
        positionFocus: body.positionFocus,
        notes: body.notes,
      },
    })
    return NextResponse.json(player)
  } catch {
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 })
  }
}
