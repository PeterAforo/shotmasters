import { NextResponse } from 'next/server'
import { getTableAvailability } from '@/lib/availability'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const table = searchParams.get('table')
  const date = searchParams.get('date')
  if (!table || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'table and date=YYYY-MM-DD required' }, { status: 400 })
  }
  const slots = await getTableAvailability(table, date)
  return NextResponse.json({ slots })
}
