# CutoutPro AI — Premium Background Remover

AI diye hair-level precision soho image background remove korar full-ready Next.js app.

## ✨ Ki ki improve kora hoyeche (v2.0)

- **Before/After compare slider** — result ta drag kore compare kora jay
- **Toast notifications** — `alert()` er bodole professional toast UI
- **Client + server-side validation** — file type & size (12MB) check
- **Multiple background presets** — transparent, white, black, color swatches + custom picker
- **PNG o JPG dutoi format e HD download**
- **Drag-active visual feedback** — drag korar somoy border highlight hoy
- **Shimmer loading effect** — processing er somoy premium skeleton animation
- **API key configured kina check** — na thakle UI te warning dekhabe
- **Better error messages** — Bangla te clear error (invalid token, rate limit, ityadi)
- **Health-check endpoint** (`GET /api/remove-bg`)

## 🚀 Setup

1. Dependencies install korun:

   ```bash
   npm install
   ```

2. `.env.local.example` file take copy kore `.env.local` banan:

   ```bash
   cp .env.local.example .env.local
   ```

3. [replicate.com](https://replicate.com/account/api-tokens) theke free API token nie `.env.local` e boshan:

   ```env
   REPLICATE_API_TOKEN=r8_your_key_here
   ```

4. Dev server chalu korun:

   ```bash
   npm run dev
   ```

5. Browser e `http://localhost:3000` open korun.

## 📦 Deploy

Vercel e sobcheye shohoj: repo push korun, Vercel dashboard e `REPLICATE_API_TOKEN` environment variable set korun, deploy click korun.

## 🧠 AI Model

[BRIA RMBG-1.4](https://replicate.com/briaai/rmbg-1.4) — Replicate API diye call kora hoy, tai apnar nijer server e kono GPU lagbe na.
