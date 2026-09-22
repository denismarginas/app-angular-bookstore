# Deploying this demo for free (Azure App Service)

This is a plain deployment of the app as it stands: local JSON files as the database, no external database or storage provider. That keeps things simple for now — a provider (Supabase or otherwise) can be added back later if you want data to survive redeploys.

Azure App Service is a good fit for this project: App Service runs your compiled server (`dist/angular-bookstore1/server/server.mjs`) as one ordinary, always-running Node process, the same way `npm run serve:ssr:angular-bookstore1` works locally. One Express app handles SSR pages, static assets and every `/api/*` route together.

## 1. Before you start

- A free Azure account (signup asks for a card for identity verification, but the Free F1 plan itself costs nothing).
- This repo pushed to GitHub.

## 2. Create the App Service (Azure Portal)

1. Go to [portal.azure.com](https://portal.azure.com) and create a resource → **Web App**.
2. **Basics**: pick a resource group (create one if you don't have one), give the app a globally unique name — this becomes `https://<name>.azurewebsites.net`.
3. **Publish**: `Code`.
4. **Runtime stack**: `Node 24 LTS`.
5. **Operating System**: `Linux`.
6. **Region**: whichever is closest to you.
7. **Pricing plan**: create a new App Service Plan, and under Pricing plan pick **Free F1**. This is the step that keeps it free — don't leave it on a paid tier by mistake.
8. Review + create.

## 3. Set the startup command

By default Azure would try to run this project's `npm start` script, which is the local dev command (`concurrently "npm run api" "ng serve"`) — that's wrong for production and won't serve the built app correctly.

In the Portal: your App Service → **Settings → Configuration → General settings → Startup Command**, set it to:

```
npm run serve:ssr:angular-bookstore1
```

This runs the same script your `package.json` already defines for serving the production SSR build. No environment variables are required — Azure sets `PORT` for you automatically, and `server.ts` already reads `process.env['PORT']`.

## 4. Connect GitHub for automatic deploys

App Service → **Deployment → Deployment Center**:

1. Source: **GitHub**. Authorize and pick your organization, repository and branch (e.g. `main`).
2. Azure generates a GitHub Actions workflow in your repo (`.github/workflows/...`) and stores a publish-profile secret for it automatically.
3. Save. This triggers the first deployment.

On each push to that branch from then on, Azure will pull the code, run `npm install` and `npm run build` (your existing `"build": "ng build"` script), and start it with the command from step 3.

## 5. Important limitation: data won't persist

Since there's no external database or storage right now, book/order edits made through the admin panel and any book images uploaded while live on Azure are written to the same local JSON files and local disk the app ships with — and a new deployment (any push to your branch) overwrites the site's files, wiping those changes back to whatever's in the repo. Fine for a demo people just click around in; not fine if you need admin changes to stick. Say the word if you want a real database/storage provider wired back in later.

## 6. A note on the Free F1 quota

F1 includes 60 CPU-minutes/day of shared compute, no "Always On" (so the app sleeps after inactivity and the first request after a while will be slow), and 1 GB storage — fine for a personal demo, not for real traffic. The `ng build` that runs on every deploy also counts against that daily CPU quota. For a small project like this it's unlikely to matter, but if you deploy very frequently and start seeing quota errors, the fix is to have GitHub Actions build the app (on GitHub's free runners) and only upload the already-built `dist/` folder to Azure, skipping the on-server build — ask me if you want to set that up.

## 7. Clean-up still pending

A few leftover files from earlier work aren't used anymore and are safe to delete whenever you get to it:

- `api/` — the old folder, superseded by `server/`.
- `server/db-factory.js` and `server/db.supabase.js` — the provider-switching code, no longer used now that `server/routes.js` talks to `server/db.js` directly.
- `supabase/` and `scripts/seed-supabase.js` — Supabase-specific setup, unused for now.
- `.env` and `.env.example` — no longer read by the app.
- `DEPLOYMENT.md` — the earlier Vercel + Supabase write-up; superseded by this file.

None of these block anything from working — they're just dead weight in the repo.
