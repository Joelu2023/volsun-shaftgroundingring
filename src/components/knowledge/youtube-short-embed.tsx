/** Strict YouTube video ID: letters, digits, underscore, hyphen (11 chars typical). */
const YOUTUBE_VIDEO_ID_RE = /^[\w-]{6,20}$/;

type Props = {
  videoId: string;
  title: string;
};

/**
 * Privacy-enhanced, non-autoplay YouTube Shorts embed (9:16).
 * Only accepts a validated video ID — never a free-form URL.
 */
export function YouTubeShortEmbed({ videoId, title }: Props) {
  if (!YOUTUBE_VIDEO_ID_RE.test(videoId)) {
    return null;
  }

  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;

  return (
    <div className="mx-auto mt-6 w-full max-w-[420px]">
      <div className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50" style={{ aspectRatio: "9 / 16" }}>
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </div>
  );
}
