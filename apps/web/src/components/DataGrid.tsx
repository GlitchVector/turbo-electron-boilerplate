"use client";

import { API_BASE_URL } from "@repo/shared";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useState } from "react";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  country: string;
  salary: number;
  status: string;
  hireDate: string;
  performance: number;
}

const darkTheme = themeQuartz.withParams({
  backgroundColor: "#09090b",
  foregroundColor: "#fafafa",
  headerBackgroundColor: "#18181b",
  headerTextColor: "#fafafa",
  borderColor: "#27272a",
  rowHoverColor: "#27272a",
  selectedRowBackgroundColor: "#27272a",
  oddRowBackgroundColor: "#0a0a0a",
});

export function DataGrid() {
  const [rowData, setRowData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [colDefs] = useState<ColDef<User>[]>([
    { field: "id", headerName: "ID", width: 80, filter: "agNumberColumnFilter" },
    { field: "name", headerName: "Name", flex: 1, filter: "agTextColumnFilter" },
    { field: "email", headerName: "Email", flex: 1.5, filter: "agTextColumnFilter" },
    { field: "department", headerName: "Department", width: 130, filter: "agTextColumnFilter" },
    { field: "country", headerName: "Country", width: 120, filter: "agTextColumnFilter" },
    {
      field: "salary",
      headerName: "Salary",
      width: 120,
      filter: "agNumberColumnFilter",
      valueFormatter: (params) => (params.value ? `$${params.value.toLocaleString()}` : ""),
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      filter: "agTextColumnFilter",
      cellRenderer: (params: { value: string }) => {
        const colors: Record<string, string> = {
          active: "bg-emerald-500/20 text-emerald-400",
          inactive: "bg-zinc-500/20 text-zinc-400",
          pending: "bg-yellow-500/20 text-yellow-400",
          archived: "bg-red-500/20 text-red-400",
        };
        return (
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${colors[params.value] || ""}`}>
            {params.value}
          </span>
        );
      },
    },
    { field: "hireDate", headerName: "Hire Date", width: 120, filter: "agDateColumnFilter" },
    {
      field: "performance",
      headerName: "Performance",
      width: 130,
      filter: "agNumberColumnFilter",
      cellRenderer: (params: { value: number }) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-16 overflow-hidden rounded-full bg-zinc-700">
            <div
              className={`h-full ${
                params.value >= 70
                  ? "bg-emerald-500"
                  : params.value >= 40
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${params.value}%` }}
            />
          </div>
          <span className="text-xs">{params.value}%</span>
        </div>
      ),
    },
  ]);

  const defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/data/users`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setRowData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-red-800 bg-red-900/20 p-6">
        <div className="text-center">
          <p className="mb-2 text-red-400">Failed to load data</p>
          <p className="mb-4 text-sm text-zinc-500">{error}</p>
          <button
            onClick={fetchData}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full rounded-xl border border-zinc-800 overflow-hidden">
      {loading ? (
        <div className="flex h-full items-center justify-center bg-zinc-900">
          <div className="text-zinc-400">Loading data...</div>
        </div>
      ) : (
        <AgGridReact
          theme={darkTheme}
          rowData={rowData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={50}
          paginationPageSizeSelector={[25, 50, 100, 200]}
          rowSelection="multiple"
          animateRows={true}
        />
      )}
    </div>
  );
}
