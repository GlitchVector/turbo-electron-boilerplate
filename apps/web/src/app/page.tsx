"use client";

import { bridge, getEnvironment, isElectron } from "@repo/bridge";
import { APP_NAME, APP_VERSION } from "@repo/shared";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [environment, setEnvironment] = useState<string>("loading...");
  const [inElectron, setInElectron] = useState(false);
  const [appInfo, setAppInfo] = useState<{
    name: string;
    version: string;
    platform: string;
  } | null>(null);

  useEffect(() => {
    setEnvironment(getEnvironment());
    setInElectron(isElectron());
    bridge.getAppInfo().then(setAppInfo).catch(console.error);
  }, []);

  const handleReadFile = async () => {
    try {
      const content = await bridge.readFile("/etc/hosts");
      alert(`File content (first 200 chars):\n${content.slice(0, 200)}`);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleOpenDialog = async () => {
    try {
      const path = await bridge.openFileDialog({
        filters: [{ name: "Text Files", extensions: ["txt", "md"] }],
      });
      if (path) {
        alert(`Selected: ${path}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">{APP_NAME}</h1>
          <p className="text-zinc-500">v{APP_VERSION}</p>
        </div>

        <div className="space-y-6">
          {/* Environment Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-lg font-semibold">Environment</h2>
            <div className="space-y-2 text-zinc-400">
              <p>
                Running in:{" "}
                <span className="rounded bg-zinc-800 px-2 py-1 font-mono text-emerald-400">
                  {environment}
                </span>
              </p>
              {appInfo && (
                <p>
                  Platform:{" "}
                  <span className="rounded bg-zinc-800 px-2 py-1 font-mono text-emerald-400">
                    {appInfo.platform}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Bridge Demo Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-lg font-semibold">Bridge Demo</h2>
            <p className="mb-4 text-zinc-400">
              The bridge abstraction detects the environment and routes calls appropriately:
            </p>
            <ul className="mb-6 space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>
                  <strong className="text-white">Electron:</strong> Uses IPC to call main process
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>
                  <strong className="text-white">Browser:</strong> Falls back to REST API or
                  console.log
                </span>
              </li>
            </ul>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleReadFile}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-700"
              >
                Read /etc/hosts
              </button>
              <button
                onClick={handleOpenDialog}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-700"
              >
                Open File Dialog
              </button>
            </div>
          </div>

          {/* Data Grid Demo */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-lg font-semibold">Data Grid</h2>
            <p className="mb-4 text-zinc-400">
              AG Grid with 1000 entries fetched from the REST API.
            </p>
            <Link
              href="/data"
              className="inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-emerald-500"
            >
              Open Data Grid
            </Link>
          </div>

          {/* Window Controls - Electron only */}
          {inElectron && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="mb-4 text-lg font-semibold">Window Controls</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => bridge.minimize()}
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-700"
                >
                  Minimize
                </button>
                <button
                  onClick={() => bridge.maximize()}
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-700"
                >
                  Maximize
                </button>
                <button
                  onClick={() => bridge.close()}
                  className="rounded-lg bg-red-900/50 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/70"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-12 text-center text-sm text-zinc-600">
          Built with Next.js, Electron, and Turborepo
        </footer>
      </main>
    </div>
  );
}
