import Image from "next/image";
import type { ArticleContentBlock } from "@/data/mock/articles";
import { sanitizeLargeSlotImageSrc } from "@/lib/utils/image-slot-guards";

type Props = {
  blocks?: ArticleContentBlock[];
  paragraphs: string[];
};

export function ArticleContent({ blocks, paragraphs }: Props) {
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
                  {block.alt ? (
                    <figcaption className="mt-2 text-center text-sm text-slate-500">{block.alt}</figcaption>
                  ) : null}
                </figure>
              );
            }
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
