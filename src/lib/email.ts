import { Resend } from 'resend'

const resend = () =>
  process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM = () => process.env.EMAIL_FROM || 'Shot Masters <onboarding@resend.dev>'

const shell = (title: string, body: string) => `<!doctype html>
<html><body style="margin:0;padding:0;background:#05070f;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#05070f;padding:40px 16px">
<tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#0a0f1e;border:1px solid #1e293b;border-radius:16px;overflow:hidden">
<tr><td style="padding:24px 32px;border-bottom:1px solid #1e293b">
  <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:1px">SHOT MASTERS <span style="color:#22d3ee">CUE CLUB</span></span>
</td></tr>
<tr><td style="padding:32px;color:#cbd5e1;font-size:15px;line-height:1.7">
  <h1 style="margin:0 0 16px;font-size:24px;color:#ffffff">${title}</h1>
  ${body}
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #1e293b;font-size:12px;color:#64748b">
  Shot Masters Cue Club · Accra, Ghana
</td></tr>
</table></td></tr></table></body></html>`

const row = (k: string, v: string) =>
  `<tr><td style="padding:6px 0;color:#94a3b8;width:160px">${k}</td><td style="padding:6px 0;color:#ffffff;font-weight:600">${v}</td></tr>`

async function send(to: string, subject: string, html: string) {
  const client = resend()
  if (!client) {
    console.log(`[email] RESEND_API_KEY not set — skipped "${subject}" to ${to}`)
    return
  }
  try {
    await client.emails.send({ from: FROM(), to, subject, html })
  } catch (err) {
    console.error('[email] send failed:', err)
  }
}

export const sendBookingConfirmation = (to: string, d: {
  name: string; table: string; date: string; time: string; hours: number; total: number
}) =>
  send(to, '🎱 Your table is booked — Shot Masters', shell('Booking Confirmed', `
    <p>Nice one, ${d.name} — your table is locked in.</p>
    <table>${row('Table', d.table)}${row('Date', d.date)}${row('Time', d.time)}${row('Duration', `${d.hours}h`)}${row('Total', `GH₵ ${d.total}`)}</table>
    <p style="margin-top:20px;color:#94a3b8">Deposit paid online. Balance on arrival. Show this email at the desk.</p>`))

export const sendMembershipActive = (to: string, d: { name: string; plan: string; expiresAt: string }) =>
  send(to, '⭐ Membership activated — Shot Masters', shell('Welcome to the Club', `
    <p>${d.name}, your <strong style="color:#fbbf24">${d.plan}</strong> membership is now active.</p>
    <table>${row('Plan', d.plan)}${row('Valid until', d.expiresAt)}</table>
    <p style="margin-top:20px;color:#94a3b8">Flash this email — or your member account — for member rates and perks.</p>`))

export const sendTournamentEntry = (to: string, d: { name: string; tournament: string; date: string }) =>
  send(to, '🏆 Tournament entry confirmed — Shot Masters', shell('You\'re In', `
    <p>${d.name}, your spot in <strong style="color:#22d3ee">${d.tournament}</strong> is confirmed.</p>
    <table>${row('Tournament', d.tournament)}${row('Date', d.date)}</table>
    <p style="margin-top:20px;color:#94a3b8">Arrive 30 minutes early for the draw. Good luck at the table.</p>`))

export const sendContactNotification = (d: { name: string; email: string; message: string }) =>
  send(
    process.env.CONTACT_EMAIL || 'info@shotmasters.club',
    `?? New contact: ${d.name}`,
    shell('New Contact Form Message', `
      <table>${row('Name', d.name)}${row('Email', d.email)}</table>
      <p style="margin-top:16px;white-space:pre-wrap">${d.message}</p>`),
  )
