import React from 'react'

/* Minimal Lexical serialized-state renderer */

type Node = {
  type?: string
  text?: string
  format?: number | string
  tag?: string
  children?: Node[]
  fields?: { url?: string; newTab?: boolean }
  url?: string
}

function renderChildren(children?: Node[], keyPrefix = 'k'): React.ReactNode {
  return children?.map((node, i) => renderNode(node, `${keyPrefix}-${i}`))
}

function renderNode(node: Node, key: string): React.ReactNode {
  switch (node.type) {
    case 'text': {
      let el: React.ReactNode = node.text
      const fmt = typeof node.format === 'number' ? node.format : 0
      if (fmt & 1) el = <strong key={key}>{el}</strong>
      if (fmt & 2) el = <em key={key}>{el}</em>
      if (fmt & 8) el = <u key={key}>{el}</u>
      if (fmt & 4) el = <s key={key}>{el}</s>
      if (fmt & 16) el = <code key={key} className="rounded bg-surface-2 px-1.5 py-0.5 text-cyan-neon">{el}</code>
      return <React.Fragment key={key}>{el}</React.Fragment>
    }
    case 'heading': {
      const tag = (node.tag as 'h1' | 'h2' | 'h3' | 'h4') || 'h2'
      const cls: Record<string, string> = {
        h1: 'font-display text-4xl mt-8 mb-4',
        h2: 'font-display text-3xl mt-8 mb-4',
        h3: 'font-display text-2xl mt-6 mb-3',
        h4: 'font-display text-xl mt-6 mb-3',
      }
      return React.createElement(tag, { key, className: cls[tag] }, renderChildren(node.children, key))
    }
    case 'paragraph':
      return (
        <p key={key} className="mb-4 leading-relaxed text-muted">
          {renderChildren(node.children, key)}
        </p>
      )
    case 'list': {
      const tag = (node.tag as 'ul' | 'ol') === 'ol' ? 'ol' : 'ul'
      return React.createElement(
        tag,
        { key, className: `mb-4 space-y-2 pl-6 ${tag === 'ul' ? 'list-disc' : 'list-decimal'} text-muted` },
        renderChildren(node.children, key),
      )
    }
    case 'listitem':
      return <li key={key}>{renderChildren(node.children, key)}</li>
    case 'link': {
      const url = node.fields?.url || node.url || '#'
      return (
        <a key={key} href={url} target={node.fields?.newTab ? '_blank' : undefined} rel="noreferrer" className="text-cyan-neon underline underline-offset-4">
          {renderChildren(node.children, key)}
        </a>
      )
    }
    case 'quote':
      return (
        <blockquote key={key} className="my-6 border-l-2 border-cyan-neon pl-5 italic text-ink">
          {renderChildren(node.children, key)}
        </blockquote>
      )
    case 'horizontalrule':
      return <hr key={key} className="my-8 border-line" />
    case 'linebreak':
      return <br key={key} />
    default:
      return node.children ? <React.Fragment key={key}>{renderChildren(node.children, key)}</React.Fragment> : null
  }
}

export function RichText({ data, className }: { data: { root?: Node } | null | undefined; className?: string }) {
  const root = data?.root
  if (!root?.children?.length) return null
  return <div className={className}>{renderChildren(root.children)}</div>
}
