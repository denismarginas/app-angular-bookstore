# Deploying this demo for free (Supabase + Vercel)

## 1. Before you run the app again

Two new dependencies were added (`dotenv`, `@supabase/supabase-js`). Run:

```
npm install
```

A `.env` file could not be created for you automatically (the tool that syncs files to this machine refuses to touch `.env` files, for safety). Create it yourself in the project root with this content — these are the same defaults as `.env.example`, so your app keeps using the local JSON files exactly as before:

```
APP_ENV=development
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
SUPABASE_BOOKS_BUCKET=book-images
```

With `APP_ENV=development` (or no `.env` at all), nothing changes: the API still reads and writes `src/assets/demo-db/*.json` and uploads book images into `src/assets/img/books/`.

## 2. How the switch works

`api/db-factory.js` picks the data layer based on `APP_ENV`:

- `development` (default) -> `api/db.js`, the existing local JSON-file implementation, untouched.
- `production` -> `api/db.supabase.js`, a Postgres/Storage-backed implementation with the exact same methods, so none of the route files (`books.js`, `orders.js`, `admin.js`, etc.) needed to change their logic — only `await` was added since Supabase calls are asynchronous.

Image uploads follow the same pattern: `db.uploadBookImage(...)` writes to disk locally, or to Supabase Storage in production, returning either a relative path or a public CDN URL. The Angular templates just bind `[src]` to whatever comes back, so no frontend changes were needed there either.

## 3. Set up Supabase (free)

1. Create a free account and project at supabase.com.
2. In the project's SQL Editor, run everything in `supabase/schema.sql` (creates the `books`, `orders`, `store`, `users`, `pages` and `contact_mails` tables, with Row Level Security turned on and no public policies — so the tables are only reachable with the service-role key your Express backend uses, never from a browser).
3. In Storage, create a new **public** bucket named `book-images` (or pick another name and set `SUPABASE_BOOKS_BUCKET` to match).
4. In Project Settings -> API, copy the Project URL and the `service_role` key (not the `anon` key — the service role key is what lets your backend bypass RLS; never expose it to the browser).
5. Put those into your local `.env`:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   ```
6. Import your existing demo data:
   ```
   npm run seed:supabase
   ```
   This reads your current `src/assets/demo-db/*.json` files and upserts them into the matching Supabase tables. Safe to re-run any time.
7. To try production mode locally before deploying, temporarily set `APP_ENV=production` in `.env` and restart `npm run api` — you should see the same data, now served from Supabase.

Free tier note: a Supabase project pauses itself after a week with no activity. If the live demo has been quiet for a while, the first request may be slow (or you may need to click "Restore" in the Supabase dashboard) — fine for a personal demo, not something a real shop could rely on.

## 4. One manual step before deploying to Vercel

Vercel automatically treats every file directly inside a folder named `api/` at the project root as its own serverless function. Right now that folder also holds plain helper modules (`db.js`, `books.js`, `admin.js`, etc.) that are not valid function handlers on their own — Vercel would try to build each one and fail.

Before connecting this repo to Vercel, rename the folder so it's out of Vercel's way:

```
git mv api server
```

Then update the two places that reference it:
- `server.ts`: change `import { registerApiRoutes } from './api/routes';` to `'./server/routes'`
- `package.json`: change `"api": "node api/server.js"` to `"api": "node server/dev-server.js"` (and rename `api/server.js` to `server/dev-server.js` as part of the `git mv`, e.g. `git mv api/server.js server/dev-server.js` after the folder move, or just `git mv server.js` inside the new folder)

With the folder renamed, Vercel's Angular framework preset deploys `server.ts` (which already mounts every `/api/*` route) as the app's single server function — no separate Vercel function or `vercel.json` rewrite needed for the API.

Ask me to do this rename-and-repoint step when you're ready — it's a five-minute change, just flagging why it's a separate step: the tools this session has for your machine can create and overwrite files, but not rename or delete them, so that one move is easiest done by you (or by me in a follow-up once you confirm).

## 5. Deploy

1. Push the repo to GitHub.
2. Import it into Vercel (vercel.com/new) — it should auto-detect the Angular project.
3. In the Vercel project's Environment Variables settings, add:
   ```
   APP_ENV=production
   SUPABASE_URL=...
   SUPABASE_SERVICE_KEY=...
   SUPABASE_BOOKS_BUCKET=book-images
   ```
4. Deploy. Vercel's free Hobby plan covers this comfortably (its fair-use terms restrict it to non-commercial/personal use, which fits a demo like this).
