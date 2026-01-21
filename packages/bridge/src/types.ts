import type { IpcHandlers, IPC_CHANNELS } from "@repo/shared";

// Update status types from main process
export type UpdateStatusFromMain =
  | { type: "checking" }
  | {
      type: "available";
      info: { version: string; releaseNotes?: string | { version: string; note: string }[] };
    }
  | { type: "not-available"; info: { version: string } }
  | {
      type: "downloading";
      progress: { percent: number; bytesPerSecond: number; transferred: number; total: number };
    }
  | { type: "downloaded"; info: { version: string } }
  | { type: "error"; error: string };

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
  // Auto-update
  checkForUpdates: IpcHandlers[typeof IPC_CHANNELS.UPDATE_CHECK];
  downloadUpdate: IpcHandlers[typeof IPC_CHANNELS.UPDATE_DOWNLOAD];
  installUpdate: IpcHandlers[typeof IPC_CHANNELS.UPDATE_INSTALL];
  onUpdateStatus: (callback: (status: UpdateStatusFromMain) => void) => () => void;
}

// Extend the Window interface to include electronAPI
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
