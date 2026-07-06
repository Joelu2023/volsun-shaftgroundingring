/**
 * image-mapper: stage inbox images → public/images/{news|articles}/{slug}/
 * and insert into article blocks by placeholder ref or keyword scoring.
 * First cover image = OG image.
 */
import fs from "node:fs";
import path from "node:path";
import type { ArticleCategory, ArticleContentBlock, ParsedBlock, StagedImage } from "./types";

const ROOT = path.resolve(__dirname, "..");
export const INBOX_IMAGES = path.join(ROOT, "content", "inbox", "images");

function normalizeFileName(name: string, slug: string): string {
  const ext = path.extname(name).toLowerCase();
  let base = path.basename(name, path.extname(name)).toLowerCase();
  base = base.replace(/\.(jpe?g|png|webp|gif)$/i, "");
  base = base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (!base.startsWith(slug)) base = `${slug}-${base}`;
  return `${base}${ext}`;
}

function humanizeImageName(baseName: string, slug: string): string {
  const stripped = baseName.startsWith(`${slug}-`) ? baseName.slice(slug.length + 1) : baseName;
  return stripped.replace(/-/g, " ").trim();
}

export function buildAlt(img: StagedImage, slug: string, title: string, keyword: string): string {
  const subject = humanizeImageName(img.baseName, slug);
  const context = title.split("|")[0].trim();
  return `${context} — ${subject} (${keyword})`;
}

/** Copy inbox images to public/images/{news|articles}/{slug}/; mark cover + OG candidate. */
export function stageImages(slug: string, category: ArticleCategory): StagedImage[] {
  if (!fs.existsSync(INBOX_IMAGES)) return [];
  const files = fs
    .readdirSync(INBOX_IMAGES)
    .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
    .sort();
  if (!files.length) return [];

  const bucket = category === "news" ? "news" : "articles";
  const destDir = path.join(ROOT, "public", "images", bucket, slug);
  fs.mkdirSync(destDir, { recursive: true });

  const staged: StagedImage[] = files.map((f) => {
    const normalized = normalizeFileName(f, slug);
    fs.copyFileSync(path.join(INBOX_IMAGES, f), path.join(destDir, normalized));
    return {
      publicPath: `/images/${bucket}/${slug}/${normalized}`,
      baseName: path.basename(normalized, path.extname(normalized)),
      isCover: false,
    };
  });

  const coverIdx = Math.max(
    0,
    staged.findIndex((img) => /cover|booth|main|hero|og/i.test(img.baseName)),
  );
  staged[coverIdx].isCover = true;
  return staged;
}

export function getCoverImage(images: StagedImage[]): StagedImage | null {
  return images.find((i) => i.isCover) ?? images[0] ?? null;
}

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter(Boolean);
}

/** Score how well an image filename matches a text context. */
function keywordScore(context: string, img: StagedImage): number {
  const ctx = tokenize(context);
  const name = tokenize(img.baseName);
  let score = 0;
  for (const t of ctx) {
    if (name.some((n) => n.includes(t) || t.includes(n))) score += 2;
  }
  for (const t of name) {
    if (ctx.some((c) => c.includes(t))) score += 1;
  }
  return score;
}

function findBestImage(ref: string, context: string, pool: StagedImage[], used: Set<string>): StagedImage | null {
  const refNorm = ref.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const available = pool.filter((i) => !used.has(i.publicPath));

  const exact = available.find((i) => i.baseName.includes(refNorm) || refNorm.includes(i.baseName.replace(/^[^-]+-/, "")));
  if (exact) return exact;

  let best: StagedImage | null = null;
  let bestScore = 0;
  const probe = `${ref} ${context}`;
  for (const img of available) {
    const s = keywordScore(probe, img);
    if (s > bestScore) {
      bestScore = s;
      best = img;
    }
  }
  return bestScore > 0 ? best : available[0] ?? null;
}

function toContentBlock(img: StagedImage, slug: string, title: string, keyword: string): ArticleContentBlock {
  return { type: "image", src: img.publicPath, alt: buildAlt(img, slug, title, keyword) };
}

/**
 * Map parsed blocks + staged images → ArticleContentBlock[] with images inserted.
 * 1) Resolve [IMAGE: ref] placeholders by ref/keyword match.
 * 2) Auto-insert remaining images every 2–3 content blocks by keyword scoring.
 */
export function mapImagesToBlocks(
  parsedBlocks: ParsedBlock[],
  images: StagedImage[],
  slug: string,
  title: string,
  keyword: string,
): ArticleContentBlock[] {
  if (!images.length) {
    return parsedBlocks
      .filter((b) => b.type !== "imagePlaceholder")
      .map((b): ArticleContentBlock => {
        if (b.type === "heading") return { type: "heading", text: b.text };
        if (b.type === "list") return { type: "list", items: b.items };
        return { type: "paragraph", text: b.text };
      });
  }

  const cover = getCoverImage(images);
  const bodyPool = images.filter((i) => i.publicPath !== cover?.publicPath);
  const used = new Set<string>();
  if (cover) used.add(cover.publicPath);

  const out: ArticleContentBlock[] = [];
  let lastHeading = "";
  let sinceLastImage = 0;

  for (const block of parsedBlocks) {
    if (block.type === "heading") {
      lastHeading = block.text;
      out.push({ type: "heading", text: block.text });
      continue;
    }

    if (block.type === "imagePlaceholder") {
      const ctx = `${lastHeading} ${block.ref}`;
      const img = findBestImage(block.ref, ctx, bodyPool.length ? bodyPool : images, used);
      if (img) {
        out.push(toContentBlock(img, slug, title, keyword));
        used.add(img.publicPath);
        sinceLastImage = 0;
      }
      continue;
    }

    if (block.type === "list") {
      out.push({ type: "list", items: block.items });
      sinceLastImage += 1;
    } else {
      out.push({ type: "paragraph", text: block.text });
      sinceLastImage += 1;
    }

    if (sinceLastImage >= 2) {
      const ctx = `${lastHeading} ${block.type === "paragraph" ? block.text : block.items.join(" ")}`;
      const img = findBestImage("", ctx, bodyPool.length ? bodyPool : images, used);
      if (img) {
        out.push(toContentBlock(img, slug, title, keyword));
        used.add(img.publicPath);
        sinceLastImage = 0;
      }
    }
  }

  const remaining = (bodyPool.length ? bodyPool : images).filter((i) => !used.has(i.publicPath));
  for (const img of remaining) {
    out.push(toContentBlock(img, slug, title, keyword));
  }

  return out;
}
