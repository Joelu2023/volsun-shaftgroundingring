# Inquiry Email Notification Fix — Release Closeout

**Final status:** CLOSED  
**Date:** 2026-08-28

## Root cause

Production inquiry mail used the company mailbox as both SMTP From and To. Business users therefore saw the thread as “from myself”, had no Reply-To to the visitor, and Drawing free text (including an email) could be written into Drawing file URL.

## Fix summary

- SMTP From display name is always `VOLSUN SGR Website Inquiry`; visitor email is never used as From.
- Visitor email is Reply-To.
- RFQ subject is identifiable: `[NEW SGR RFQ] {company} | {country} | Shaft Ø{n} mm`.
- Drawing http(s) URLs are kept; email-like and phone-like values are discarded; other free text becomes Drawing details.
- Shaft diameter is included in the RFQ subject and slim/RFQ payloads.

## PR / commit

- PR: https://github.com/Joelu2023/volsun-shaftgroundingring/pull/14
- Merge commit: `2442c5c7dcfb80b9f4dc8bc3ecc8957eded40b4a`
- Candidate: `14b65cb8da197651c7ebd7e1d2a0c687f3dda239`
- Base before merge: `dfdb649c44baffd123934e531ad0f83fdc1835fd`

## Production deployment

- Deployment ID: `dpl_CDuvYF1dbyjsAMdW9deR7qoaeAyQ`
- URL: https://volsun-shaftgroundingring-rj3mv9e18-joelu2023s-projects.vercel.app
- Inspect: https://vercel.com/joelu2023s-projects/volsun-shaftgroundingring/CDuvYF1dbyjsAMdW9deR7qoaeAyQ
- Target: production
- Status: READY
- Alias: https://www.volsunsgr.com
- Git SHA: `2442c5c7dcfb80b9f4dc8bc3ecc8957eded40b4a`

## Automated test results

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS |
| `npm test` | 66/66 PASS |
| inquiry-email tests | 16/16 PASS |
| `npx tsx scripts/verify-inquiry-delivery.ts` | PASS (mocked SMTP only) |
| `npm run lint` | PASS |
| Preview deploy | PASS (`dpl_9Kak6QGdFjmPSZLs5H27HUSyB1gQ`) |
| Content dry-run A/B | PASS |
| Local real SMTP via `vercel env run` | Not possible: Production SMTP vars are Sensitive |

## Human UAT results

HUMAN PRODUCTION UAT: **PASS** (2026-08-28)

1. Production form submit succeeded.
2. `info@szvolsun.com` received the mail.
3. From: `VOLSUN SGR Website Inquiry <info@szvolsun.com>`
4. Subject: `[NEW SGR RFQ] VOLSUN PRODUCTION UAT DO NOT PROCESS | Singapore | Shaft Ø24 mm`
5. Reply: original From remains company mailbox; Reply-To is the tester (`Production UAT Joe` + tester mailbox). Client risk prompt because From ≠ Reply-To is expected.
6. Drawing file URL: —
7. Drawing details: —
8. Customer / company / country / email / phone / product / technical fields appear before tracking/attribution fields.

## Reply-To verification

PASS. Clicking Reply targets the tester mailbox, not `info@szvolsun.com`. Do not send the reply.

## Drawing fix verification

PASS. Empty drawing stayed em dash on both URL and details; visitor email was not copied into drawing fields.

## Runtime UAT gate

PASS. Around the human UAT window, Production logs showed:

- `POST /api/inquiries` HTTP 200
- `[inquiry] delivered` with `channel: email` (requestId `7600a848-8cc0-4f13-a750-a06003268a9b`, `inquiry_type: rfq`)
- follow-up `GET /en/thank-you` HTTP 200
- no 4xx, 5xx, or error-level serverless/SMTP exceptions on this deployment for that request

No additional inquiry was submitted during closeout.

## Production env / database

- Production env change: **NO**
- Database change: **NO**
- CRM write from this release process: **NO**

## Rollback target (not used)

Rollback was not required.

If needed later (do not force-push / do not reset `main`):

- Promote previous Production: `dpl_EBhotYZftG87Z8hCZVG426Fv9dWi`  
  (`https://volsun-shaftgroundingring-k5zhngecj-joelu2023s-projects.vercel.app`)
- Git: `git revert -m 1 2442c5c7dcfb80b9f4dc8bc3ecc8957eded40b4a` then push `main`

## Non-blocking follow-ups

Do not implement in this closeout.

### FOLLOWUP-01 — Product label readability (P2)

Mail body currently shows `Product: solid-shaft-grounding-ring`. Future: human-readable `Solid Shaft Grounding Ring`.

### FOLLOWUP-02 — Full JSON footer (P2)

Business mail still appends `Full InquirySubmission (JSON)`. Useful for engineering debug; noisy for sales. Future: keep JSON in server log / audit / CRM debug, or debug-mode only.

## Final status

**CLOSED**
