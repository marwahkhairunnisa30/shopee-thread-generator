import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const GENERATE_LIMIT = 3
const TRANSLATE_LIMIT = 10
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

async function checkDailyLimit(kind: 'gen' | 'tr', ip: string, limit: number) {
  const { day, resetIn } = jakartaDay(Date.now())
  const used = await incrementCount(`rl:${kind}:${day}:${ip}`)
  return { allowed: used <= limit, remaining: Math.max(0, limit - used), resetIn }
}

function limitResponse(resetIn: number) {
  const retryAfter = Math.ceil(resetIn / 1000)
  return NextResponse.json(
    { error: 'Rate limit exceeded', retryAfter },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )
}

const FORMATS: Record<string, [string, string]> = {
  Testimoni:  ['Testimonial', 'Honest review from personal experience'],
  Curiosity:  ['Create curiosity', 'Build intrigue, reveal later'],
  Cerita:     ['Personal story', 'Personal journey, product as the fix'],
  Baru:       ['New find', 'Discovery story, excited but genuine'],
  Viral:      ['Viral item', 'Honest take on what\'s trending'],
  Tips:       ['Life tips', 'Tips and hacks, product as the enabler'],
}

const LANG_OUT: Record<string, string> = {
  ID: 'natural, casual Bahasa Indonesia as spoken on Threads (bisa campur sedikit English)',
  EN: 'natural, casual English as written on Threads',
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
  const { idea, format, hook, count, cta, product, detail, language, translateFrom } = await req.json()

  if (translateFrom) {
    const valid = Array.isArray(translateFrom) && translateFrom.length <= 10 &&
      translateFrom.every((t: unknown) => typeof t === 'string' && t.length <= 400)
    if (!valid) return NextResponse.json({ error: 'Invalid thread' }, { status: 400 })
    const limit = await checkDailyLimit('tr', ip, TRANSLATE_LIMIT)
    if (!limit.allowed) return limitResponse(limit.resetIn)

    const prompt = `Translate this Threads post thread into ${LANG_OUT[language] ?? LANG_OUT.EN}. Keep tone, structure and the same number of tweets. Return ONLY a JSON array of strings.\n${JSON.stringify(translateFrom)}`
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (msg.content[0] as { type: string; text: string }).text
    const arr = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1))
    return NextResponse.json({ tweets: arr.map((x: unknown) => typeof x === 'string' ? x : (x as Record<string, string>).text || '') })
  }

  if (!idea || idea.trim().length < 20) {
    return NextResponse.json({ error: 'Idea too short' }, { status: 400 })
  }
  if (idea.length > 2000 || String(product ?? '').length > 300 || String(detail ?? '').length > 1500) {
    return NextResponse.json({ error: 'Input too long' }, { status: 400 })
  }

  const { allowed, remaining, resetIn } = await checkDailyLimit('gen', ip, GENERATE_LIMIT)
  if (!allowed) return limitResponse(resetIn)

  const f = FORMATS[format] ?? FORMATS.Testimoni
  const langOut = LANG_OUT[language] ?? LANG_OUT.ID
  const n = [3, 5, 7, 10].includes(Number(count)) ? Number(count) : 5

  const prompt = `You write Shopee affiliate threads for Threads/X that read like a real personal story, never like an ad.
Idea: ${idea.trim()}
Format: ${f[0]} (${f[1]}). Hook style for tweet 1: ${hook === 'Auto' ? 'pick the best fit' : hook}.
Number of tweets: exactly ${n}. Each tweet under 280 characters, conversational, no hashtags spam, max 1 emoji per tweet.
CTA: ${cta === 'bio' ? 'last tweet points readers to the link in bio' : 'last tweet includes the placeholder [link] inline'}.
${product || detail ? 'Product: ' + product + '. Details: ' + detail + '.' : ''}
Language: ${langOut}.
Return ONLY a JSON array of ${n} strings, one per tweet.`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (msg.content[0] as { type: string; text: string }).text
  const arr = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1))
  const tweets = arr.map((x: unknown) => typeof x === 'string' ? x : (x as Record<string, string>).text || '').slice(0, n)

  return NextResponse.json({ tweets, remaining })
}
