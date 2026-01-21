// Shared constants

export const APP_NAME = "Turbo Electron App";
export const APP_VERSION = "0.0.1";

export const API_PORT = 3001;
export const WEB_PORT = 3000;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || `http://localhost:${API_PORT}`;
