import { NextRequest, NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'crypto'

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000

const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

// Used only until Redis is connected; resets whenever the serverless instance does.
const memoryCounts = new Map<string, number>()

function jakartaDay(now: number) {
  const shifted = now + JAKARTA_OFFSET_MS
  const day = new Date(shifted).toISOString().slice(0, 10)
  const nextMidnight = Math.floor(shifted / 86_400_000 + 1) * 86_400_000 - JAKARTA_OFFSET_MS
  return { day, resetIn: nextMidnight - now }
}

async function incrementCount(key: string): Promise<number> {
  if (!REDIS_URL || !REDIS_TOKEN) {
    const n = (memoryCounts.get(key) ?? 0) + 1
    memoryCounts.set(key, n)
    return n
  }
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    body: JSON.stringify([['INCR', key], ['EXPIRE', key, 172800]]),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Redis ${res.status}`)
  const [incr] = await res.json()
  return Number(incr.result)
}

export function clientIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
}

export async function checkDailyLimit(kind: 'gen' | 'tr' | 'owner', ip: string, limit: number) {
  const { day, resetIn } = jakartaDay(Date.now())
  const used = await incrementCount(`rl:${kind}:${day}:${ip}`)
  return { allowed: used <= limit, remaining: Math.max(0, limit - used), resetIn }
}

export function limitResponse(resetIn: number) {
  const retryAfter = Math.ceil(resetIn / 1000)
  return NextResponse.json(
    { error: 'Rate limit exceeded', retryAfter },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )
}

export function isOwnerCode(code: string | null | undefined) {
  const secret = process.env.OWNER_CODE
  if (!code || !secret) return false
  const a = createHash('sha256').update(code).digest()
  const b = createHash('sha256').update(secret).digest()
  return timingSafeEqual(a, b)
}
