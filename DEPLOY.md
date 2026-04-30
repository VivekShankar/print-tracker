# Deploy to Vercel — Step by Step

You have two ways to deploy. Pick one:

- **Path A — Vercel CLI**: Fastest. No GitHub needed. Good if you just want it live in 5 minutes.
- **Path B — GitHub + Vercel Dashboard**: Slightly more setup. Gives you auto-deploy on every `git push` and a real version history. Recommended if you'll iterate.

If you don't already have Node.js installed, install it first from https://nodejs.org (LTS version is fine).

---

## One-time setup (do this first either way)

1. Open a terminal in the project folder (`print-tracker-deploy/`).
2. Install dependencies:

   ```bash
   npm install
   ```

3. Verify it runs locally:

   ```bash
   npm run dev
   ```

   Open http://localhost:5173 — confirm the tracker loads, the tree renders, and adding pages updates the projection. Stop the server with Ctrl+C when satisfied.

4. Verify the production build works:

   ```bash
   npm run build
   npm run preview
   ```

   Open the URL it prints. If the preview looks correct, the build is good. Stop with Ctrl+C.

If both worked, you're ready to deploy.

---

## Path A — Deploy with Vercel CLI (5 minutes)

1. **Install the CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Run the deploy command from the project folder:**

   ```bash
   vercel
   ```

3. **Answer the prompts:**

   - *Set up and deploy?* → **Y**
   - *Which scope?* → press Enter (your personal account)
   - *Link to existing project?* → **N**
   - *Project name?* → press Enter to accept `print-tracker-deploy`, or type your own (e.g., `print-less-tracker`)
   - *Which directory is your code in?* → press Enter (it defaults to `./`)
   - *Modify settings?* → **N**

   Vercel auto-detects Vite. The build runs in the cloud, then it gives you a URL like `https://print-tracker-deploy-xyz.vercel.app`.

4. **Deploy to production:**

   The first `vercel` command creates a *preview* deployment. To make it the production URL:

   ```bash
   vercel --prod
   ```

   This gives you a stable production URL. **This is the URL to put in your QR code.**

You're done. Skip to "After Deployment" below.

---

## Path B — Deploy via GitHub (recommended for iteration)

1. **Create a GitHub repo:**
   - Go to https://github.com/new
   - Name it (e.g., `print-tracker`), keep it Public or Private — your choice
   - Do NOT initialize with a README, .gitignore, or license (we already have those)
   - Click "Create repository"

2. **Push your code:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit — Print Tracker"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/print-tracker.git
   git push -u origin main
   ```

   Replace `YOUR-USERNAME` with your actual GitHub username.

3. **Connect to Vercel:**
   - Go to https://vercel.com and sign in with GitHub
   - Click "Add New..." → "Project"
   - Find your `print-tracker` repo, click "Import"
   - Vercel auto-detects Vite. **Don't change any settings.** Click "Deploy."
   - Wait ~30 seconds for the build to complete

4. **Get your production URL:**
   - When the deploy finishes, you see a confetti screen with a URL like `https://print-tracker.vercel.app`
   - **This is the URL to put in your QR code.**

From now on, every `git push origin main` automatically redeploys.

---

## After Deployment — Update your QR code

Whichever path you took, you now have a production URL. To wire it into the handout:

1. Open `/home/claude/print-less/handout.html` (or wherever your handout source lives)
2. Find the QR code generation script — it generates the QR from a placeholder URL
3. Replace the placeholder with your real Vercel URL
4. Regenerate the QR code image
5. Re-render the handout PDF

The next time someone scans the handout, they land on the live tracker.

---

## Custom domain (optional)

If you want something cleaner than `your-project.vercel.app`:

1. In your Vercel project dashboard, go to **Settings → Domains**
2. Add your custom domain (e.g., `printless.yourdomain.com`)
3. Vercel walks you through DNS setup

This is optional and not needed for the midterm — the `.vercel.app` URL works fine and is fast.

---

## Troubleshooting

**"Command not found: vercel"** — The CLI install didn't add to your PATH. Try `npx vercel` instead of `vercel`.

**"Build failed on Vercel" but `npm run build` works locally** — Likely a Node version mismatch. In your Vercel project settings, set Node.js Version to 20.x (current LTS as of 2026).

**"localStorage is not defined" error** — Shouldn't happen with this code (the localStorage call is inside `useEffect`, which only runs in the browser), but if it does, it usually means something tried to render the component server-side. Vite SPAs render client-side only, so this isn't a concern here.

**Tree visualization isn't updating** — Hard refresh (Cmd+Shift+R / Ctrl+Shift+R) to bust any cached JS bundle.

**Old tracking data persists when I expected a fresh start** — That's `localStorage` doing its job. Use the "Start a new week" button in the app, or open DevTools → Application → Storage → Clear site data.
