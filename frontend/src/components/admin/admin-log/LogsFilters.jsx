import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LogsFilters({ filters, setFilters }) {
  // Theme observer
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const inputStyle = {
    backgroundColor: isDark ? "#141414" : "#ffffff",
    color: isDark ? "#ffffff" : "#000000",
    border: `1px solid ${isDark ? "#2E2E2E" : "#e2e8f0"}`,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>

      <CardContent className="grid md:grid-cols-4 gap-4">
        <Input
          placeholder="Search logs..."
          value={filters.search}
          onChange={(e) =>
            setFilters((p) => ({
              ...p,
              search: e.target.value,
              page: 1,
            }))
          }
          style={inputStyle}
          className="placeholder:text-gray-400 focus:outline-none"
        />

        <select
          value={filters.module}
          onChange={(e) =>
            setFilters((p) => ({
              ...p,
              module: e.target.value,
              page: 1,
            }))
          }
          style={inputStyle}
          className="p-2 rounded focus:outline-none"
        >
          <option value="all">All Modules</option>
          <option value="VEHICLE">Vehicle</option>
          <option value="USER">User</option>
          <option value="DRONE">Drone</option>
          <option value="INCIDENT">Incident</option>
        </select>

        <Input
          type="date"
          value={filters.date}
          onChange={(e) =>
            setFilters((p) => ({
              ...p,
              date: e.target.value,
              page: 1,
            }))
          }
          style={inputStyle}
          className="focus:outline-none"
        />

        <button
          onClick={() =>
            setFilters((p) => ({
              ...p,
              date: "",
              page: 1,
            }))
          }
          style={{
            border: `1px solid ${isDark ? "#2E2E2E" : "#e2e8f0"}`,
            color: isDark ? "#d1d5db" : "#000000",
            backgroundColor: "transparent",
          }}
          className="rounded hover:bg-red-600 hover:!text-white hover:!border-red-600 transition"
        >
          Clear Date
        </button>
      </CardContent>
    </Card>
  );
}