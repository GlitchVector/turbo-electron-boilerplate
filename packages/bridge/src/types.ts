import type { IpcHandlers, IPC_CHANNELS } from "@repo/shared";

// The API exposed by Electron's preload script
export interface ElectronAPI {
  readFile: IpcHandlers[typeof IPC_CHANNELS.FS_READ_FILE];
  writeFile: IpcHandlers[typeof IPC_CHANNELS.FS_WRITE_FILE];
  fileExists: IpcHandlers[typeof IPC_CHANNELS.FS_EXISTS];
  getAppInfo: IpcHandlers[typeof IPC_CHANNELS.APP_GET_INFO];
  getPath: IpcHandlers[typeof IPC_CHANNELS.APP_GET_PATH];
  minimize: IpcHandlers[typeof IPC_CHANNELS.WINDOW_MINIMIZE];
  maximize: IpcHandlers[typeof IPC_CHANNELS.WINDOW_MAXIMIZE];
  close: IpcHandlers[typeof IPC_CHANNELS.WINDOW_CLOSE];
  openFileDialog: IpcHandlers[typeof IPC_CHANNELS.DIALOG_OPEN_FILE];
  saveFileDialog: IpcHandlers[typeof IPC_CHANNELS.DIALOG_SAVE_FILE];
}

// Extend the Window interface to include electronAPI
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
