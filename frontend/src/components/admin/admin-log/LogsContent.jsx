import { useEffect, useState } from "react";
import LogsFilters from "./LogsFilters";
import LogsTable from "./LogsTable";
import LogsPagination from "./LogsPagination";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/admin/admin-logs/get_logs.php`;


export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    module: "all",
    date: "",
    page: 1,
    limit: 10,
  });

  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: filters.search,
        module: filters.module === "all" ? "" : filters.module,
        date: filters.date, 
        page: filters.page,
        limit: filters.limit,
      });

      const res = await fetch(`${API}?${params.toString()}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setLogs(data.logs || []);
        setTotalPages(data.pages || 1);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Logs fetch failed", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [
    filters.page,
    filters.module,
    filters.search,
    filters.date, 
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Logs</h1>
        <p className="text-muted-foreground">
          Complete audit trail of all activities
        </p>
      </div>

      <LogsFilters filters={filters} setFilters={setFilters} />

      <LogsTable logs={logs} loading={loading} />

      <LogsPagination
        page={filters.page}
        totalPages={totalPages}
        onChange={(page) =>
          setFilters((p) => ({ ...p, page }))
        }
      />
    </div>
  );
}
