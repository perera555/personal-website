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

Blog posts, page content and messages are saved as JSON files in the `content/` folder. The site needs a host with a permanent disk, such as a VPS, Railway (with a volume) or Render (with a disk).

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
