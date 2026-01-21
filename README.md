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
- **Bridge pattern**: Electron-only IPC abstraction for desktop-specific capabilities (file system, native dialogs)
- **API layer**: Data operations via REST that work in both browser and Electron
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

The `@repo/bridge` package provides Electron-only capabilities. These methods work in the desktop app and throw errors or return null in the browser:

```typescript
import { bridge, isElectron } from "@repo/bridge";

// Electron-only - throws error in browser
const content = await bridge.readFile("/path/to/file");
const path = await bridge.getPath("documents");

// Check environment before using desktop features
if (isElectron()) {
  const content = await bridge.readFile("/path/to/file");
}
```

For data operations that work in both environments, use the API directly at `/api/data/...`.

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

## Release Workflow

This boilerplate uses [Changesets](https://github.com/changesets/changesets) for version management and GitHub Actions for automated releases.

### Creating a Changeset

When you make changes that should be released, create a changeset:

```bash
pnpm changeset
```

This will prompt you to:
1. Select which packages have changed
2. Choose the version bump type (patch/minor/major)
3. Write a summary of your changes

The changeset is saved as a markdown file in `.changeset/`.

### Version Bumping

When changesets are merged to `main`, a GitHub Action creates a "Version Packages" PR that:
- Bumps versions according to changesets
- Updates CHANGELOG files
- Removes the changeset files

Merging this PR triggers the release workflow.

### Automated Release Process

```
1. Developer runs: pnpm changeset
   → Creates .changeset/random-name.md describing changes

2. PR merged to main → version.yml creates "Version Packages" PR

3. Version PR merged → Creates git tag @repo/desktop@X.X.X

4. Tag push triggers release.yml:
   → Builds for mac/win/linux
   → Uploads to GitHub Releases (dmg, exe, AppImage + latest-*.yml)

5. User restarts app:
   → electron-updater fetches latest-mac.yml from GitHub Releases
   → Compares versions, notifies if update available
   → User can download & install
```

### Manual Release

To release manually without GitHub Actions:

```bash
# 1. Create changeset
pnpm changeset

# 2. Version packages
pnpm version

# 3. Build and package
pnpm --filter @repo/desktop package

# 4. Create GitHub release and upload artifacts
gh release create @repo/desktop@X.X.X apps/desktop/release/*
```

## Auto-Update

The desktop app includes auto-update functionality using `electron-updater`.

### How It Works

1. On startup (production only), the app checks GitHub Releases for updates
2. If an update is available, the renderer is notified via IPC
3. Users can download and install updates through the UI

### Using the Update Hook

```tsx
import { useAutoUpdate } from "@repo/bridge";

function UpdateBanner() {
  const {
    status,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    isUpdateAvailable,
    isDownloading,
    isReadyToInstall,
  } = useAutoUpdate();

  if (status.type === "available") {
    return (
      <div>
        Update available: v{status.version}
        <button onClick={downloadUpdate}>Download</button>
      </div>
    );
  }

  if (status.type === "downloading") {
    return <div>Downloading: {status.progress.toFixed(0)}%</div>;
  }

  if (status.type === "downloaded") {
    return (
      <div>
        Update ready to install
        <button onClick={installUpdate}>Restart & Install</button>
      </div>
    );
  }

  return null;
}
```

### Configuration

Update `apps/desktop/electron-builder.json` with your GitHub repository:

```json
{
  "publish": {
    "provider": "github",
    "owner": "YOUR_GITHUB_USERNAME",
    "repo": "YOUR_REPO_NAME"
  }
}
```

## Code Signing (Optional)

For production releases, you should code sign your app.

### macOS

1. Obtain an Apple Developer certificate
2. Add to GitHub Secrets:
   - `MAC_CERTS`: Base64-encoded .p12 file
   - `MAC_CERTS_PASSWORD`: Certificate password
   - `APPLE_ID`: Your Apple ID
   - `APPLE_APP_SPECIFIC_PASSWORD`: App-specific password
   - `APPLE_TEAM_ID`: Your team ID

### Windows

1. Obtain a code signing certificate
2. Add to GitHub Secrets:
   - `WIN_CERTS`: Base64-encoded .pfx file
   - `WIN_CERTS_PASSWORD`: Certificate password

### Entitlements

Mac entitlements are configured in `apps/desktop/resources/entitlements.mac.plist`. The default configuration allows:
- JIT compilation
- Unsigned executable memory (required for Electron)
- Network client access
- User-selected file access
