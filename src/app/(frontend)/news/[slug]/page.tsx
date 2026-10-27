import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { Reveal } from '@/components/anim/Reveal'
import { RichText } from '@/components/RichText'
import { TransitionLink } from '@/components/anim/PageTransition'
import { formatDate, mediaUrl } from '@/lib/utils'

export const revalidate = 60

async function getPost(slug: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug).catch(() => null)
  return post ? { title: post.title, description: post.excerpt ?? undefined } : {}
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const img = mediaUrl(post.coverImage, 'hero')

  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <TransitionLink href="/news" className="text-xs font-semibold uppercase tracking-widest text-muted hover:text-cyan-neon">
          ? All news
        </TransitionLink>
        <h1 className="mt-6 font-display text-4xl leading-[0.95] text-ink sm:text-6xl">{post.title}</h1>
        <div className="mt-4 flex items-center gap-4 text-xs uppercase tracking-widest text-muted">
          <span className="text-pink-neon">{post.category}</span>
          <span>{formatDate(post.publishedAt)}</span>
        </div>
      </Reveal>

      {img && (
        <Reveal delay={0.1} className="mt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={post.title} className="w-full rounded-2xl border border-line object-cover" />
        </Reveal>
      )}

      <Reveal delay={0.15} className="mt-10">
        <RichText data={post.content} className="text-lg" />
      </Reveal>
    </article>
  )
}
