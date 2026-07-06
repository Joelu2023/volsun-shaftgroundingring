/**
 * docx-parser: .docx → structured blocks (H1/H2/H3, paragraphs, lists, tables, image placeholders).
 * Uses mammoth; recognizes [IMAGE: ref] markers and embedded <img> tags.
 */
import path from "node:path";
import mammoth from "mammoth";
import type { ParsedBlock, ParsedDoc } from "./types";

const IMAGE_MARKER_RE = /^\s*\[IMAGE:\s*([^\]]+)\]\s*$/i;

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function toPlainText(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromFileName(filePath: string): string {
  return path
    .basename(filePath, path.extname(filePath))
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isBoldHeading(inner: string, text: string): boolean {
  if (text.length > 80 || /[.!。！]$/.test(text)) return false;
  if (!/<(strong|b)[\s>]/i.test(inner)) return false;
  const residual = toPlainText(inner.replace(/<(strong|b)[^>]*>[\s\S]*?<\/\1>/gi, ""));
  return residual.length === 0;
}

function tableToList(inner: string): ParsedBlock | null {
  const items: string[] = [];
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let tr: RegExpExecArray | null;
  while ((tr = trRe.exec(inner)) !== null) {
    const cells: string[] = [];
    const tdRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    let td: RegExpExecArray | null;
    while ((td = tdRe.exec(tr[1])) !== null) {
      const text = toPlainText(td[1]);
      if (text) cells.push(text);
    }
    if (cells.length) items.push(cells.join(" — "));
  }
  return items.length ? { type: "list", items } : null;
}

/** Extract alt/src from mammoth embedded images. */
function embeddedImageRef(inner: string): string | null {
  const imgMatch = /<img[^>]+(?:alt=["']([^"']*)["']|src=["']([^"']*)["'])[^>]*>/i.exec(inner);
  if (!imgMatch) return null;
  const alt = imgMatch[1]?.trim();
  const src = imgMatch[2]?.trim();
  if (alt) return alt;
  if (src) return path.basename(src, path.extname(src));
  return "embedded-image";
}

export async function parseDocx(filePath: string): Promise<ParsedDoc> {
  const { value: html } = await mammoth.convertToHtml({ path: filePath });

  const blocks: ParsedBlock[] = [];
  const imageRefs: string[] = [];
  let title = "";

  const tagRe = /<(h1|h2|h3|p|ul|ol|table)[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(html)) !== null) {
    const tag = m[1].toLowerCase();
    const inner = m[2];

    if (tag === "table") {
      const list = tableToList(inner);
      if (list) blocks.push(list);
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      const items: string[] = [];
      const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let li: RegExpExecArray | null;
      while ((li = liRe.exec(inner)) !== null) {
        const text = toPlainText(li[1]);
        if (text) items.push(text);
      }
      if (items.length) blocks.push({ type: "list", items });
      continue;
    }

    // Embedded image paragraph (mammoth outputs <p><img …></p>)
    if (tag === "p" && /<img[\s>]/i.test(inner)) {
      const ref = embeddedImageRef(inner);
      if (ref) {
        blocks.push({ type: "imagePlaceholder", ref });
        imageRefs.push(ref);
      }
      continue;
    }

    const text = toPlainText(inner);
    if (!text) continue;

    const marker = IMAGE_MARKER_RE.exec(text);
    if (marker) {
      const ref = marker[1].trim();
      blocks.push({ type: "imagePlaceholder", ref });
      imageRefs.push(ref);
      continue;
    }

    if (tag === "p" && isBoldHeading(inner, text)) {
      if (!title && blocks.length === 0) {
        title = text;
        continue;
      }
      blocks.push({ type: "heading", level: 2, text });
      continue;
    }

    if (tag === "h1") {
      if (!title) {
        title = text;
        continue;
      }
      blocks.push({ type: "heading", level: 1, text });
    } else if (tag === "h2" || tag === "h3") {
      blocks.push({ type: "heading", level: tag === "h2" ? 2 : 3, text });
    } else {
      blocks.push({ type: "paragraph", text });
    }
  }

  return {
    title: title || titleFromFileName(filePath),
    blocks,
    sourceFile: filePath,
    imageRefs,
  };
}
