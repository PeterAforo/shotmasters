/* Seed Shot Masters with demo content. Run: npm run seed */
import './loadenv'

import { getPayload } from 'payload'
import config from './payload.config'

const paragraph = (text: string) => ({
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'paragraph',
        version: 1,
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        textFormat: 0,
        textStyle: '',
        children: [{ type: 'text', version: 1, detail: 0, format: 0, mode: 'normal', style: '', text }],
      },
    ],
  },
})

async function main() {
  const payload = await getPayload({ config })
  console.log('Seeding Shot Masters\u2026')

  // \u2500\u2500 users
  const existingUsers = await payload.find({ collection: 'users', limit: 1 })
  if (!existingUsers.docs.length) {
    await payload.create({
      collection: 'users',
      data: { email: 'admin@shotmasters.club', password: 'ShotMasters!2026', name: 'Club Admin', role: 'admin' },
      overrideAccess: true,
    })
    console.log('  \u2713 admin user \u2192 admin@shotmasters.club / ShotMasters!2026')
  }

  // \u2500\u2500 demo member
  let memberId
  const existingMember = await payload.find({ collection: 'members', where: { email: { equals: 'demo@smcc.gh' } }, limit: 1, overrideAccess: true })
  if (existingMember.docs.length) {
    memberId = existingMember.docs[0].id
  } else {
    const m = await payload.create({
      collection: 'members',
      data: { email: 'demo@smcc.gh', password: 'DemoPlayer!8', name: 'Kwame Demo', phone: '0551234567', isPlayer: true, nickname: 'KD' },
      overrideAccess: true,
    })
    memberId = m.id
    console.log('  \u2713 demo member \u2192 demo@smcc.gh / DemoPlayer!8')
  }

  // \u2500\u2500 tables
  const tables = [
    { name: 'Championship 1', type: 'snooker', hourlyRate: 60, depositAmount: 30, sortOrder: 1, features: ['Strachan competition cloth', 'Aramith Tournament Champion balls', 'Pro LED shadowless lighting'] },
    { name: 'Championship 2', type: 'snooker', hourlyRate: 60, depositAmount: 30, sortOrder: 2, features: ['Strachan competition cloth', 'Aramith balls', 'Climate controlled'] },
    { name: 'Masters Table', type: 'snooker', hourlyRate: 50, depositAmount: 25, sortOrder: 3, features: ['Match cloth', 'Coaching-friendly layout'] },
    { name: 'Pool Hall 1', type: 'pool', hourlyRate: 40, depositAmount: 20, sortOrder: 4, features: ['9ft table', 'House cues included'] },
    { name: 'Pool Hall 2', type: 'pool', hourlyRate: 40, depositAmount: 20, sortOrder: 5, features: ['9ft table', 'House cues included'] },
    { name: 'VIP Lounge Table', type: 'snooker', hourlyRate: 90, depositAmount: 45, sortOrder: 6, features: ['Private lounge', 'Table service', 'Premium cues'] },
  ]
  const tableCount = await payload.count({ collection: 'tables', overrideAccess: true })
  if (!tableCount.totalDocs) {
    for (const t of tables) {
      await payload.create({ collection: 'tables', data: { ...t, status: 'available', features: t.features.map((f) => ({ feature: f })) } as never, overrideAccess: true })
    }
    console.log(`  \u2713 ${tables.length} tables`)
  }

  // \u2500\u2500 membership plans
  const plans = [
    { name: 'Bronze', slug: 'bronze', priceGHS: 150, interval: 'monthly', sortOrder: 1, perks: ['10% off table rates', 'Member nights access', 'Loyalty points'] },
    { name: 'Silver', slug: 'silver', priceGHS: 300, interval: 'monthly', sortOrder: 2, featured: true, perks: ['25% off table rates', 'Priority booking window', '1 free tournament entry / month', 'Member nights + guests'] },
    { name: 'Gold', slug: 'gold', priceGHS: 800, interval: 'monthly', sortOrder: 3, perks: ['40% off table rates', 'VIP lounge access', 'Free tournament entries', 'Personal locker', 'Guest passes (2/month)'] },
  ]
  const planCount = await payload.count({ collection: 'membership-plans', overrideAccess: true })
  if (!planCount.totalDocs) {
    for (const p of plans) {
      await payload.create({ collection: 'membership-plans', data: { ...p, perks: p.perks.map((perk) => ({ perk })) } as never, overrideAccess: true })
    }
    console.log(`  \u2713 ${plans.length} membership plans`)
  }

  // \u2500\u2500 tournaments
  const inDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d }
  const tournaments = [
    { title: 'December Cue Festival 2026 — Clash of the Titans', status: 'upcoming', date: new Date('2026-12-12T10:00:00Z'), format: 'knockout', entryFee: 200, prizePool: 'GH\u20b5 5,000 + trophy', maxPlayers: 64, venue: 'Borteyman Sports Complex, Accra', description: paragraph('Our flagship December event — Clash of the Titans at Borteyman Sports Complex on 12 December 2026. International 8-Ball, big prizes, bigger atmosphere. Details updated as confirmed.') },
    { title: 'Accra Open Championship', status: 'registration', date: inDays(14), format: 'knockout', entryFee: 100, prizePool: 'GH\u20b5 2,000 + trophy', maxPlayers: 32, venue: 'Shot Masters Cue Club \u2014 Main Hall', description: paragraph('Our flagship ranking event. Best-of-5 frames, seeded draw, GH\u20b5 2,000 prize pool. Open to all members and invited guests. Registration closes 48 hours before the draw.') },
    { title: 'Friday Night Shootout', status: 'registration', date: inDays(5), format: 'knockout', entryFee: 30, prizePool: 'GH\u20b5 500', maxPlayers: 16, venue: 'Shot Masters Cue Club', description: paragraph('Fast, loud, single-frame shootouts every Friday night. Perfect for sharpening your competitive nerve.') },
    { title: 'Winter League \u2014 Week 8', status: 'ongoing', date: inDays(-2), format: 'league', entryFee: 0, prizePool: 'League points', maxPlayers: 24, venue: 'Shot Masters Cue Club', description: paragraph('Week 8 of the winter league. Top 4 at season end qualify for the championship playoff.') },
    { title: 'June Ranking Final', status: 'completed', date: inDays(-30), format: 'knockout', entryFee: 80, prizePool: 'GH\u20b5 1,500', maxPlayers: 32, results: [{ placement: 1, playerName: 'K. Mensah' }, { placement: 2, playerName: 'A. Boateng' }, { placement: 3, playerName: 'Y. Asante' }], description: paragraph('The June ranking final \u2014 congrats to K. Mensah on the title.') },
  ]
  const tCount = await payload.count({ collection: 'tournaments', overrideAccess: true })
  if (!tCount.totalDocs) {
    for (const t of tournaments) {
      await payload.create({ collection: 'tournaments', data: t as never, overrideAccess: true })
    }
    console.log(`  \u2713 ${tournaments.length} tournaments`)
  }

  // \u2500\u2500 rankings
  const rankings = [
    { rank: 1, playerName: 'K. Mensah', wins: 34, losses: 6, highBreak: 127, points: 2140, trend: 'same' },
    { rank: 2, playerName: 'A. Boateng', wins: 31, losses: 9, highBreak: 104, points: 1980, trend: 'up' },
    { rank: 3, playerName: 'Y. Asante', wins: 28, losses: 10, highBreak: 98, points: 1855, trend: 'down' },
    { rank: 4, playerName: 'D. Owusu', wins: 25, losses: 12, highBreak: 87, points: 1720, trend: 'up' },
    { rank: 5, playerName: 'S. Adjei', wins: 22, losses: 14, highBreak: 76, points: 1605, trend: 'same' },
    { rank: 6, playerName: 'E. Darko', wins: 19, losses: 15, highBreak: 82, points: 1490, trend: 'up' },
    { rank: 7, playerName: 'M. Osei', wins: 17, losses: 17, highBreak: 65, points: 1380, trend: 'down' },
    { rank: 8, playerName: 'J. Appiah', wins: 14, losses: 18, highBreak: 58, points: 1245, trend: 'same' },
  ]
  const rCount = await payload.count({ collection: 'rankings', overrideAccess: true })
  if (!rCount.totalDocs) {
    for (const r of rankings) {
      await payload.create({ collection: 'rankings', data: r as never, overrideAccess: true })
    }
    console.log(`  \u2713 ${rankings.length} ranking entries`)
  }

  // \u2500\u2500 posts
  const posts = [
    { title: 'Accra Open Registration Now Live', category: 'announcement', status: 'published', publishedAt: new Date(), excerpt: 'Our biggest ranking event of the year opens for entries today \u2014 32 spots, GH\u20b5 2,000 on the line.', content: paragraph('Registration for the Accra Open Championship is officially live. 32 spots, seeded draw, best-of-5 frames. Entry is GH\u20b5 100 and closes 48 hours before the event. Members at Silver tier and above get one free entry per month \u2014 check your account.') },
    { title: 'Friday Shootout: Mensah Runs a 127', category: 'match-report', status: 'published', publishedAt: inDays(-4), excerpt: 'A century-plus break lit up Friday night as the season leader extended his run.', content: paragraph('Kwame Mensah compiled a superb 127 in frame three of his quarter-final, the highest break of the season so far. The Friday Night Shootout continues this week \u2014 16 spots, GH\u20b5 30 entry.') },
    { title: 'New VIP Lounge Table Available', category: 'news', status: 'published', publishedAt: inDays(-10), excerpt: 'Private lounge, table service, premium cues \u2014 bookable now.', content: paragraph('The VIP Lounge Table is now open for bookings at GH\u20b5 90/hr with a private seating area and dedicated service. Ideal for celebrations, corporate nights and serious practice sessions.') },
  ]
  const pCount = await payload.count({ collection: 'posts', overrideAccess: true })
  if (!pCount.totalDocs) {
    for (const p of posts) {
      await payload.create({ collection: 'posts', data: p as never, overrideAccess: true })
    }
    console.log(`  \u2713 ${posts.length} posts`)
  }

  // \u2500\u2500 gallery
  const gCount = await payload.count({ collection: 'gallery-items', overrideAccess: true })
  if (!gCount.totalDocs) {
    const items = ['Championship Night', 'Break Shot', 'The Lounge', 'Trophy Wall', 'Cue Rack', 'Finals Night']
    for (const [i, title] of items.entries()) {
      await payload.create({ collection: 'gallery-items', data: { title, type: 'photo', category: 'club', caption: 'Placeholder \u2014 upload a photo in the CMS', sortOrder: i }, overrideAccess: true })
    }
    console.log(`  \u2713 ${items.length} gallery placeholders`)
  }

  // \u2500\u2500 globals
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      clubName: 'Shot Masters Cue Club',
      tagline: 'Accra\u2019s home of championship snooker',
      phone: '+233 55 123 4567',
      whatsappNumber: '233551234567',
      email: 'info@shotmasters.club',
      address: '12 Independence Avenue, Osu',
      city: 'Accra, Ghana',
      openingHours: [
        { days: 'Mon \u2013 Thu', hours: '10:00 \u2013 23:00' },
        { days: 'Fri \u2013 Sat', hours: '10:00 \u2013 01:00' },
        { days: 'Sunday', hours: '12:00 \u2013 22:00' },
      ],
      socials: [
        { platform: 'instagram', url: 'https://instagram.com/shotmasterscc' },
        { platform: 'tiktok', url: 'https://tiktok.com/@shotmasterscc' },
        { platform: 'facebook', url: 'https://facebook.com/shotmasterscc' },
      ],
      marqueeText: 'SHOT MASTERS CUE CLUB \u2726 CHAMPIONSHIP TABLES \u2726 OPEN DAILY 10AM\u201311PM \u2726 ACCRA, GHANA',
    },
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      navItems: [
        { label: 'Home', href: '/', kind: 'link' },
        { label: 'About', href: '/about', kind: 'link' },
        { label: 'Membership', href: '/membership', kind: 'link' },
        {
          label: 'The Club',
          kind: 'group',
          children: [
            { label: 'Tournaments', href: '/tournaments' },
            { label: 'Leaderboard', href: '/leaderboard' },
            { label: 'News', href: '/news' },
            { label: 'Partnerships', href: '/partnerships' },
          ],
        },
        {
          label: 'Media',
          kind: 'group',
          children: [{ label: 'Gallery', href: '/gallery' }],
        },
        { label: 'Sports Tourism & Community', href: '/tourism', kind: 'link' },
        { label: 'Contact', href: '/contact', kind: 'link' },
      ],
      ctaLabel: 'Join',
      ctaHref: '/membership',
    },
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'home-page',
    data: {
      heroSlides: [
        { headline: 'WHERE LEGENDS BREAK', subtext: 'Championship snooker in the heart of Accra.', ctaLabel: 'Book a Table', ctaHref: '/book' },
        { headline: 'FRIDAY NIGHT LIGHTS', subtext: 'Weekly shootouts. Real competition. Real glory.', ctaLabel: 'Enter a Tournament', ctaHref: '/tournaments' },
        { headline: 'JOIN THE MASTERS', subtext: 'Member rates, priority tables, club nights.', ctaLabel: 'See Memberships', ctaHref: '/membership' },
      ],
      stats: [
        { label: 'Pro Tables', value: 6 },
        { label: 'Members', value: 120, suffix: '+' },
        { label: 'Events / Year', value: 40, suffix: '+' },
        { label: 'Club High Break', value: 147 },
      ],
      aboutTeaser: 'Championship tables, cold drinks, and Accra\u2019s sharpest cue community.',
      sections: { showTables: true, showMembership: true, showTournaments: true, showLeaderboard: true, showGallery: true },
    },
    overrideAccess: true,
  })
  console.log('  \u2713 site settings, navigation, homepage')

  console.log('\nDone. Admin: http://localhost:3000/admin  (admin@shotmasters.club / ShotMasters!2026)')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
