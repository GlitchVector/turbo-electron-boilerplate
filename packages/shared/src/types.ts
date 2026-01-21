// Shared types used across the monorepo

export interface AppInfo {
  name: string;
  version: string;
  platform: NodeJS.Platform | "browser";
}

export interface FileResult {
  success: boolean;
  data?: string;
  error?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
