# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # Run all apps (web, api, desktop)
pnpm dev:web          # Next.js only (browser at localhost:3000)
pnpm dev:api          # Fastify API only (localhost:3001)
pnpm dev:desktop      # Electron (requires web running first)

# Build
pnpm build            # Build all packages
pnpm typecheck        # Run TypeScript checks across all packages

# Package desktop app
pnpm --filter @repo/desktop package       # All platforms
pnpm --filter @repo/desktop package:mac   # macOS only
pnpm --filter @repo/desktop package:win   # Windows only
pnpm --filter @repo/desktop package:linux # Linux only

# Release workflow
pnpm changeset        # Create a changeset for version bumping
pnpm version          # Apply changesets to bump versions
```

## Architecture

This is an Electron + Next.js monorepo using Turborepo. The key architectural pattern is **dual-mode operation**: the Next.js app runs both standalone in browser AND inside Electron.

### Package Structure

- `apps/desktop` - Electron main process (minimal shell, IPC handlers only)
- `apps/web` - Next.js frontend (works in browser or Electron)
- `apps/api` - Fastify REST backend (browser fallback when not in Electron)
- `packages/bridge` - Environment-aware abstraction layer
- `packages/shared` - IPC channel definitions, types, constants

### The Bridge Pattern

The `@repo/bridge` package detects the runtime environment and routes calls appropriately:

```typescript
import { bridge } from "@repo/bridge";

// In Electron: calls main process via IPC
// In browser: calls REST API at /api/...
await bridge.readFile("/path/to/file");
```

### IPC Flow

1. **Channel definitions**: All IPC channels defined in `packages/shared/src/ipc.ts` (single source of truth)
2. **Main process handlers**: `apps/desktop/src/main.ts` implements `ipcMain.handle()` for each channel
3. **Preload exposure**: `apps/desktop/src/preload.ts` exposes APIs via `contextBridge`
4. **Bridge types**: `packages/bridge/src/types.ts` defines the `ElectronAPI` interface
5. **Bridge implementation**: `packages/bridge/src/bridge.ts` provides environment-aware wrappers

When adding new IPC functionality:
1. Add channel to `IPC_CHANNELS` in `packages/shared/src/ipc.ts`
2. Add handler type to `IpcHandlers` interface in same file
3. Implement handler in `apps/desktop/src/main.ts`
4. Expose in `apps/desktop/src/preload.ts`
5. Add to `ElectronAPI` interface in `packages/bridge/src/types.ts`
6. Add bridge wrapper in `packages/bridge/src/bridge.ts`

### Auto-Update System

- `apps/desktop/src/updater.ts` - electron-updater configuration
- `packages/bridge/src/hooks/useAutoUpdate.ts` - React hook for update UI
- Updates published to GitHub Releases via `.github/workflows/release.yml`

## Workspace Packages

| Package | Name | Purpose |
|---------|------|---------|
| `apps/desktop` | `@repo/desktop` | Electron shell |
| `apps/web` | `@repo/web` | Next.js frontend |
| `apps/api` | `@repo/api` | Fastify REST API |
| `packages/bridge` | `@repo/bridge` | IPC/REST abstraction |
| `packages/shared` | `@repo/shared` | Shared types/constants |

Filter to specific package: `pnpm --filter @repo/desktop <command>`
