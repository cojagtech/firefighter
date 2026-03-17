import { useState, useEffect } from "react";

export default function StationFilters({ filters, setFilters }) {
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

  return (
    <div
      className="rounded-xl p-6 mb-8"
      style={{
        backgroundColor: isDark ? "#111418" : "#ffffff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`,
      }}
    >
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: isDark ? "#ffffff" : "#000000" }}
      >
        Filters & Search
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label
            className="block text-sm mb-1"
            style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" }}
          >
            Search
          </label>
          <div className="relative">
            <input
              placeholder="Search by station name, code, city"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              style={{
                backgroundColor: isDark ? "#000000" : "#f8fafc",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "#e2e8f0"}`,
                color: isDark ? "#ffffff" : "#000000",
              }}
              className="w-full rounded-lg pl-10 py-2 focus:outline-none focus:border-red-500 placeholder:text-gray-400"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        {/* <div>
          <label className="block text-sm mb-1">Status</label>
          <select
            className="w-full bg-black border border-white/20 rounded-lg py-2 px-3"
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
          >
            <option value="all">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div> */}

        {/* <div>
          <label className="block text-sm mb-1">City</label>
          <select
            className="w-full bg-black border border-white/20 rounded-lg py-2 px-3"
            value={filters.city}
            onChange={(e) =>
              setFilters({ ...filters, city: e.target.value })
            }
          >
            <option>All</option>
            <option>Nagpur</option>
            <option>Pune</option>
          </select>
        </div> */}
      </div>
    </div>
  );
}