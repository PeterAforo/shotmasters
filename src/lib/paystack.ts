import crypto from 'crypto'

const BASE = 'https://api.paystack.co'

const headers = () => ({
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
})

export const paystackConfigured = () => !!process.env.PAYSTACK_SECRET_KEY

export async function initializeTransaction(args: {
  email: string
  /** amount in major units (GHS) — converted to pesewas */
  amountGHS: number
  reference: string
  callbackUrl: string
  metadata: Record<string, unknown>
}): Promise<{ authorizationUrl: string; reference: string }> {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      email: args.email,
      amount: Math.round(args.amountGHS * 100), // pesewas
      currency: 'GHS',
      reference: args.reference,
      callback_url: args.callbackUrl,
      metadata: args.metadata,
    }),
  })
  const json = await res.json()
  if (!json.status) throw new Error(`Paystack init failed: ${json.message}`)
  return { authorizationUrl: json.data.authorization_url, reference: json.data.reference }
}

export async function verifyTransaction(reference: string): Promise<{
  success: boolean
  amountGHS: number
  email?: string
  metadata?: Record<string, unknown>
}> {
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: headers(),
  })
  const json = await res.json()
  if (!json.status) return { success: false, amountGHS: 0 }
  return {
    success: json.data.status === 'success',
    amountGHS: json.data.amount / 100,
    email: json.data.customer?.email,
    metadata: json.data.metadata,
  }
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex')
  return hash === signature
}
