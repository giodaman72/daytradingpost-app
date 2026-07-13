# Sanity CMS setup

DayTradingPost uses Sanity for published market analysis and embeds Sanity
Studio at `/studio`. The application renders a designed empty state until a
valid project is configured and at least one article is published.

## 1. Create the Sanity project

1. Sign in at <https://www.sanity.io/manage>.
2. Select **Create project**.
3. Name the project `DayTradingPost`.
4. Create or select the `production` dataset.
5. Copy the project ID from **Project settings → General**.

Do not run `sanity init` inside this repository. The Studio, schemas, and CLI
configuration are already included.

## 2. Configure local environment variables

From the repository root, create the local environment file if it does not
already exist:

```bash
cp .env.example .env.local
```

Set these values in `.env.local`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-07-13
SANITY_API_READ_TOKEN=your-viewer-token
```

- `NEXT_PUBLIC_SANITY_PROJECT_ID` is the project ID copied from Sanity.
- `NEXT_PUBLIC_SANITY_DATASET` is normally `production`.
- `NEXT_PUBLIC_SANITY_API_VERSION` is a pinned ISO date. Update it
  intentionally when adopting newer Sanity API behavior.
- `SANITY_API_READ_TOKEN` is server-only. Never expose it in client components,
  commit it, or rename it with a `NEXT_PUBLIC_` prefix.

For a public dataset, published content can be read without a token. A Viewer
token is still recommended when the dataset is private. Create one under
**Project settings → API → Tokens → Add API token**, choose the **Viewer** role,
and copy it immediately into `.env.local`.

## 3. Configure CORS origins

In Sanity, open **Project settings → API → CORS origins** and add:

1. `http://localhost:3000` for local development.
2. The production site origin, for example `https://daytradingpost.com`.
3. Any Vercel preview origin that editors must use.

Enable credentials for origins that need to sign in to the embedded Studio.
Use exact origins—do not include paths such as `/studio`.

If local Next.js uses another port, add that exact origin too, such as
`http://localhost:3001`.

## 4. Start the application and open Studio

```bash
npm run dev
```

Open <http://localhost:3000/studio> and sign in with a Sanity account that has
access to the project.

Create content in this order:

1. Create and publish an **Author**.
2. Create and publish a **Category**.
3. Create an **Article**, select the author and category, complete every
   required market and SEO field, then publish it.

Only published articles with a slug and a published date not later than the
current time appear on the website. New or updated content is refreshed within
approximately 60 seconds.

## 5. Article publishing checklist

Before publishing, verify that the article includes:

- a unique slug;
- an excerpt and accessible featured-image alternative text;
- author and category references;
- instrument symbol and market bias;
- support and resistance levels;
- body content and primary risk factors;
- published date and free/premium status;
- an SEO title no longer than 60 characters;
- an SEO description no longer than 160 characters;
- an educational, non-advisory tone.

## 6. Configure Vercel

In **Vercel → Project → Settings → Environment Variables**, add:

```text
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
NEXT_PUBLIC_SANITY_API_VERSION
SANITY_API_READ_TOKEN
```

Apply the public variables to Development, Preview, and Production as needed.
Mark `SANITY_API_READ_TOKEN` as sensitive and never expose it to the browser.
Redeploy after changing environment variables.

Add each deployed site origin to Sanity CORS before using `/studio` on that
deployment.

## 7. Validate the integration

Run:

```bash
npm run lint
npm run build
```

Then verify:

- `/studio` loads the DayTradingPost Studio;
- `/analysis` lists published articles newest first;
- `/analysis/[slug]` renders the article, levels, risk factors, and disclaimer;
- page source and browser bundles do not contain `SANITY_API_READ_TOKEN`;
- an unpublished or unknown slug returns the designed not-found page;
- a project with no published articles shows the designed empty state.

## Security notes

- Studio authentication is managed by Sanity; do not build a custom token form.
- The Studio configuration contains only public project and dataset identifiers.
- The Viewer token is imported only by `lib/sanity/client.ts`, which is marked
  `server-only`.
- Use the least-privileged token role required for published reads.
- Never commit `.env.local` or paste private tokens into issues, logs, or chat.
