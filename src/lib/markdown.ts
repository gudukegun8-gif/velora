/**
 * Tiny markdown → HTML renderer for editorial article content.
 * Supports headings, bold, italic, links, images, lists, blockquotes,
 * horizontal rules, and paragraphs. Raw HTML in the source is escaped —
 * output is safe to render with dangerouslySetInnerHTML.
 */

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(input: string): string {
  let out = escapeHtml(input);
  // Images: ![alt](url)
  out = out.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    '<img src="$2" alt="$1" loading="lazy" />'
  );
  // Links: [text](url)
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    '<a href="$2" rel="nofollow noopener">$1</a>'
  );
  // Bold: **text**
  out = out.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>");
  // Italic: *text*
  out = out.replace(/(^|[\s(>])\*([^*\n]+?)\*/g, "$1<em>$2</em>");
  // Inline code: `code`
  out = out.replace(/`([^`\n]+?)`/g, "<code>$1</code>");
  return out;
}

export function markdownToHtml(source: string): string {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const html: string[] = [];
  let inUl = false;
  let inOl = false;
  let inQuote = false;
  const paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      html.push(`<p>${inline(paragraph.join(" "))}</p>`);
      paragraph.length = 0;
    }
  };

  const closeLists = () => {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      html.push("</ol>");
      inOl = false;
    }
    if (inQuote) {
      html.push("</blockquote>");
      inQuote = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (/^\s*$/.test(line)) {
      flushParagraph();
      closeLists();
      continue;
    }

    // Headings (# → h2 so the page keeps a single h1)
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeLists();
      const level = Math.min(heading[1].length + 1, 4);
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      flushParagraph();
      closeLists();
      html.push("<hr />");
      continue;
    }

    // Blockquote
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      if (!inQuote) {
        closeLists();
        html.push("<blockquote>");
        inQuote = true;
      }
      if (quote[1].trim()) {
        html.push(`<p>${inline(quote[1])}</p>`);
      }
      continue;
    }

    // Unordered list
    const ul = line.match(/^\s*[-*]\s+(.+)$/);
    if (ul) {
      flushParagraph();
      if (inQuote) {
        html.push("</blockquote>");
        inQuote = false;
      }
      if (inOl) {
        html.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        html.push("<ul>");
        inUl = true;
      }
      html.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }

    // Ordered list
    const ol = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (ol) {
      flushParagraph();
      if (inQuote) {
        html.push("</blockquote>");
        inQuote = false;
      }
      if (inUl) {
        html.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        html.push("<ol>");
        inOl = true;
      }
      html.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }

    closeLists();
    paragraph.push(line.trim());
  }

  flushParagraph();
  closeLists();
  return html.join("\n");
}
