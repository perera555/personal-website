import type { ReactNode } from "react";

/**
 * A tiny Markdown renderer for blog posts. It builds React elements directly
 * (never raw HTML), so post content can't inject scripts.
 *
 * Supports: # headings, paragraphs, - / 1. lists, > quotes, ``` code blocks,
 * --- dividers, ![alt](image), **bold**, *italic*, `code`, [links](url).
 */

const safeHref = (url: string) => (/^(https?:\/\/|\/|#|mailto:)/i.test(url.trim()) ? url.trim() : "#");

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  // order matters: code, image, link, bold, italic
  const re = /(`[^`]+`)|(!\[[^\]]*\]\([^)\s]+\))|(\[[^\]]+\]\([^)\s]+\))|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (m[1]) out.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else if (m[2]) {
      const [, alt, src] = tok.match(/!\[([^\]]*)\]\(([^)\s]+)\)/)!;
      // eslint-disable-next-line @next/next/no-img-element
      out.push(<img key={key} src={safeHref(src)} alt={alt} loading="lazy" />);
    } else if (m[3]) {
      const [, label, href] = tok.match(/\[([^\]]+)\]\(([^)\s]+)\)/)!;
      const url = safeHref(href);
      const external = /^https?:/i.test(url);
      out.push(
        <a key={key} href={url} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {inline(label, key)}
        </a>,
      );
    } else if (m[4]) out.push(<strong key={key}>{inline(tok.slice(2, -2), key)}</strong>);
    else if (m[5]) out.push(<em key={key}>{inline(tok.slice(1, -1), key)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];
    const key = `b${k++}`;

    if (!line.trim()) {
      i++;
      continue;
    }

    // Code block
    if (line.trimStart().startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) code.push(lines[i++]);
      i++; // closing fence
      blocks.push(
        <pre key={key}>
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // Heading
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = Math.min(h[1].length + 1, 4); // "#" → h2 (the page title is the h1)
      const content = inline(h[2], key);
      blocks.push(level === 2 ? <h2 key={key}>{content}</h2> : level === 3 ? <h3 key={key}>{content}</h3> : <h4 key={key}>{content}</h4>);
      i++;
      continue;
    }

    // Divider
    if (/^(-{3,}|\*{3,})\s*$/.test(line.trim())) {
      blocks.push(<hr key={key} />);
      i++;
      continue;
    }

    // Quote
    if (line.startsWith(">")) {
      const q: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) q.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push(<blockquote key={key}>{inline(q.join(" "), key)}</blockquote>);
      continue;
    }

    // Lists
    const isUl = (l: string) => /^\s*[-*]\s+/.test(l);
    const isOl = (l: string) => /^\s*\d+[.)]\s+/.test(l);
    if (isUl(line) || isOl(line)) {
      const ordered = isOl(line);
      const test = ordered ? isOl : isUl;
      const items: ReactNode[] = [];
      while (i < lines.length && test(lines[i])) {
        const text = lines[i].replace(ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*]\s+/, "");
        items.push(<li key={`${key}-${items.length}`}>{inline(text, `${key}-${items.length}`)}</li>);
        i++;
      }
      blocks.push(ordered ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>);
      continue;
    }

    // Paragraph: gather until blank line or another block starts
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4}\s|>|```|\s*[-*]\s+|\s*\d+[.)]\s+)/.test(lines[i]) &&
      !/^(-{3,}|\*{3,})\s*$/.test(lines[i].trim())
    ) {
      para.push(lines[i++]);
    }
    blocks.push(<p key={key}>{inline(para.join(" "), key)}</p>);
  }

  return <>{blocks}</>;
}

export function readingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
