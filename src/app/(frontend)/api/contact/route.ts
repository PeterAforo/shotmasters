import { NextResponse } from 'next/server'
import { sendContactNotification } from '@/lib/email'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const { name, email, message } = body ?? {}
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }
  await sendContactNotification({ name, email, message })
  return NextResponse.json({ ok: true })
}
