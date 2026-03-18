"use client";

import { useState, useEffect } from "react";
import SelectDroneDropDown from "../pilot-dashboard/SelectDroneDropdown";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ScheduleMaintenance() {
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [maintenanceDate, setMaintenanceDate] = useState("");
  const [issue, setIssue] = useState("");
  const [loading, setLoading] = useState(false);

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

  // ✅ Backend unchanged
  const handleSubmit = async () => {
    if (!selectedDrone || !maintenanceDate || !issue.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/pilot/schedule_maintenance.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drone_code: selectedDrone.drone_code,
          drone_name: selectedDrone.drone_name,
          scheduled_date: maintenanceDate,
          issue_description: issue,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Maintenance scheduled successfully");
        setSelectedDrone(null);
        setMaintenanceDate("");
        setIssue("");
      } else {
        toast.error(data.message || "Failed to schedule maintenance");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: isDark ? "#121212" : "#ffffff",
    color: isDark ? "#ffffff" : "#111827",
    border: `1px solid ${isDark ? "#2A2A2A" : "#e2e8f0"}`,
  };

  const labelStyle = {
    color: isDark ? "#ffffff" : "#111827",
  };

  return (
    <div
      className="w-full px-10 py-8 flex justify-center"
      style={{ color: isDark ? "#ffffff" : "#111827" }}
    >
      <div className="w-full max-w-5xl space-y-8">

        {/* Page Heading */}
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: isDark ? "#ffffff" : "#111827" }}
          >
            Schedule Maintenance
          </h1>
          <p className="text-muted-foreground">
            Report drone issues and schedule maintenance for inspection or repair.
          </p>
        </div>

        {/* Form Section */}
        <Card className="border-none shadow-none bg-transparent">
  <CardContent className="px-0 space-y-7">

            <SelectDroneDropDown
              selectedDrone={selectedDrone}
              setSelectedDrone={setSelectedDrone}
            />

            {/* Date */}
            <div>
              <label
                className="text-base font-medium mb-2 block"
                style={labelStyle}
              >
                Maintenance Date :
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={maintenanceDate}
                onChange={(e) => setMaintenanceDate(e.target.value)}
                style={inputStyle}
                className="w-full rounded-md px-4 py-3 text-base focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Issue */}
            <div>
              <label
                className="text-base font-medium mb-2 block"
                style={labelStyle}
              >
                Issue / Fault Description :
              </label>
              <Textarea
                rows={5}
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Describe the issue observed in the drone..."
                style={inputStyle}
                className="w-full rounded-md px-4 py-3 text-base focus:outline-none focus:ring-1 focus:ring-red-500 placeholder:text-gray-400"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-base font-medium"
              >
                {loading ? "Scheduling..." : "Schedule Maintenance"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}