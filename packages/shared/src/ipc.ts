// IPC channel definitions - single source of truth for Electron IPC

export const IPC_CHANNELS = {
  // File system operations
  FS_READ_FILE: "fs:readFile",
  FS_WRITE_FILE: "fs:writeFile",
  FS_EXISTS: "fs:exists",

  // App info
  APP_GET_INFO: "app:getInfo",
  APP_GET_PATH: "app:getPath",

  // Window controls
  WINDOW_MINIMIZE: "window:minimize",
  WINDOW_MAXIMIZE: "window:maximize",
  WINDOW_CLOSE: "window:close",

  // Dialog
  DIALOG_OPEN_FILE: "dialog:openFile",
  DIALOG_SAVE_FILE: "dialog:saveFile",

  // Auto-update
  UPDATE_CHECK: "update:check",
  UPDATE_DOWNLOAD: "update:download",
  UPDATE_INSTALL: "update:install",
  UPDATE_STATUS: "update:status",
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

// Type-safe IPC handler definitions
export interface IpcHandlers {
  [IPC_CHANNELS.FS_READ_FILE]: (path: string) => Promise<string>;
  [IPC_CHANNELS.FS_WRITE_FILE]: (
    path: string,
    content: string
  ) => Promise<void>;
  [IPC_CHANNELS.FS_EXISTS]: (path: string) => Promise<boolean>;
  [IPC_CHANNELS.APP_GET_INFO]: () => Promise<{
    name: string;
    version: string;
    platform: string;
  }>;
  [IPC_CHANNELS.APP_GET_PATH]: (
    name:
      | "home"
      | "appData"
      | "userData"
      | "documents"
      | "downloads"
      | "desktop"
  ) => Promise<string>;
  [IPC_CHANNELS.WINDOW_MINIMIZE]: () => void;
  [IPC_CHANNELS.WINDOW_MAXIMIZE]: () => void;
  [IPC_CHANNELS.WINDOW_CLOSE]: () => void;
  [IPC_CHANNELS.DIALOG_OPEN_FILE]: (options?: {
    filters?: { name: string; extensions: string[] }[];
  }) => Promise<string | null>;
  [IPC_CHANNELS.DIALOG_SAVE_FILE]: (options?: {
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }) => Promise<string | null>;
  [IPC_CHANNELS.UPDATE_CHECK]: () => Promise<void>;
  [IPC_CHANNELS.UPDATE_DOWNLOAD]: () => Promise<void>;
  [IPC_CHANNELS.UPDATE_INSTALL]: () => void;
}
