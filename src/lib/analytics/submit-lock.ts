export type SyncSubmitLock = {
  tryAcquire: () => boolean;
  release: () => void;
  isLocked: () => boolean;
};

/** Synchronous lock so a second click cannot start another request before React re-renders. */
export function createSyncSubmitLock(): SyncSubmitLock {
  let locked = false;
  return {
    tryAcquire() {
      if (locked) return false;
      locked = true;
      return true;
    },
    release() {
      locked = false;
    },
    isLocked() {
      return locked;
    },
  };
}

export function resolveInquiryEventId(requestId: unknown): string | null {
  if (typeof requestId !== "string") return null;
  const value = requestId.trim();
  return value ? value : null;
}

export function shouldTrackGenerateLead(data: { ok?: boolean; delivered?: boolean } | null | undefined): boolean {
  return Boolean(data?.ok && data.delivered === true);
}
