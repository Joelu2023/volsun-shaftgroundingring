"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isAdminAnalyticsPath } from "@/lib/analytics/config";
import { trackGaPageView } from "@/lib/analytics/page-view";

function GaPageViewTrackerInner({ measurementId }: { measurementId: string }) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    if (!measurementId || isAdminAnalyticsPath(pathname)) return;
    trackGaPageView({
      measurementId,
      pageUrl: window.location.href,
      pageTitle: document.title,
    });
  }, [measurementId, pathname, search]);

  return null;
}

export function GaPageViewTracker({ measurementId }: { measurementId: string }) {
  return (
    <Suspense fallback={null}>
      <GaPageViewTrackerInner measurementId={measurementId} />
    </Suspense>
  );
}
