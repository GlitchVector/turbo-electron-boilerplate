import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import { readFile, writeFile, access } from "fs/promises";
import { constants } from "fs";
import { IPC_CHANNELS } from "@repo/shared";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Required for preload to work with remote URLs
    },
    // Frameless window with custom titlebar (optional)
    // titleBarStyle: "hidden",
    // trafficLightPosition: { x: 16, y: 16 },
  });

  // In development, load from Next.js dev server
  // In production, load the static export
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    // Load from the extraResources path in production
    const appPath = app.isPackaged
      ? join(process.resourcesPath, "app", "index.html")
      : join(__dirname, "../../web/out/index.html");
    mainWindow.loadFile(appPath);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// IPC Handlers - Minimal, focused on bridging to main process capabilities

// File system operations
ipcMain.handle(IPC_CHANNELS.FS_READ_FILE, async (_, path: string) => {
  return readFile(path, "utf-8");
});

ipcMain.handle(
  IPC_CHANNELS.FS_WRITE_FILE,
  async (_, path: string, content: string) => {
    await writeFile(path, content, "utf-8");
  }
);

ipcMain.handle(IPC_CHANNELS.FS_EXISTS, async (_, path: string) => {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
});

// App info
ipcMain.handle(IPC_CHANNELS.APP_GET_INFO, () => ({
  name: app.getName(),
  version: app.getVersion(),
  platform: process.platform,
}));

ipcMain.handle(
  IPC_CHANNELS.APP_GET_PATH,
  (
    _,
    name: "home" | "appData" | "userData" | "documents" | "downloads" | "desktop"
  ) => {
    return app.getPath(name);
  }
);

// Window controls
ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
  mainWindow?.minimize();
});

ipcMain.on(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, () => {
  mainWindow?.close();
});

// Dialogs
ipcMain.handle(
  IPC_CHANNELS.DIALOG_OPEN_FILE,
  async (_, options?: { filters?: { name: string; extensions: string[] }[] }) => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ["openFile"],
      filters: options?.filters,
    });
    return result.canceled ? null : result.filePaths[0];
  }
);

ipcMain.handle(
  IPC_CHANNELS.DIALOG_SAVE_FILE,
  async (
    _,
    options?: {
      defaultPath?: string;
      filters?: { name: string; extensions: string[] }[];
    }
  ) => {
    const result = await dialog.showSaveDialog(mainWindow!, {
      defaultPath: options?.defaultPath,
      filters: options?.filters,
    });
    return result.canceled ? null : result.filePath;
  }
);

// App lifecycle
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
