# Wheel

A Next.js 14 project bootstrapped with Tailwind CSS and [shadcn/ui](https://ui.shadcn.com) components.

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install # or npm install / yarn
   ```
2. **Environment variables**
   Copy `.env.local.example` ➡️ `.env.local` and add real values.
   ```bash
   cp .env.local.example .env.local
   ```
3. **Run development server**
   ```bash
   pnpm dev
   ```
   Visit http://localhost:3000.

## Deployment

This repo is ready for Vercel. Environment variables defined in `.env.local` will automatically map to Vercel project vars.

## Adding Components

Use the shadcn MCP integration:
```bash
pnpx shadcn-ui@latest add button
```

## Product Requirements Document (PRD)

Store your PRD markdown files under `docs/`.
- For example: `docs/PRD-v1.md`.
- Keep them versioned in Git; Vercel ignores this folder at build time.
