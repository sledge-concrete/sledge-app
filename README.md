This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Progress Log

### Browser Tab Favicon

- Added an App Router `app/icon.svg` sledge hammer icon so browsers can use an SVG tab favicon while keeping the existing `.ico` fallback.

### Safety Detail Back Link

- Doubled the Safety back-link label size on the safety job detail view for better readability.

### Safety Detail Flow

- Reworked the job safety detail view around a large daily Safety Sign-Off action, current-day signature collection, and an expandable previous-sheets table.

### Safety Sign-off Module

- Added FLHA domain types and mock data for `flha_sessions` and `flha_signatures`, including the requested Riverfront, Maple Street, and Highway 2 scenarios.
- Added tablet-first routes for `/dashboard/safety`, `/dashboard/safety/[jobId]`, and `/dashboard/safety/review`.
- Digitized the FLHA header fields, hazard checklist, required controls checklist, comments, validation, read-only submitted view, worker signature flow, review table, and on-demand PDF export with `@react-pdf/renderer`.
- Mock persistence is browser-local through `localStorage`; no real database writes have been added yet.
