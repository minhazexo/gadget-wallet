# Contributing to Gadget Wallet

Thank you for contributing to Gadget Wallet!

## Development Setup

1. Clone repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Setup `.env`:
   ```bash
   cp .env.example .env
   ```
4. Start development servers:
   ```bash
   bun run dev
   ```

## Folder Conventions

- `apps/web`: React + Vite storefront application
- `apps/server`: Hono REST API server
- `packages/db`: Drizzle ORM schemas & database helpers
- `packages/ui`: Shared component design system
- `packages/types`: Shared TypeScript definitions

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Run typechecks & linting:
   ```bash
   bun run typecheck
   bun run lint
   ```
3. Commit your changes and submit a Pull Request.
