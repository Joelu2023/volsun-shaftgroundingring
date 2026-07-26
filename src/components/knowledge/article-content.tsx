import Image from "next/image";
import Link from "next/link";
import type { ArticleContentBlock } from "@/data/mock/articles";
import type { AppLocale } from "@/lib/i18n/locales";
import { sanitizeLargeSlotImageSrc } from "@/lib/utils/image-slot-guards";
import { YouTubeShortEmbed } from "@/components/knowledge/youtube-short-embed";

type Props = {
  blocks?: ArticleContentBlock[];
  paragraphs: string[];
  locale?: AppLocale;
};

function resolveArticleHref(href: string, locale?: AppLocale): string {
  if (!locale || href.startsWith("/en/") || href.startsWith("/zh/")) return href;
  if (href.startsWith("/")) return `/${locale}${href}`;
  return href;
}

export function ArticleContent({ blocks, paragraphs, locale }: Props) {
  if (blocks?.length) {
    return (
      <div className="prose prose-slate mt-8 max-w-none">
        {blocks.map((block, i) => {
          switch (block.type) {
            case "heading":
              return (
                <h2 key={i} className="mt-8 text-xl font-semibold text-brand-blue first:mt-0">
                  {block.text}
                </h2>
              );
            case "paragraph":
              return (
                <p key={i} className="mt-4 text-slate-700">
                  {block.text}
                </p>
              );
            case "list":
              return (
                <ul key={i} className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            case "image": {
              const src = sanitizeLargeSlotImageSrc(block.src);
              if (!src) return null;
              const caption = block.caption ?? block.alt;
              if (block.width && block.height) {
                return (
                  <figure key={i} className="mt-6">
                    <Image
                      src={src}
                      alt={block.alt}
                      width={block.width}
                      height={block.height}
                      className="h-auto w-full rounded-lg border border-slate-200 bg-slate-50 object-contain p-2"
                      sizes="(max-width: 768px) 100vw, 672px"
                    />
                    {caption ? (
                      <figcaption className="mt-2 text-center text-sm text-slate-500">{caption}</figcaption>
                    ) : null}
                  </figure>
                );
              }
              return (
                <figure key={i} className="mt-6">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <Image
                      src={src}
                      alt={block.alt}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 100vw, 672px"
                    />
                  </div>
                  {caption ? (
                    <figcaption className="mt-2 text-center text-sm text-slate-500">{caption}</figcaption>
                  ) : null}
                </figure>
              );
            }
            case "youtube":
              return <YouTubeShortEmbed key={i} videoId={block.videoId} title={block.title} />;
            case "link":
              return (
                <p key={i} className="mt-4 text-slate-700">
                  {block.intro ? <span>{block.intro} </span> : null}
                  <Link href={resolveArticleHref(block.href, locale)} className="font-medium text-brand-orange hover:underline">
                    {block.label}
                  </Link>
                </p>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  }

  return (
    <div className="prose prose-slate mt-8 max-w-none">
      {paragraphs.map((p, i) => (
        <p key={i} className="mt-4 text-slate-700">
          {p}
        </p>
      ))}
    </div>
  );
}
