import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LogsFilters({ filters, setFilters }) {
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

      <CardContent className="grid md:grid-cols-5 gap-4">
        
        {/* 🔍 Search */}
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
        />

        {/* 📦 Module */}
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
          className="p-2 rounded"
        >
          <option value="all">All Modules</option>
          <option value="VEHICLE">Vehicle</option>
          <option value="USER">User</option>
          <option value="DRONE">Drone</option>
          <option value="INCIDENT">Incident</option>
        </select>

        {/* 👤 ROLE (FIXED) */}
        <select
          value={filters.role}
          onChange={(e) =>
            setFilters((p) => ({
              ...p,
              role: e.target.value,
              page: 1,
            }))
          }
          style={inputStyle}
          className="p-2 rounded"
        >
          <option value="all">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Pilot">Pilot</option>
          <option value="Vehicle Driver">Vehicle Driver</option>
          <option value="Fire Station Command Control">
            Fire Station Command Control
          </option>
        </select>

        {/* 📅 Date */}
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
        />

        {/* ❌ Clear */}
        <button
          onClick={() =>
            setFilters((p) => ({
              ...p,
              date: "",
              role: "all",
              module: "all",
              search: "",
              page: 1,
            }))
          }
          style={{
            border: `1px solid ${isDark ? "#2E2E2E" : "#e2e8f0"}`,
            color: isDark ? "#d1d5db" : "#000",
          }}
          className="rounded hover:bg-red-600 hover:text-white transition"
        >
          Clear All
        </button>
      </CardContent>
    </Card>
  );
}