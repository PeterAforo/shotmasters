/* Current club events — single source used by seed. */

const text = (t: string) => ({ type: 'text', version: 1, detail: 0, format: 0, mode: 'normal', style: '', text: t })
const para = (t: string) => ({
  type: 'paragraph', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, textFormat: 0, textStyle: '',
  children: [text(t)],
})
const richText = (paras: string[]) => ({
  root: { type: 'root', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, children: paras.map(para) },
})

export const FESTIVAL = {
  title: 'Shot Masters December Cue Festival 2026',
  slug: 'december-cue-festival-2026',
  theme: 'Clash of the Titans',
  status: 'registration' as const,
  date: '2026-12-12T09:00:00.000Z',
  endDate: '2026-12-12T21:00:00.000Z',
  time: '9:00 AM \u2013 9:00 PM',
  format: 'knockout' as const,
  entryFee: 0,
  prizePool: 'GH\u20b5 30,000 for the top eight finishers, plus special awards',
  maxPlayers: 256,
  venue: 'Indoor Multipurpose Arena, Borteyman Sports Complex, Accra',
  spectators: 'Free admission',
  posterUrl: '/media/events/cue-festival-2026.jpg',
  registration: {
    method: 'external' as const,
    label: 'Register with MojoPay',
    ussdCode: '*789*411#',
    eventCode: '4387',
    phone: '0544949022',
  },
  description: richText([
    'The Shot Masters December Cue Festival 2026 is a celebration of competitive cue sports, Ghanaian culture, entertainment and community, organised by Shot Masters Cue Club (SMCC).',
    'Scheduled for Saturday, 12 December 2026, at the Indoor Multipurpose Arena, Borteyman Sports Complex, Accra, the festival is endorsed by the Ghana Tourism Authority as part of the December in GH 2026 initiative, promoting Ghana as a destination for sports tourism and cultural experiences.',
    'Under the exciting theme \u201cClash of the Titans,\u201d the festival aims to bring together up to 256 pool players, alongside enthusiasts, spectators and visitors from Ghana and abroad, for an action-packed day of International 8-Ball competition.',
    'Featuring eight pool tables, the festival will showcase competitive play, exciting cash prizes, Ghanaian traditional music and dance, guest musical performances and a vibrant social atmosphere. Planned livestream coverage will extend the experience to audiences beyond the venue.',
    'Beyond competition, the festival reflects SMCC\u2019s commitment to youth development, sportsmanship, social inclusion and community engagement, while promoting cue sports as a platform for positive social impact.',
    'Shot Masters Cue Club \u2014 People. Play. Passion.',
    'Ghana to the World \u2014 Experience the excitement of cue sports this December!',
  ]),
}
