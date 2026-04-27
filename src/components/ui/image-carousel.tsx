"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

export type CarouselSlide = { src: string; alt: string };

type ImageCarouselProps = {
  slides: readonly CarouselSlide[];
  intervalMs?: number;
  ariaLabel: string;
  emptyLabel?: string;
  aspectClassName?: string;
};

/**
 * Lightweight carousel with auto-advance, dots, and previous/next buttons.
 * If an image 404s, show the reserved path instead of a broken image.
 */
export function ImageCarousel({
  slides,
  intervalMs = 6000,
  ariaLabel,
  emptyLabel = "Image coming soon",
  aspectClassName = "aspect-[16/10]",
}: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const n = slides.length;

  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), intervalMs);
    return () => clearInterval(t);
  }, [n, intervalMs]);

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => (i + dir + n) % n);
    },
    [n],
  );

  if (n === 0) return null;

  const slide = slides[index]!;

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
      role="region"
      aria-label={ariaLabel}
      aria-roledescription="carousel"
    >
      <CarouselSlideView slide={slide} aspectClassName={aspectClassName} emptyLabel={emptyLabel} />

      {n > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-sm text-slate-700 shadow hover:bg-white"
            aria-label="Previous slide"
          >
            &lt;
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-sm text-slate-700 shadow hover:bg-white"
            aria-label="Next slide"
          >
            &gt;
          </button>
          <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 w-2 rounded-full transition",
                  i === index ? "bg-brand-orange" : "bg-slate-300 hover:bg-slate-400",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function CarouselSlideView({
  slide,
  aspectClassName,
  emptyLabel,
}: {
  slide: CarouselSlide;
  aspectClassName: string;
  emptyLabel: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [slide.src]);

  if (failed) {
    return (
      <div
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-slate-500",
          aspectClassName,
        )}
      >
        <p>{emptyLabel}</p>
        <p className="break-all font-mono text-xs opacity-80">{slide.src}</p>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", aspectClassName)}>
      <img
        src={slide.src}
        alt={slide.alt}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
