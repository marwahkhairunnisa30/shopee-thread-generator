import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 3
const WINDOW_MS = 60 * 60 * 1000

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: WINDOW_MS }
  }
  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now }
  }
  entry.count++
  return { allowed: true, remaining: RATE_LIMIT - entry.count, resetIn: entry.resetAt - now }
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
  const { allowed, remaining, resetIn } = checkRateLimit(ip)
  if (!allowed) {
    const retryAfter = Math.ceil(resetIn / 1000)
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  const { idea, format, hook, count, cta, product, detail, language, translateFrom } = await req.json()

  if (translateFrom) {
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

  const f = FORMATS[format] ?? FORMATS.Testimoni
  const langOut = LANG_OUT[language] ?? LANG_OUT.ID
  const n = Number(count) || 5

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
