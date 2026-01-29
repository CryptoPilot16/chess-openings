# Deployment Guide - Chess Opening Trainer

## Quick Deploy to Vercel (Recommended)

**Why Vercel?** Native Next.js support, proper hydration, serverless functions, auto-scaling. No static export issues.

### Step 1: Push to GitHub

If not already done:
```bash
cd /home/clawdbot/workspace/chess-trainer
git init
git add .
git commit -m "Chess Opening Trainer v2"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chess-trainer.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repo (`chess-trainer`)
3. Vercel auto-detects Next.js → click Deploy
4. Done. Your app is live at `https://chess-trainer-XXXXX.vercel.app`

### Step 3: Optional - Custom Domain

In Vercel dashboard → Project Settings → Domains → Add your custom domain

---

## What Changed for Vercel

**REMOVED** from `next.config.js`:
- `output: 'export'` (static export disabled)
- `basePath: '/chess-openings'` (not needed for Vercel)

**WHY?** Static export was causing React hydration failures on GitHub Pages. Vercel runs Next.js natively with serverless functions, which properly handles client-side hydration.

**ADDED** `vercel.json` for deployment configuration.

---

## Build & Test Locally Before Deploy

```bash
npm run build
npm run start  # Test the built app locally
```

Should start on `http://localhost:3000` with full interactivity.

---

## If You Still Want GitHub Pages

Not recommended, but if you must:
1. Keep `output: 'export'` and `basePath: '/chess-openings'` in `next.config.js`
2. Run `npm run build`
3. Copy `out/` directory to `experiments/chess-openings` on gh-pages branch
4. Add `.nojekyll` to prevent Jekyll processing
5. Hard refresh and debug hydration issues

**Expect issues.** GitHub Pages + Next.js static export = hydration nightmares. Vercel is 100x better.

---

## Support

If deployment fails, check:
1. `vercel logs` (view deployment logs)
2. Browser console (F12 → Console for runtime errors)
3. Network tab (check if JS chunks are 404)
4. Vercel build tab (check build output for errors)
