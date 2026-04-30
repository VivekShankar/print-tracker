# Print Tracker

A weekly tracker for monitoring how much paper you print — and how many trees that costs every year.

Built as the digital companion to the "Print Less" Strategic Communication presentation.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Build for production

```bash
npm run build
```

Output goes to `dist/`.

## Deploy to Vercel

See `DEPLOY.md` for the full step-by-step guide.

## Stack

- React 18 + Vite
- No external CSS framework — inline styles for portability
- `localStorage` for persistence (data never leaves the device)

## Math

- Academic year: 30 weeks (3 quarters × 10 weeks)
- Sheets per tree: 8,333 (Conservatree benchmark)
- Annual projection: `weeklyTotal × 30`
- Trees: `annualPages ÷ 8,333`
