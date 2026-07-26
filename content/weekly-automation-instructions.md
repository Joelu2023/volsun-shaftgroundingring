# VOLSUN SGR Weekly Content Automation Instructions

## 1. Objective

Prepare English technical content for:

https://www.volsunsgr.com

The workflow may create:

- one article branch
- one commit
- one GitHub pull request
- one Vercel Preview
- one verification report

It must never:

- merge main
- deploy Production
- force push
- modify Production environment variables
- bypass failed tests
- publish unreviewed technical claims

Every run must stop for human review.

## 2. Repository Safety

Before any work:

1. Fetch origin.
2. Confirm the default branch is main.
3. Confirm HEAD matches origin/main.
4. Confirm the working tree is clean.
5. Check open content pull requests.
6. Check content/automation-runs/.
7. Check whether a branch or PR already exists for the current date or topic.

Stop immediately if:

- the working tree is not clean
- main differs from origin/main
- the same run has already executed today
- the same topic or slug already has an open PR
- another automation is modifying the article data
- any relevant file shows an unexpected large deletion

Never modify files directly on main.

Never use:

git add .

Only stage files explicitly related to the current article.

## 3. Schedule Logic

The schedule type is supplied by the automation prompt as either Tuesday or Friday.

### Tuesday

Select the first eligible topic from the Ready section of:

content/weekly-content-plan.md

Prepare one article and stop at PR and Preview.

### Friday

First inspect the content PR created earlier in the week.

If the Tuesday PR is still open, waiting for review, failing tests or has a broken Preview:

- do not create another article
- do not create another branch
- review the existing PR, CI, Preview, images and pending approvals
- output a status report
- stop

Only when the earlier content PR has been merged or closed may Friday select the next eligible Ready topic.

Each run may process no more than one topic.

## 4. Topic Selection

Only use topics from the Ready section of:

content/weekly-content-plan.md

Do not use:

- Waiting for Technical Review
- Published
- topics with an existing branch or PR
- topics with insufficient technical evidence
- topics whose search intent substantially duplicates an existing article

Before writing, compare:

- article title
- slug
- SEO title
- target keyword
- search intent
- existing article coverage
- internal-link opportunities

If an existing article already satisfies the same intent, stop and recommend updating that article instead of creating a new URL.

## 5. Technical Sources

Only use:

- approved topics in the repository
- content/weekly-assets/<article-slug>/
- verified product information already present in the project
- previously approved company and product materials
- real photos, videos and documents explicitly approved for public use

Never invent:

- product parameters
- test standards
- test data
- customer cases
- certifications
- service-life claims
- inspection frequency
- test conclusions

Do not describe development validation as inspection performed on every production unit.

Avoid unsupported absolute claims such as:

- zero wear
- maintenance-free
- guaranteed lifetime
- guaranteed reliability
- suitable for every motor
- completely prevents bearing failure
- always better
- 100% tested by all methods

Prefer qualified wording such as:

- may affect
- depending on the application
- under defined test conditions
- subject to validation
- supports evaluation
- the test plan depends on the project

If technical information is insufficient, stop and list the questions requiring engineering confirmation.

## 6. Article Requirements

Language:

English only.

Do not automatically create a Chinese version.

Each article must contain:

1. A clear customer problem
2. Engineering background
3. Relevant influencing factors
4. Application conditions and limitations
5. Information customers should provide
6. Verified internal links
7. An engineering inquiry CTA
8. CTA attribution parameters
9. SEO title
10. Meta description
11. Canonical URL
12. datePublished
13. dateModified
14. Image ALT text
15. Image captions
16. A technically qualified conclusion

Do not overwrite an existing article unless the task explicitly approves an update.

## 7. Image Rules

Each article should normally use two to four relevant images.

Priority:

1. content/weekly-assets/<article-slug>/
2. approved real images in public/images/articles/
3. screenshots from approved videos
4. non-technical brand imagery

Allowed processing:

- extract approved video frames
- crop
- resize
- compress
- convert to WebP
- rename using lowercase English and hyphens
- write ALT text and captions

Do not alter:

- product structure
- product dimensions
- components
- test readings
- equipment displays
- labels
- logos
- measurement results

Do not generate:

- shaft grounding ring product images
- motor internal structures
- shaft-current path diagrams
- installation dimension drawings
- test curves
- experimental data
- customer-site images
- customer logos
- certification marks

If fewer than two relevant, real and approved images are available:

- do not create the article PR
- do not use unrelated images
- do not generate engineering diagrams
- report the missing assets
- stop for human input

## 8. Allowed Modification Scope

Normally allowed:

- src/data/mock/articles.ts
- article-specific images
- article-specific CTA configuration
- backward-compatible article display changes
- necessary tests
- content/automation-runs/YYYY-MM-DD.md

Normally prohibited:

- unrelated articles
- robots policy
- sitemap policy
- Prisma schema
- dependencies
- global routing
- unrelated APIs
- database structure
- Production environment variables
- unrelated homepage structure

Any change outside the normal scope must be reported and justified before proceeding.

## 9. Validation

Run:

npm test
npx tsc --noEmit
npm run lint
npm run build

Do not create a PR if any required command fails.

Validate locally or on Preview:

- article returns HTTP 200
- exactly one H1
- correct title and meta description
- correct canonical
- index, follow
- images return HTTP 200
- no distorted images
- complete ALT text and captions
- correct CTA link and attribution
- Knowledge Center listing works
- Technical Articles listing works
- homepage article display remains correct
- sitemap contains the English URL
- sitemap does not contain an automatically generated Chinese URL
- no unintended Chinese detail page
- at least three existing articles still return HTTP 200
- no mobile horizontal overflow

## 10. Branch, Commit, PR and Preview

Branch format:

content/weekly-article-YYYY-MM-DD

If the branch already exists, stop.

Commit format:

content: add <article-topic> article

After successful validation:

1. Stage only relevant files.
2. Commit.
3. Push the independent branch.
4. Create a GitHub pull request.
5. Create or verify a Vercel Preview.
6. Validate the Preview.
7. Stop for human review.

Never merge main or deploy Production.

## 11. Automation Run Record

For every completed run create:

content/automation-runs/YYYY-MM-DD.md

Record:

- date and time
- Tuesday or Friday run
- selected topic
- slug
- branch
- commit
- PR
- Preview
- test results
- image sources
- pending questions
- current review status

If the record already exists for that date, do not execute again.

## 12. Final Report

Every run must report:

1. Tuesday or Friday run
2. Whether the task already ran today
3. Previous content PR status
4. Whether a new article is permitted
5. Selected topic
6. Duplicate-content findings
7. New article or recommended update
8. Technical sources
9. Modified files
10. Image sources, filenames, dimensions and ALT text
11. SEO metadata
12. Final CTA URL
13. Test results
14. Branch
15. Commit
16. PR URL
17. Preview URL
18. Pending human confirmations
19. Publication recommendation
20. Confirmation that the task stopped for human review
