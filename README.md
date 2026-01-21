# turbo-electron-boilerplate

A clean Electron + Next.js monorepo boilerplate with Turborepo.

## Architecture

```
├── apps/
│   ├── desktop/          # Electron shell (minimal - just IPC orchestration)
│   ├── web/              # Next.js app (works standalone or in Electron)
│   └── api/              # REST backend (Fastify)
├── packages/
│   ├── bridge/           # Environment-aware IPC abstraction
│   ├── shared/           # Types, constants, IPC channel definitions
│   └── tsconfig/         # Shared TypeScript configs
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

## Key Features

- **Dual-mode operation**: The Next.js app runs standalone in browser OR inside Electron
- **Bridge pattern**: Unified API that routes to IPC (Electron) or REST API (browser)
- **Minimal Electron shell**: Main process only handles IPC orchestration
- **Type-safe IPC**: Single source of truth for channel definitions
- **Turborepo**: Fast builds with caching and parallel execution

## Getting Started

```bash
# Install dependencies
pnpm install

# Development - run all apps
pnpm dev

# Development - run specific apps
pnpm dev:web      # Next.js only (browser)
pnpm dev:api      # API only
pnpm dev:desktop  # Electron (requires web to be built or running)

# Build all
pnpm build

# Package Electron app
pnpm --filter @repo/desktop package
```

## How It Works

### The Bridge Pattern

The `@repo/bridge` package provides a unified API that detects the environment:

```typescript
import { bridge, isElectron } from "@repo/bridge";

// Works in both Electron and browser
const content = await bridge.readFile("/path/to/file");

// In Electron: uses IPC to call main process
// In browser: calls REST API at /api/fs/read
```

### IPC Channel Definitions

All IPC channels are defined in `@repo/shared/src/ipc.ts`:

```typescript
import { IPC_CHANNELS } from "@repo/shared";

// Type-safe channel names
IPC_CHANNELS.FS_READ_FILE  // "fs:readFile"
IPC_CHANNELS.APP_GET_INFO  // "app:getInfo"
```

## Development Workflow

1. **Browser-only development**: Run `pnpm dev:web` and `pnpm dev:api`
2. **Electron development**: Run `pnpm dev:web` first, then `pnpm dev:desktop`
3. **Production build**: Run `pnpm build` then `pnpm --filter @repo/desktop package`
