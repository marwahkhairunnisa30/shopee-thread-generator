import { NextRequest, NextResponse } from 'next/server'
import { checkDailyLimit, clientIp, isOwnerCode, limitResponse } from '@/lib/limits'

export async function POST(req: NextRequest) {
  const limit = await checkDailyLimit('owner', clientIp(req), 5)
  if (!limit.allowed) return limitResponse(limit.resetIn)

  const { code } = await req.json()
  if (!isOwnerCode(typeof code === 'string' ? code : null)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  return NextResponse.json({ ok: true })
}
