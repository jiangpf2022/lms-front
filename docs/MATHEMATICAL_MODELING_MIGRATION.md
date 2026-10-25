# Mathematical Modeling course migration

This fork carries the Mathematical Modeling course from the existing Hexo blog into the LMS without changing the original blog deployment.

## What is migrated

- 21 numbered course entries from `blog-src/source/_posts`
- English content plus every Chinese translation currently present
- local figures, diagrams, competition-paper excerpts, and the course cover
- the eight existing ten-question quiz banks (80 questions total)
- lesson level, study time, excerpt, tags, publication status, and sequence

Only the current posts containing `lesson_number` are treated as course sources. Older unnumbered drafts are deliberately ignored. A short placeholder is imported as a draft; a complete article is imported as published.

## Repository and deployment identity

- GitHub fork: `jiangpf2022/lms-front`
- working branch: `feat/mathematical-modeling-academy`
- suggested first production URL: `jiangpf2022-modeling-lms.vercel.app`
- suggested later custom URL: `modeling.<your-domain>`

The LMS is a dynamic Next.js and Supabase application. It cannot be deployed as a static GitHub Pages site. Use a separate Supabase project so the existing blog database remains untouched.

## Refresh content from OneDrive

The default source path is the sibling OneDrive checkout:

```text
../jiangpf2022.github.io/blog-src
```

Run:

```bash
npm run content:modeling:export
npm run content:modeling:verify
```

Use an explicit source on another computer:

```bash
npm run content:modeling:export -- --source "/absolute/path/to/blog-src"
npm run content:modeling:verify
```

The exporter writes LMS content under `content/mathematical-modeling/` and copies public assets to `public/mathematical-modeling/`. The verifier compiles every MDX lesson with the same GFM, math, and KaTeX pipeline used by the student page, then checks every local image reference.

## Import into Supabase

Apply the upstream LMS migrations to a new project first. Then configure the normal LMS environment variables and run:

```bash
MODELING_TENANT_ID="<tenant UUID>" \
MODELING_OWNER_USER_ID="<jiangpf2022 auth user UUID>" \
npm run content:modeling:seed
```

The seed is idempotent by tenant, course title, and lesson sequence. Re-running it updates the course rather than duplicating it. It creates:

- the `Mathematical Modeling` category;
- one published LMS course;
- 21 ordered lessons, preserving draft/published state;
- LMS quiz exercises for the supported single-answer questions.

The complete bilingual quiz banks, including multi-select questions, remain losslessly stored in `content/mathematical-modeling/quizzes.json` and each seeded exercise's `template_variables`. The current upstream checkpoint renderer only grades one answer per multiple-choice question, so multi-select answer keys are retained rather than silently converted into a different question.

## Production configuration

Minimum application variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=<publishable key>
SUPABASE_SERVICE_ROLE_KEY=<server-only secret>
NEXT_PUBLIC_PLATFORM_DOMAIN=jiangpf2022-modeling-lms.vercel.app
NEXT_PUBLIC_APP_URL=https://jiangpf2022-modeling-lms.vercel.app
```

Never commit real keys. Configure them in the deployment provider and in a local `.env.local` only.

## Verification checklist

```bash
npm run content:modeling:verify
npm run typecheck
npm run test:unit
npm run build
```

The upstream snapshot may have unrelated baseline type errors. Migration files should still pass targeted ESLint and the complete MDX compiler check. Record baseline failures separately; do not hide them by disabling type checking.
