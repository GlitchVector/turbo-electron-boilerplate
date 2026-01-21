import { isElectron } from "./environment";

/**
 * Bridge API - Electron-only abstraction layer
 *
 * These methods require the desktop app and will throw errors in the browser.
 * For data operations that work in both environments, use the API directly.
 */
export const bridge = {
  /**
   * Read a file from the filesystem
   * @throws Error if not running in Electron
   */
  async readFile(path: string): Promise<string> {
    if (isElectron() && window.electronAPI) {
      return window.electronAPI.readFile(path);
    }
    throw new Error("File system access requires the desktop app");
  },

  /**
   * Write content to a file
   * @throws Error if not running in Electron
   */
  async writeFile(path: string, content: string): Promise<void> {
    if (isElectron() && window.electronAPI) {
      return window.electronAPI.writeFile(path, content);
    }
    throw new Error("File system access requires the desktop app");
  },

  /**
   * Check if a file exists
   * @throws Error if not running in Electron
   */
  async fileExists(path: string): Promise<boolean> {
    if (isElectron() && window.electronAPI) {
      return window.electronAPI.fileExists(path);
    }
    throw new Error("File system access requires the desktop app");
  },

  /**
   * Get application info
   */
  async getAppInfo(): Promise<{
    name: string;
    version: string;
    platform: string;
  }> {
    if (isElectron() && window.electronAPI) {
      return window.electronAPI.getAppInfo();
    }

    // Browser fallback - return browser info
    return {
      name: "Turbo Electron App",
      version: "0.0.1",
      platform: "browser",
    };
  },

  /**
   * Get system path
   * @throws Error if not running in Electron
   */
  async getPath(
    name: "home" | "appData" | "userData" | "documents" | "downloads" | "desktop"
  ): Promise<string> {
    if (isElectron() && window.electronAPI) {
      return window.electronAPI.getPath(name);
    }
    throw new Error("System path access requires the desktop app");
  },

  /**
   * Minimize window (no-op in browser)
   */
  minimize(): void {
    if (isElectron() && window.electronAPI) {
      window.electronAPI.minimize();
    }
  },

  /**
   * Maximize window (no-op in browser)
   */
  maximize(): void {
    if (isElectron() && window.electronAPI) {
      window.electronAPI.maximize();
    }
  },

  /**
   * Close window
   */
  close(): void {
    if (isElectron() && window.electronAPI) {
      window.electronAPI.close();
      return;
    }
    window.close();
  },

  /**
   * Open file dialog
   * @returns null if not running in Electron
   */
  async openFileDialog(options?: {
    filters?: { name: string; extensions: string[] }[];
  }): Promise<string | null> {
    if (isElectron() && window.electronAPI) {
      return window.electronAPI.openFileDialog(options);
    }
    return null;
  },

  /**
   * Save file dialog
   * @returns null if not running in Electron
   */
  async saveFileDialog(options?: {
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }): Promise<string | null> {
    if (isElectron() && window.electronAPI) {
      return window.electronAPI.saveFileDialog(options);
    }
    return null;
  },
};
