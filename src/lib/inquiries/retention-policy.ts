export const CONFIRMED_INQUIRY_RETENTION_DAYS = 365;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export class InquiryRetentionError extends Error {
  readonly code = "inquiry_retention_unconfigured";

  constructor() {
    super("inquiry_retention_unconfigured");
  }
}

/**
 * Database rows expire 365 days after the first successful save.
 * This app does not store a second email-body archive.
 * SMTP mailbox copies and database backups are outside the cleanup task.
 * Operators must keep those copies for no longer than 365 days and rerun cleanup after a restore.
 * Cleanup stays off unless INQUIRY_RETENTION_CLEANUP_ENABLED=true.
 */
export const INQUIRY_COPY_RETENTION = {
  databaseRecordsDays: CONFIRMED_INQUIRY_RETENTION_DAYS,
  applicationEmailArchive: "not_stored",
  smtpMailboxCopies: "operator_limit_365_days_not_deleted_by_app",
  databaseBackups: "operator_limit_365_days_rerun_cleanup_after_restore",
  cleanupEnabledByDefault: false,
} as const;

export function isInquiryRetentionCleanupEnabled(): boolean {
  return process.env.INQUIRY_RETENTION_CLEANUP_ENABLED?.trim().toLowerCase() === "true";
}

/** Unset uses the confirmed 365-day period. Invalid values refuse the save. */
export function resolveInquiryRetentionDays(): number {
  const raw = process.env.INQUIRY_RETENTION_DAYS?.trim();
  if (!raw) return CONFIRMED_INQUIRY_RETENTION_DAYS;
  const days = Number(raw);
  if (!Number.isInteger(days) || days < 1 || days > 3650) {
    throw new InquiryRetentionError();
  }
  return days;
}

export function retentionDeadline(savedAt: Date): Date {
  return new Date(savedAt.getTime() + resolveInquiryRetentionDays() * MS_PER_DAY);
}

export function isInquiryExpired(retainUntil: string | null, now: Date): boolean {
  if (!retainUntil) return false;
  const deadline = new Date(retainUntil).getTime();
  return !Number.isNaN(deadline) && deadline <= now.getTime();
}
