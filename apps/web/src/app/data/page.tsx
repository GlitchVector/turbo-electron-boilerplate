import Link from "next/link";
import { DataGrid } from "@/components/DataGrid";

export default function DataPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Data Grid</h1>
            <p className="text-zinc-500">1000 entries from the API</p>
          </div>
          <Link
            href="/"
            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-700"
          >
            Back to Home
          </Link>
        </div>

        <DataGrid />
      </main>
    </div>
  );
}
