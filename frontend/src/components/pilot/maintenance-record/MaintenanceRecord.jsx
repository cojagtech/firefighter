"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { CheckCircle, AlertCircle, Wrench, Calendar, Search, RefreshCw } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function MaintenanceRecord() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/pilot/get_maintenance_records.php`,
        { credentials: "include" }
      );
      const result = await res.json();
      if (result.success) setData(result.records);
    } catch {
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleComplete = async (item) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/pilot/complete_maintenance.php`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            drone_code: item.drone_code,
          }),
        }
      );

      const result = await res.json();

      if (result.success) {
        toast.success(
          "Maintenance completed and drone set back to Active"
        );

        setData((prev) =>
          prev.map((d) =>
            d.drone_code === item.drone_code
              ? { ...d, status: "completed" }
              : d
          )
        );

        window.dispatchEvent(new Event("new-notification"));
      } else {
        toast.error("Failed to complete maintenance");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search and status
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.drone_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.drone_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.issue_description.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filterStatus === "all") {
      matchesFilter = true;
    } else if (filterStatus === "completed") {
      matchesFilter = item.status === "completed";
    } else if (filterStatus === "pending") {
      matchesFilter = item.status !== "completed";
    }

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: data.length,
    pending: data.filter((d) => d.status !== "completed").length,
    completed: data.filter((d) => d.status === "completed").length,
  };

  // Color scheme
  const bgColor = isDark ? "#0f0f0f" : "#ffffff";
  const cardBgColor = isDark ? "#1a1a1a" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#111827";
  const secondaryTextColor = isDark ? "#a0aec0" : "#4b5563";
  const borderColor = isDark ? "#2A2A2A" : "#e2e8f0";
  const hoverBgColor = isDark ? "#252525" : "#f8f9fa";
  const inputBgColor = isDark ? "#121212" : "#ffffff";

  return (
    <div
      className="w-full px-10 py-8 flex justify-center"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="w-full max-w-7xl space-y-8">
        
        {/* Header Section */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: textColor }}>
              Maintenance Records
            </h1>
          </div>
          <p style={{ color: secondaryTextColor }} className="ml-11">
            Track and manage drone maintenance schedules
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Records */}
          <div
            className="rounded-lg border p-5 hover:shadow-md transition-all"
            style={{
              backgroundColor: cardBgColor,
              borderColor: borderColor,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: secondaryTextColor }} className="text-xs font-medium">
                  Total Records
                </p>
                <p className="text-2xl font-bold mt-2" style={{ color: textColor }}>
                  {stats.total}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Wrench className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div
            className="rounded-lg border p-5 hover:shadow-md transition-all"
            style={{
              backgroundColor: cardBgColor,
              borderColor: borderColor,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: secondaryTextColor }} className="text-xs font-medium">
                  Pending
                </p>
                <p className="text-2xl font-bold mt-2 text-orange-600">
                  {stats.pending}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/20">
                <AlertCircle className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Completed */}
          <div
            className="rounded-lg border p-5 hover:shadow-md transition-all"
            style={{
              backgroundColor: cardBgColor,
              borderColor: borderColor,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: secondaryTextColor }} className="text-xs font-medium">
                  Completed
                </p>
                <p className="text-2xl font-bold mt-2 text-green-600">
                  {stats.completed}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/20">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card
          className="border rounded-lg overflow-hidden"
          style={{
            backgroundColor: cardBgColor,
            borderColor: borderColor,
          }}
        >
          <CardHeader
            className="p-3"
            style={{
              backgroundColor: isDark ? "#121212" : "#f8f9fa",
              borderBottom: `1px solid ${borderColor}`,
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <CardTitle
                className="text-xl font-bold"
                style={{ color: textColor }}
              >
                All Maintenance Tasks
              </CardTitle>
              <Button
                onClick={fetchRecords}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white w-fit text-sm px-4"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            
            {/* Search and Filter Section */}
            <div className="mb-5 flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: secondaryTextColor }} />
                <input
                  type="text"
                  placeholder="Search by drone code, name, or issue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    backgroundColor: inputBgColor,
                    color: textColor,
                    borderColor: borderColor,
                  }}
                  className="w-full pl-10 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>

              <div className="flex gap-2">
                {["all", "completed", "pending"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className="px-4 py-2 rounded-md font-medium text-xs transition whitespace-nowrap"
                    style={{
                      backgroundColor:
                        filterStatus === status
                          ? "#dc2626"
                          : isDark ? "#2A2A2A" : "#e2e8f0",
                      color:
                        filterStatus === status
                          ? "#ffffff"
                          : textColor,
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Container with Fixed Scrollable Body */}
            <div 
              className="rounded-md border"
              style={{ 
                borderColor: borderColor,
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '600px'
              }}
            >
              {/* Scrollable wrapper */}
              <div 
                style={{
                  overflowX: 'auto',
                  overflowY: 'auto',
                  flex: 1
                }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: isDark ? "#121212" : "#f8f9fa",
                        borderBottom: `1px solid ${borderColor}`,
                        position: 'sticky',
                        top: 0,
                        zIndex: 10
                      }}
                    >
                      <th className="py-3 px-4 text-left font-semibold" style={{ color: textColor }}>
                        Drone Code
                      </th>
                      <th className="py-3 px-4 text-left font-semibold" style={{ color: textColor }}>
                        Drone Name
                      </th>
                      <th className="py-3 px-4 text-left font-semibold" style={{ color: textColor }}>
                        Issue
                      </th>
                      <th className="py-3 px-4 text-left font-semibold" style={{ color: textColor }}>
                        <div className="flex items-center gap-1.5">
                          Date of Maintenance
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left font-semibold" style={{ color: textColor }}>
                        Reported By
                      </th>
                      <th className="py-3 px-4 text-left font-semibold" style={{ color: textColor }}>
                        Scheduled At
                      </th>
                      <th className="py-3 px-4 text-left font-semibold" style={{ color: textColor }}>
                        Status
                      </th>
                      <th className="py-3 px-4 text-right font-semibold" style={{ color: textColor }}>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="8">
                          <div className="flex flex-col items-center justify-center py-10">
                            <Wrench className="w-10 h-10 mb-2" style={{ color: secondaryTextColor }} />
                            <p className="text-sm font-medium" style={{ color: secondaryTextColor }}>
                              {data.length === 0
                                ? "No maintenance records found"
                                : "No records match your filters"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item, index) => (
                        <tr
                          key={index}
                          style={{
                            borderBottom: `1px solid ${borderColor}`,
                          }}
                        >
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-[#dc2626] text-white dark:bg-red-900/30 dark:text-red-400 whitespace-nowrap">
                              {item.drone_code}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <p style={{ color: textColor }}>
                              {item.drone_name}
                            </p>
                          </td>

                          <td className="py-3 px-4">
                            <p style={{ color: textColor }} className="max-w-xs truncate">
                              {item.issue_description}
                            </p>
                          </td>

                          <td className="py-3 px-4">
                            <p style={{ color: textColor }}>
                              {item.scheduled_date}
                            </p>
                          </td>

                          <td className="py-3 px-4">
                            <p style={{ color: textColor }}>
                              {item.reported_by || "-"}
                            </p>
                          </td>

                          <td className="py-3 px-4">
                            <p style={{ color: textColor }}>
                              {item.created_at ? new Date(item.created_at).toLocaleString() : "-"}
                            </p>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor:
                                  item.status === "completed"
                                    ? isDark ? "#064e3b" : "#dcfce7"
                                    : isDark ? "#78350f" : "#fed7aa",
                                color:
                                  item.status === "completed"
                                    ? "#10b981"
                                    : "#d97706",
                              }}
                            >
                              {item.status === "completed" ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3 h-3" />
                                  Pending
                                </>
                              )}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <Button
                              disabled={item.status === "completed" || loading}
                              onClick={() => handleComplete(item)}
                              className="px-3 py-1.5 rounded-md font-medium text-xs transition text-white"
                              style={{
                                backgroundColor:
                                  item.status === "completed"
                                    ? isDark ? "#404040" : "#d1d5db"
                                    : "#16a34a",
                                cursor: item.status === "completed" ? "not-allowed" : "pointer",
                              }}
                            >
                              {item.status === "completed"
                                ? "Completed"
                                : "Mark Complete"}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Info */}
            {filteredData.length > 0 && (
              <div
                className="mt-4 pt-4 text-xs"
                style={{
                  borderTop: `1px solid ${borderColor}`,
                  color: secondaryTextColor,
                }}
              >
                Showing {filteredData.length} of {data.length} records
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}