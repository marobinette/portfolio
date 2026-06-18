# Personal Site — Michael Robinette

A small, fast personal website: an About page, a Research page, and a Writing
(blog) section with first-class math typesetting. Built with SvelteKit and
deployed to Vercel.

---

## Tech stack

| Concern        | Choice                                             |
| -------------- | -------------------------------------------------- |
| Framework      | [SvelteKit](https://kit.svelte.dev) 2.x (Svelte 4) |
| Build tool     | [Vite](https://vitejs.dev) 5.x                     |
| Math rendering | [KaTeX](https://katex.org) 0.16.x                  |
| Backend / API  | SvelteKit `+server.js` endpoints (no separate API) |
| Database       | AWS DynamoDB (via `@aws-sdk/lib-dynamodb`)         |
| Deployment     | Vercel (`@sveltejs/adapter-vercel`)                |
| Module system  | ESM (`"type": "module"`)                           |

There is **no** TypeScript, no component library, no CSS framework, and no
state management — just Svelte components and hand-written CSS with custom
properties. Keep it that way unless there's a real reason not to.

The backend follows a deliberately minimal shape: **AWS is the database only.**
The API lives in this repo as SvelteKit server endpoints that talk directly to
DynamoDB — no Lambda, no API Gateway, nothing to deploy separately. See
[Backend & API](#backend--api).

> Note: `svelte.config.js` uses `adapter-vercel`, while `adapter-static` is
> also installed as a devDependency. The active adapter is **Vercel**. If you
> ever want a fully static export (e.g. GitHub Pages), swap the import in
> `svelte.config.js` to `adapter-static`.

---

## Getting started

Requires Node 18+ (SvelteKit 2 / Vite 5 baseline; Node 20 LTS recommended).

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:5173
npm run build    # production build
npm run preview  # preview the production build locally
```

The static pages work with no setup. The `/papers` reading list needs AWS
credentials — copy `.env.example` to `.env` and fill it in (see
[Backend & API](#backend--api)).

There is no test suite, no linter, and no formatter configured. There is also
no `npm run check` (no `svelte-check`, since the project isn't typed).

---

## Project structure

```
src/
  app.html                       # HTML shell (head meta, body mount)
  app.css                        # global styles: design tokens, base elements, utilities
  lib/
    components/
      Math.svelte                # reusable KaTeX renderer (onMount-based)
    server/                      # server-only code (never shipped to the browser)
      dynamo.js                  # shared DynamoDB document client + table name
      auth.js                    # requireAdmin() token check for write endpoints
  routes/
    +layout.svelte               # site chrome: header nav, footer, page transition
    +page.svelte                 # "/"          — About
    research/+page.svelte        # "/research"  — Research (project list)
    blog/+page.svelte            # "/blog"      — Writing (post index)
    blog/master-equations/+page.svelte  # "/blog/master-equations" — a full post
    papers/+page.js              # "/papers"    — loads the reading list (public)
    papers/+page.svelte          # "/papers"    — reading list UI + admin controls
    api/papers/+server.js        # GET (list, public) · POST (create, token)
    api/papers/[id]/+server.js   # PUT (update, token) · DELETE (token)
static/
  vcsi-logo.png                  # Vermont Complex Systems Institute logo
.env.example                     # template for required env vars (copy to .env)
svelte.config.js                 # SvelteKit config (Vercel adapter)
vite.config.js                   # Vite config (sveltekit plugin only)
```

Anything under `src/lib/server/` is server-only — SvelteKit guarantees it's
never bundled into client code, so AWS credentials and the admin token stay on
the server.

Routing is SvelteKit file-based: each `routes/<path>/+page.svelte` becomes a
page. `+layout.svelte` wraps every page.

---

## Pages & content

All page content currently lives **inline in the components** as plain JS
arrays/objects (no CMS, no markdown files yet). To edit content, edit the
relevant `+page.svelte`.

- **About** (`src/routes/+page.svelte`) — bio, research interests, a "Now"
  sidebar, and the VCSI affiliation logo. Two-column grid that collapses to one
  column under 760px.
- **Research** (`src/routes/research/+page.svelte`) — a `projects` array; each
  project has `title`, `year`, `tags`, `description`, `status`
  (`'active'` | `'complete'`). Active projects render an "Ongoing" badge.
- **Writing index** (`src/routes/blog/+page.svelte`) — a `posts` array; each
  post has `slug`, `title`, `date`, `description`, `tags`. Links to
  `/blog/<slug>`.
- **Posts** (`src/routes/blog/<slug>/+page.svelte`) — one Svelte component per
  post. See the math conventions below.

### Adding a blog post

1. Create `src/routes/blog/<slug>/+page.svelte`.
2. Add a matching entry to the `posts` array in `src/routes/blog/+page.svelte`
   (the index doesn't auto-discover posts — it's a hand-maintained list).
3. Use `src/routes/blog/master-equations/+page.svelte` as the template — it
   establishes the header/meta/tags/footer markup and the math patterns.

> Future improvement (already noted in `blog/+page.svelte`): store posts as
> markdown in `src/lib/posts/` and render with
> [mdsvex](https://mdsvex.pngwn.io). That would remove the manual index and the
> per-post boilerplate. Not done yet.

---

## Writing math (KaTeX)

There are **two** patterns in the codebase. Both use KaTeX with
`throwOnError: false` (invalid TeX renders as a visible error instead of
crashing the page). Always write TeX with `String.raw` so backslashes survive.

### Pattern A — `Math.svelte` component (general use)

`src/lib/components/Math.svelte` renders on mount via `katex.render`.

```svelte
<script>
  import Math from '$lib/components/Math.svelte';
</script>

<!-- inline -->
The probability <Math math={String.raw`P_n(t)`} />.

<!-- display (block) -->
<Math math={String.raw`\sum_n P_n(t) = 1`} display />
```

**Important:** this component renders in `onMount`, so the math only appears
client-side (it will be blank in pre-rendered HTML until JS hydrates). It also
does **not** import KaTeX's CSS — see the CSS note below.

### Pattern B — `renderToString` + `{@html}` (used in the master-equations post)

This is the pattern the existing post uses. It renders to an HTML string at
module evaluation time, so it works in SSR/prerender and shows up without
waiting for hydration.

```svelte
<script>
  import katex from 'katex';
  import 'katex/dist/katex.min.css';   // <-- required for correct math styling

  const r = (tex, display = false) =>
    katex.renderToString(tex, { displayMode: display, throwOnError: false });

  const eqNorm = r(String.raw`\sum_n P_n(t) = 1`, true);   // display
  const i_Pn   = r(String.raw`P_n(t)`);                    // inline
</script>

<p>The distribution {@html i_Pn} must normalize:</p>
<div class="eq-block">{@html eqNorm}</div>
```

Convention used in the existing post:
- Display equations are named `eq*`, inline snippets are named `i_*`.
- Block equations are wrapped in `<div class="eq-block">`; key results add the
  `highlight` modifier (`class="eq-block highlight"`).
- The `eq-block`, `callout`, `recipe`, and `table` styles are defined
  **locally** in that post's `<style>` block — they are not global. Copy them
  into a new post (or lift them to `app.css`) if you want the same look.

### KaTeX CSS

KaTeX's stylesheet is imported **site-wide** from `src/app.css`
(`@import 'katex/dist/katex.min.css';`), so both math patterns are styled
correctly on every page. Don't re-import it per-post.

---

## Backend & API

The site is mostly static, but `/papers` (the reading list) is backed by
DynamoDB. The design principle: **AWS provides the database; the API is just
SvelteKit.** There is no Lambda or API Gateway — `+server.js` endpoints run as
Vercel serverless functions and call DynamoDB directly with the AWS SDK.

### Request flow

```
browser ──> /papers (+page.js load, public read)
        └─> /api/papers        (+server.js)  ──> DynamoDB (reading_list)
            /api/papers/[id]    (+server.js)  ──> DynamoDB (reading_list)
```

- **Reads are public.** `GET /api/papers` and the `/papers` page need no auth.
- **Writes require a token.** `POST`/`PUT`/`DELETE` call `requireAdmin()`
  (`src/lib/server/auth.js`), which checks `Authorization: Bearer <token>`
  against the `ADMIN_TOKEN` env var. If `ADMIN_TOKEN` is unset, writes fail
  closed (503) — a misconfigured deploy can't accidentally allow writes.

On the page, the admin token is entered via the **Manage** button and stored in
`localStorage`; it's sent as a Bearer header on every write. It never touches
the server except as that header.

### API reference

| Method | Route              | Auth   | Purpose                          |
| ------ | ------------------ | ------ | -------------------------------- |
| GET    | `/api/papers`      | public | List all papers (newest first)   |
| POST   | `/api/papers`      | token  | Create a paper (`title` required)|
| PUT    | `/api/papers/:id`  | token  | Update fields on a paper         |
| DELETE | `/api/papers/:id`  | token  | Delete a paper                   |

### Data model — `reading_list` table

Single DynamoDB table, partition key **`id`** (String, a ULID), **no sort
key**, **on-demand** billing. The list view is a `Scan` (the dataset is tiny);
items sort newest-first because ULIDs are time-ordered. No GSI yet — add a
status GSI only if the list ever grows large enough that scanning hurts.

| Field     | Type     | Notes                                            |
| --------- | -------- | ------------------------------------------------ |
| `id`      | string   | ULID, generated server-side on create            |
| `title`   | string   | required                                         |
| `authors` | string   |                                                  |
| `url`     | string   | link to the actual paper                         |
| `venue`   | string   |                                                  |
| `year`    | string   |                                                  |
| `abstract`| string   |                                                  |
| `status`  | string   | `to-read` \| `reading` \| `read`                 |
| `tags`    | string[] |                                                  |
| `notes`   | string   |                                                  |
| `rating`  | number   | 1–5, or null                                     |
| `addedAt` | string   | ISO timestamp, set on create                     |
| `readAt`  | string   | ISO timestamp, set when status first hits `read` |

`id`/`addedAt` are server-controlled; the endpoints ignore them if sent by a
client. Field validation/whitelisting lives in `api/papers/+server.js`
(`sanitize`) and `api/papers/[id]/+server.js` (`EDITABLE`).

DynamoDB is schemaless, so the table needs no migration to gain a field — but
the API whitelist gates what's accepted (on purpose: it protects server-owned
fields and coerces types). **To add a field** (e.g. `description`), edit four
spots: `sanitize()` in `api/papers/+server.js`, the `EDITABLE` array in
`api/papers/[id]/+server.js`, and the form + display in `papers/+page.svelte`
(`blank()`/`startEdit()`/`payload()` and the markup). The `abstract` field is a
worked example of exactly this.

### Environment variables

Required for the backend. Locally they go in `.env` (gitignored); on Vercel set
them under **Project → Settings → Environment Variables**. See `.env.example`.

| Var                     | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `AWS_REGION`            | Region the table lives in (e.g. `us-east-1`)     |
| `AWS_ACCESS_KEY_ID`     | IAM user access key                              |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key                              |
| `READING_LIST_TABLE`    | Table name (defaults to `reading_list`)          |
| `ADMIN_TOKEN`           | Shared secret for writes (`openssl rand -hex 32`)|

### AWS setup (one-time, console)

The `reading_list` table was created by hand in the DynamoDB console
(partition key `id`, on-demand). To let the app reach it, create a dedicated
IAM user with **least-privilege** access to just that table:

1. IAM → Users → create user (e.g. `reading-list-app`), **no** console access.
2. Attach an inline policy (replace `REGION` and `ACCOUNT_ID`):

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "dynamodb:GetItem",
           "dynamodb:PutItem",
           "dynamodb:DeleteItem",
           "dynamodb:Scan"
         ],
         "Resource": "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/reading_list"
       }
     ]
   }
   ```

3. Create an access key for the user → put it in `AWS_ACCESS_KEY_ID` /
   `AWS_SECRET_ACCESS_KEY` (local `.env` and Vercel).

> If the app footprint grows, this hand-created infra is a good candidate to
> port to Terraform/CDK later — but for one table it isn't worth the tooling.

### Local development

1. `cp .env.example .env` and fill in all five vars.
2. `npm run dev` — the SvelteKit dev server runs the `+server.js` endpoints
   locally and hits the **real** DynamoDB table (there's no local mock).
3. Visit `/papers`, click **Manage**, paste your `ADMIN_TOKEN` to enable
   adding/editing.

---

## Design system / styling

All design tokens live as CSS custom properties in `src/app.css` (`:root`).
Use them instead of hard-coded values.

**Colors** (warm paper-and-ink palette):

| Token         | Value     | Use                          |
| ------------- | --------- | ---------------------------- |
| `--bg`        | `#F7F5F0` | page background              |
| `--bg-alt`    | `#EFECEA` | cards, code, callouts        |
| `--ink`       | `#1C1917` | primary text                 |
| `--ink-muted` | `#6B6560` | secondary text, meta         |
| `--accent`    | `#2D5A27` | links, accents (forest green)|
| `--accent-lt` | `#4A7C3F` | link hover                   |
| `--rule`      | `#D9D4CC` | borders, dividers            |

**Type** (loaded from Google Fonts in `app.css`):
- `--font-display` — Lora (headings, wordmark)
- `--font-body` — Source Serif 4 (body, `font-weight: 300`)
- `--font-mono` — JetBrains Mono (meta, tags, code)

**Layout tokens:** `--max-w: 680px` (content column), `--nav-h: 64px`.

**Utilities defined globally:** `.container` (centered max-width column),
`.tag` (mono uppercase pill), `.page-enter` (the `fadeUp` mount animation
applied to `<main>`).

Component-specific styles live in each component's scoped `<style>` block.
There is no shared component CSS beyond `app.css` and the per-post styles.

---

## Deployment

Deploys to **Vercel** via `@sveltejs/adapter-vercel`. A push to the connected
repo triggers a build; `npm run build` produces the Vercel output. No custom
`vercel.json` is present — it uses framework defaults.

The five backend env vars (see [Backend & API](#backend--api)) must be set in
the Vercel project settings, or `/papers` will 503 on writes / return an empty
list. Infra (the DynamoDB table + IAM user) is **not** part of the Vercel
deploy — it's created once in AWS and just persists. Pushing to deploy never
touches AWS infrastructure.

---

## Known loose ends / TODO

- **Email:** the footer links `michael.robinette@uvm.edu`; confirm that's the
  address you want public (your default contact elsewhere is a Gmail address).
- **No favicon:** the broken `<link rel="icon">` was removed from `app.html`.
  Drop a `favicon.png` into `static/` and re-add the link if you want one.
- **Blog index is hand-maintained** — consider mdsvex + a posts directory so
  posts are discovered automatically instead of listed by hand.
- No tests, linting, or formatting — add if/when the project grows.
