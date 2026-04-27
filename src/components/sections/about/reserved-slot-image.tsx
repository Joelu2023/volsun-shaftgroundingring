"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  src: string;
  alt: string;
  aspectClassName?: string;
  imageFitClassName?: "object-cover" | "object-contain";
  emptyLabel?: string;
};

/** 单张预留图：文件未上传时显示占位与路径说明 */
export function ReservedSlotImage({
  src,
  alt,
  aspectClassName = "aspect-[21/9]",
  imageFitClassName = "object-cover",
  emptyLabel = "Image coming soon",
}: Props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500",
          aspectClassName,
        )}
      >
        <p>{emptyLabel}</p>
        <p className="break-all font-mono text-xs opacity-80">{src}</p>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100", aspectClassName)}>
      <img src={src} alt={alt} className={cn("h-full w-full", imageFitClassName)} onError={() => setFailed(true)} />
    </div>
  );
}
