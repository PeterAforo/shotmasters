// Club WhatsApp line (0544949022), international format, digits only
export const CLUB_WHATSAPP = '233544949022'

const number = () => CLUB_WHATSAPP

export function waLink(message: string): string {
  return `https://wa.me/${number()}?text=${encodeURIComponent(message)}`
}

export const waMessages = {
  general: "Hi Shot Masters! I'd like to know more about the club.",
  booking: (table: string, date: string, time: string) =>
    `Hi Shot Masters! I just booked ${table} for ${date} at ${time}. See you soon!`,
  tournament: (title: string) =>
    `Hi Shot Masters! I've entered the ${title} tournament. Count me in!`,
  membership: (plan: string) =>
    `Hi Shot Masters! I just activated my ${plan} membership.`,
}
