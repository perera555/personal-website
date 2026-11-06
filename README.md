# Dhanushka Perera — Personal Website & Blog

My personal website for sharing blog posts, plus my portfolio (experience, education and skills). Built with Next.js 16 and Tailwind CSS 4.

## Features

- **Blog** at `/blog`: the newest post is featured on the homepage, and every post has share buttons for LinkedIn, Facebook, WhatsApp and X, plus copy link
- **Portfolio**: about, experience timeline, qualifications and skills
- **Contact form**: messages arrive in the admin inbox
- **Admin** at `/admin`: write and edit blog posts (with live preview), edit all website text and read messages
- 3D cube, tilting cards, and light/dark mode

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The admin is at http://localhost:3000/admin.

## Settings (`.env.local`)

Create a `.env.local` file in the project folder. It is never uploaded to GitHub.

```
ADMIN_PASSWORD=your-password-here
SESSION_SECRET=any-long-random-text
# SITE_URL=https://your-domain.com   (once the site is online)
```

## Where content is stored

- **Online (Vercel):** in an Upstash Redis database, used automatically when `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`) are set.
- **On your computer:** as JSON files in the `content/` folder.

## Deploying to Vercel

1. Import this GitHub repository at vercel.com.
2. In the project, go to **Storage → Create Database → Upstash (Redis)** and connect it to the project.
3. Under **Settings → Environment Variables**, add `ADMIN_PASSWORD`, `SESSION_SECRET` and `SITE_URL`.
4. Redeploy. After that, every push to `main` deploys automatically.

## Writing blog posts

Posts use simple formatting:

```
## Heading
**bold**  *italic*  [link](https://example.com)
- bullet list
> quote
![image](/images/photo.jpg)
```

Put images in the `public/` folder and refer to them as `/your-image.jpg`.
