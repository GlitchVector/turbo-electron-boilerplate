export type Environment = "electron" | "browser" | "server";

/**
 * Detect if we're running in Electron (renderer process with preload)
 */
export function isElectron(): boolean {
  if (typeof window === "undefined") return false;
  return window.electronAPI !== undefined;
}

/**
 * Detect if we're running in a browser (not Electron, not server)
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && !isElectron();
}

/**
 * Get the current environment
 */
export function getEnvironment(): Environment {
  if (typeof window === "undefined") return "server";
  if (isElectron()) return "electron";
  return "browser";
}
