import { useState, useEffect, useCallback } from "react";
import { isElectron } from "../environment";

export type UpdateStatus =
  | { type: "idle" }
  | { type: "checking" }
  | { type: "available"; version: string; releaseNotes?: string }
  | { type: "not-available" }
  | { type: "downloading"; progress: number }
  | { type: "downloaded"; version: string }
  | { type: "error"; message: string };

export interface UseAutoUpdateReturn {
  status: UpdateStatus;
  checkForUpdates: () => Promise<void>;
  downloadUpdate: () => Promise<void>;
  installUpdate: () => void;
  isUpdateAvailable: boolean;
  isDownloading: boolean;
  isReadyToInstall: boolean;
}

export function useAutoUpdate(): UseAutoUpdateReturn {
  const [status, setStatus] = useState<UpdateStatus>({ type: "idle" });

  useEffect(() => {
    if (!isElectron()) return;

    const api = window.electronAPI;
    if (!api?.onUpdateStatus) return;

    const cleanup = api.onUpdateStatus((updateStatus) => {
      switch (updateStatus.type) {
        case "checking":
          setStatus({ type: "checking" });
          break;
        case "available":
          setStatus({
            type: "available",
            version: updateStatus.info.version,
            releaseNotes:
              typeof updateStatus.info.releaseNotes === "string"
                ? updateStatus.info.releaseNotes
                : undefined,
          });
          break;
        case "not-available":
          setStatus({ type: "not-available" });
          break;
        case "downloading":
          setStatus({
            type: "downloading",
            progress: updateStatus.progress.percent,
          });
          break;
        case "downloaded":
          setStatus({
            type: "downloaded",
            version: updateStatus.info.version,
          });
          break;
        case "error":
          setStatus({ type: "error", message: updateStatus.error });
          break;
      }
    });

    return cleanup;
  }, []);

  const checkForUpdates = useCallback(async () => {
    if (!isElectron()) return;
    const api = window.electronAPI;
    if (!api?.checkForUpdates) return;

    try {
      await api.checkForUpdates();
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to check for updates",
      });
    }
  }, []);

  const downloadUpdate = useCallback(async () => {
    if (!isElectron()) return;
    const api = window.electronAPI;
    if (!api?.downloadUpdate) return;

    try {
      await api.downloadUpdate();
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to download update",
      });
    }
  }, []);

  const installUpdate = useCallback(() => {
    if (!isElectron()) return;
    const api = window.electronAPI;
    if (!api?.installUpdate) return;

    api.installUpdate();
  }, []);

  return {
    status,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    isUpdateAvailable: status.type === "available",
    isDownloading: status.type === "downloading",
    isReadyToInstall: status.type === "downloaded",
  };
}
