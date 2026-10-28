import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { Reveal } from '@/components/anim/Reveal'
import { RichText } from '@/components/RichText'
import { PageHeader } from '@/components/site/PageHeader'
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
    <>
    <PageHeader
      title={post.title}
      crumbs={[{ label: 'The Club' }, { label: 'News', href: '/news' }, { label: post.title }]}
      image={img || '/media/img-06.jpg'}
    />
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-16 sm:px-8">
      <Reveal>
        <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-muted">
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
    </>
  )
}
