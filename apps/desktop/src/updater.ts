import { autoUpdater, UpdateInfo } from "electron-updater";
import { BrowserWindow, ipcMain } from "electron";
import log from "electron-log";
import { IPC_CHANNELS } from "@repo/shared";

// Configure logging
log.transports.file.level = "info";
autoUpdater.logger = log;

// Disable auto-download by default - let user control when to download
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

export type UpdateStatus =
  | { type: "checking" }
  | { type: "available"; info: UpdateInfo }
  | { type: "not-available"; info: UpdateInfo }
  | { type: "downloading"; progress: { percent: number; bytesPerSecond: number; transferred: number; total: number } }
  | { type: "downloaded"; info: UpdateInfo }
  | { type: "error"; error: string };

let mainWindow: BrowserWindow | null = null;

function sendStatusToWindow(status: UpdateStatus) {
  if (mainWindow?.webContents) {
    mainWindow.webContents.send(IPC_CHANNELS.UPDATE_STATUS, status);
  }
}

export function initAutoUpdater(window: BrowserWindow) {
  mainWindow = window;

  // Update events
  autoUpdater.on("checking-for-update", () => {
    log.info("Checking for update...");
    sendStatusToWindow({ type: "checking" });
  });

  autoUpdater.on("update-available", (info: UpdateInfo) => {
    log.info("Update available:", info.version);
    sendStatusToWindow({ type: "available", info });
  });

  autoUpdater.on("update-not-available", (info: UpdateInfo) => {
    log.info("Update not available, current version is latest");
    sendStatusToWindow({ type: "not-available", info });
  });

  autoUpdater.on("download-progress", (progress) => {
    log.info(`Download progress: ${progress.percent.toFixed(1)}%`);
    sendStatusToWindow({
      type: "downloading",
      progress: {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total,
      },
    });
  });

  autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
    log.info("Update downloaded:", info.version);
    sendStatusToWindow({ type: "downloaded", info });
  });

  autoUpdater.on("error", (err) => {
    log.error("Update error:", err);
    sendStatusToWindow({ type: "error", error: err.message });
  });

  // IPC handlers for renderer control
  ipcMain.handle(IPC_CHANNELS.UPDATE_CHECK, async () => {
    try {
      return await autoUpdater.checkForUpdates();
    } catch (err) {
      log.error("Check for updates failed:", err);
      throw err;
    }
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_DOWNLOAD, async () => {
    try {
      await autoUpdater.downloadUpdate();
    } catch (err) {
      log.error("Download update failed:", err);
      throw err;
    }
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_INSTALL, () => {
    autoUpdater.quitAndInstall(false, true);
  });
}

export function checkForUpdatesOnStartup() {
  // Only check for updates in production packaged app
  // In development, autoUpdater will throw an error
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.error("Startup update check failed:", err);
    });
  }, 3000); // Delay to not slow down app startup
}
