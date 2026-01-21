import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "@repo/shared";

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // File system
  readFile: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FS_READ_FILE, path),
  writeFile: (path: string, content: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_WRITE_FILE, path, content),
  fileExists: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FS_EXISTS, path),

  // App info
  getAppInfo: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_INFO),
  getPath: (
    name: "home" | "appData" | "userData" | "documents" | "downloads" | "desktop"
  ) => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_PATH, name),

  // Window controls
  minimize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE),
  close: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE),

  // Dialogs
  openFileDialog: (options?: {
    filters?: { name: string; extensions: string[] }[];
  }) => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_FILE, options),
  saveFileDialog: (options?: {
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }) => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SAVE_FILE, options),

  // Auto-update
  checkForUpdates: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_CHECK),
  downloadUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_DOWNLOAD),
  installUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_INSTALL),
  onUpdateStatus: (callback: (status: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, status: unknown) => callback(status);
    ipcRenderer.on(IPC_CHANNELS.UPDATE_STATUS, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_STATUS, handler);
    };
  },
});
