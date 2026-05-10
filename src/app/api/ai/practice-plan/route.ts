import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { buildPracticePlanInput, practicePlanInstructions, practicePlanSchema } from '@/lib/aiPracticePlan'
import { generateRecommendations } from '@/lib/recommendations'
import type { Goal, Player, Session } from '@/types'

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI practice planning is not configured on the server.' }, { status: 503 })
    }

    const body = await req.json()
    const playerId = Number(body.playerId)
    if (!Number.isFinite(playerId) || playerId <= 0) {
      return NextResponse.json({ error: 'Valid playerId is required.' }, { status: 400 })
    }

    const [player, sessions, goals] = await Promise.all([
      prisma.player.findUnique({ where: { id: playerId } }),
      prisma.session.findMany({ where: { playerId }, orderBy: { sessionDate: 'desc' } }),
      prisma.goal.findMany({ where: { playerId }, orderBy: { createdAt: 'asc' } }),
    ])

    if (!player) {
      return NextResponse.json({ error: 'Player not found.' }, { status: 404 })
    }
    if (sessions.length === 0) {
      return NextResponse.json({ error: 'Log at least one session before generating an AI practice plan.' }, { status: 400 })
    }

    const typedPlayer = player as unknown as Player
    const typedSessions = sessions as unknown as Session[]
    const typedGoals = goals as unknown as Goal[]
    const recommendations = generateRecommendations(typedSessions)

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        instructions: practicePlanInstructions,
        input: buildPracticePlanInput(typedPlayer, typedSessions, typedGoals, recommendations),
        text: {
          format: {
            type: 'json_schema',
            name: 'basketball_practice_plan',
            description: 'A structured youth basketball practice adjustment plan.',
            schema: practicePlanSchema,
            strict: true,
          },
        },
      }),
    })

    const payload = await response.json()

    if (!response.ok) {
      const apiError = payload?.error
      const message = apiError?.message || apiError?.code || 'Failed to generate AI practice plan.'
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const outputText = payload?.output_text
      || payload?.output?.flatMap((item: { content?: Array<{ type?: string, text?: string }> }) => item.content || [])
        ?.find((item: { type?: string }) => item.type === 'output_text')
        ?.text

    if (!outputText) {
      return NextResponse.json({ error: 'OpenAI response did not include a practice plan.' }, { status: 502 })
    }

    const plan = JSON.parse(outputText)
    return NextResponse.json(plan)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate AI practice plan'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
