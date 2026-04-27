# AGENTS.md

## Project context

This is the Volsun shaft grounding ring lead-generation website.

The website is intended for B2B overseas customer acquisition. It must be stable enough for trial launch, especially for English SEO, inquiry submission, resource download, product/application pages, and conversion tracking.

## Review guidelines

When reviewing this repository, focus on whether the website is ready for trial launch.

Check the following areas:

1. Build and runtime
- Verify the project can install dependencies and build successfully.
- Verify there are no TypeScript, ESLint, routing, or import errors.
- Verify no demo-only placeholder code remains in production-facing pages.
- Verify no broken image paths, missing assets, or invalid links.

2. Inquiry form and conversion flow
- Review `/api/inquiries` and all inquiry-related components.
- Verify valid inquiry submissions are persisted or delivered safely.
- Verify email delivery failure does not cause lead loss if persistence is implemented.
- Verify form validation, error responses, request IDs, and user-facing messages are reasonable.
- Check whether sensitive SMTP errors are leaked to the browser.

3. SEO and international routing
- Verify page metadata, canonical URLs, robots, sitemap, hreflang or locale routing where applicable.
- Verify English pages are indexable and not accidentally blocked.
- Verify `/en`, `/zh`, or default locale routing is consistent with the current product decision.
- Check whether important product, application, resource, contact, and case pages have unique titles and descriptions.

4. Security
- Check for hardcoded secrets, passwords, API keys, tokens, SMTP credentials, or private internal IP assumptions.
- Check whether environment variables are properly documented in `.env.example`.
- Check whether server-only secrets are exposed to client components.
- Check API routes for input validation, rate-limit risk, and unsafe logging of personal data.

5. Performance and user experience
- Check heavy images, unoptimized assets, layout shift risks, slow-loading sections, and unnecessary client components.
- Check mobile navigation, CTA visibility, inquiry flow, and broken UI states.
- Check whether homepage, product pages, application pages, resource pages, and contact page are coherent for B2B conversion.

6. Content quality and credibility
- Flag exaggerated, legally risky, unsupported, or misleading claims.
- Flag competitor trademark risks, especially wording like direct replacement for named brands.
- Check whether technical claims are properly qualified and not overpromised.

7. Deployment readiness
- Verify required environment variables.
- Verify production build command.
- Verify whether the project is ready for Vercel or server deployment.
- Identify P0/P1 blockers before trial launch.

## Output format

Return the review in this exact structure:

# Trial Launch Readiness Review

## Verdict
Choose one:
- Ready for trial launch
- Conditionally ready after fixes
- Not ready

## Overall score
Give a score from 0 to 100.

## P0 blockers
Issues that must be fixed before any external trial launch.

## P1 high-priority fixes
Issues that should be fixed before serious traffic or paid ads.

## P2 improvements
Issues that can be fixed after trial launch.

## Commands run
List every command you ran and whether it passed or failed.

## Files reviewed
List the most important files reviewed.

## Risk assessment
Assess lead-loss risk, SEO risk, security risk, performance risk, and brand/content risk.

## Recommended go/no-go decision
Give a direct final recommendation.