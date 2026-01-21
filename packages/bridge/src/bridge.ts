import { API_BASE_URL } from "@repo/shared";
import { isElectron, getEnvironment } from "./environment";

/**
 * Bridge API - Environment-aware abstraction layer
 *
 * When running in Electron: uses IPC to call main process
 * When running in browser: falls back to REST API or console.log
 */
export const bridge = {
  /**
   * Read a file from the filesystem
   */
  async readFile(path: string): Promise<string> {
    if (isElectron() && window.electronAPI) {
      return window.electronAPI.readFile(path);
    }

    // Browser fallback - call REST API
    console.log(`[bridge:${getEnvironment()}] readFile: ${path}`);
    const response = await fetch(
      `${API_BASE_URL}/api/fs/read?path=${encodeURIComponent(path)}`
    );
    if (!response.ok) {
      throw new Error(`Failed to read file: ${response.statusText}`);
    }
    return response.text();
  },

  /**
   * Write content to a file
   */
  async writeFile(path: string, content: string): Promise<void> {
    if (isElectron() && window.electronAPI) {
      return window.electronAPI.writeFile(path, content);
    }

    // Browser fallback - call REST API
    console.log(`[bridge:${getEnvironment()}] writeFile: ${path}`);
    const response = await fetch(`${API_BASE_URL}/api/fs/write`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, content }),
    });
    if (!response.ok) {
      throw new Error(`Failed to write file: ${response.statusText}`);
    }
  },

  /**
   * Check if a file exists
   */
  async fileExists(path: string): Promise<boolean> {
    if (isElectron() && window.electronAPI) {
      return window.electronAPI.fileExists(path);
    }

    // Browser fallback - call REST API
    console.log(`[bridge:${getEnvironment()}] fileExists: ${path}`);
    const response = await fetch(
      `${API_BASE_URL}/api/fs/exists?path=${encodeURIComponent(path)}`
    );
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.exists;
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

    // Browser fallback
    console.log(`[bridge:${getEnvironment()}] getAppInfo`);
    return {
      name: "Turbo Electron App",
      version: "0.0.1",
      platform: "browser",
    };
  },

  /**
   * Get system path
   */
  async getPath(
    name: "home" | "appData" | "userData" | "documents" | "downloads" | "desktop"
  ): Promise<string> {
    if (isElectron() && window.electronAPI) {
      return window.electronAPI.getPath(name);
    }

    // Browser fallback - not available
    console.log(`[bridge:${getEnvironment()}] getPath: ${name} - not available in browser`);
    throw new Error(`getPath is not available in browser environment`);
  },

  /**
   * Minimize window
   */
  minimize(): void {
    if (isElectron() && window.electronAPI) {
      window.electronAPI.minimize();
      return;
    }
    console.log(`[bridge:${getEnvironment()}] minimize - not available in browser`);
  },

  /**
   * Maximize window
   */
  maximize(): void {
    if (isElectron() && window.electronAPI) {
      window.electronAPI.maximize();
      return;
    }
    console.log(`[bridge:${getEnvironment()}] maximize - not available in browser`);
  },

  /**
   * Close window
   */
  close(): void {
    if (isElectron() && window.electronAPI) {
      window.electronAPI.close();
      return;
    }
    console.log(`[bridge:${getEnvironment()}] close - not available in browser`);
    window.close();
  },

  /**
   * Open file dialog
   */
  async openFileDialog(options?: {
    filters?: { name: string; extensions: string[] }[];
  }): Promise<string | null> {
    if (isElectron() && window.electronAPI) {
      return window.electronAPI.openFileDialog(options);
    }

    // Browser fallback - use file input
    console.log(`[bridge:${getEnvironment()}] openFileDialog - using browser file picker`);
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      if (options?.filters) {
        input.accept = options.filters
          .flatMap((f) => f.extensions.map((ext) => `.${ext}`))
          .join(",");
      }
      input.onchange = () => {
        const file = input.files?.[0];
        resolve(file ? file.name : null);
      };
      input.click();
    });
  },

  /**
   * Save file dialog
   */
  async saveFileDialog(options?: {
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }): Promise<string | null> {
    if (isElectron() && window.electronAPI) {
      return window.electronAPI.saveFileDialog(options);
    }

    // Browser fallback - not available (would need to use download approach)
    console.log(`[bridge:${getEnvironment()}] saveFileDialog - not available in browser`);
    return options?.defaultPath || null;
  },
};
