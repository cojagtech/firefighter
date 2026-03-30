"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/common/StatusBadge";
import DroneMonitoringMap from "./DroneMonitoringMap";
import DroneListTable from "./DroneListTable";
import DroneMonitoringHeader from "./DroneMonitoringHeader";
import { toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/admin/admin-drone-monitoring`;

export default function DroneMonitoringContent() {
  const [viewMode, setViewMode] = useState("map");
  const [drones, setDrones] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState("all");

  const [stationOpen, setStationOpen] = useState(false);
  const [stationSearch, setStationSearch] = useState("");
  const dropdownRef = useRef(null);

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

  const dropdownBg = isDark ? "#141414" : "#ffffff";
  const dropdownColor = isDark ? "#ffffff" : "#000000";
  const dropdownStyle = { backgroundColor: dropdownBg, color: dropdownColor };

  const loadDrones = useCallback(async (isAutoRefresh = false) => {
    try {
      const res = await fetch(`${API}/get_drone_locations.php`);
      if (!res.ok) throw new Error("Failed to fetch drones");
      const data = await res.json();
      setDrones(data);
    } catch (err) {
      console.error(err);
      if (!isAutoRefresh) toast.error("Failed to load drone fleet data");
    }
  }, []);

  const loadStations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/getStations.php`);
      if (!res.ok) throw new Error("Failed to fetch stations");
      const data = await res.json();
      setStations(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load stations list");
    }
  }, []);

  useEffect(() => {
    const initData = async () => {
      await Promise.all([loadDrones(false), loadStations()]);
    };
    initData();
    const interval = setInterval(() => {
      loadDrones(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [loadDrones, loadStations]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setStationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizeStatus = (status) => {
    if (!status) return "unknown";
    const s = status.toLowerCase();
    if (["active", "patrolling", "active_mission"].includes(s)) return "active";
    if (["offline", "maintenance"].includes(s)) return "maintenance";
    if (s === "standby") return "standby";
    return "unknown";
  };

  const filteredStations = stations.filter((st) =>
    st.toLowerCase().includes(stationSearch.toLowerCase())
  );

  const filteredDrones =
    selectedStation === "all"
      ? drones
      : drones.filter((d) => d.station === selectedStation);

  const activeDrones = filteredDrones.filter(
    (d) => normalizeStatus(d.status) === "active"
  );

  const maintenanceDrones = filteredDrones.filter(
    (d) => normalizeStatus(d.status) === "maintenance"
  );

  const standbyDrones = filteredDrones.filter(
    (d) => normalizeStatus(d.status) === "standby"
  );

  const getUIStatus = (status) => {
    const s = normalizeStatus(status);
    return s === "active"
      ? "available"
      : s === "maintenance"
      ? "maintenance"
      : s === "standby"
      ? "warning"
      : "unknown";
  };

  const prettyLabel = (text = "") =>
    text.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const tabs = [
    { value: "all", label: `All (${filteredDrones.length})`, drones: filteredDrones },
    { value: "active", label: `Active (${activeDrones.length})`, drones: activeDrones },
    { value: "maintenance", label: `Maintenance (${maintenanceDrones.length})`, drones: maintenanceDrones },
    { value: "standby", label: `Standby (${standbyDrones.length})`, drones: standbyDrones },
  ];

  return (
    <div className="space-y-6 p-6">

      {/* Station Dropdown */}
      <div className="flex justify-start">
        <div className="w-64 relative" ref={dropdownRef}>
          <label className="text-sm font-medium text-foreground">Station</label>

          <div
            onClick={() => setStationOpen(!stationOpen)}
            className="w-full p-2 rounded border border-border cursor-pointer flex justify-between items-center bg-background text-foreground"
          >
            <span>
              {selectedStation === "all" ? "All Stations" : selectedStation}
            </span>
            <span className="text-muted-foreground text-xs">▼</span>
          </div>

          {stationOpen && (
            <div
              className="absolute z-50 mt-1 w-full border rounded shadow-lg"
              style={dropdownStyle}
            >
              <input
                type="text"
                placeholder="Search station..."
                value={stationSearch}
                onChange={(e) => setStationSearch(e.target.value)}
                style={dropdownStyle}
                className="w-full px-3 py-2 border-b border-border outline-none rounded-t placeholder:text-gray-400"
              />

              <div className="max-h-40 overflow-y-auto custom-scrollbar">
                <div
                  onClick={() => {
                    setSelectedStation("all");
                    setStationOpen(false);
                    setStationSearch("");
                  }}
                  style={dropdownStyle}
                  className="px-4 py-2 cursor-pointer hover:opacity-75"
                >
                  All Stations
                </div>

                {filteredStations.map((station, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedStation(station);
                      setStationOpen(false);
                      setStationSearch("");
                    }}
                    style={dropdownStyle}
                    className="px-4 py-2 cursor-pointer hover:opacity-75"
                  >
                    {station}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <DroneMonitoringHeader
        totalDrones={filteredDrones.length}
        activeDrones={activeDrones.length}
        maintenanceDrones={maintenanceDrones.length}
        standbyDrones={standbyDrones.length}
      />

      {/* Map + Status Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-border">
            <CardContent>
              {viewMode === "map" ? (
                <DroneMonitoringMap drones={filteredDrones} />
              ) : (
                <DroneListTable
                  drones={filteredDrones}
                  getUIStatus={getUIStatus}
                  prettyLabel={prettyLabel}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fleet Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-foreground">Total</span>
                <Badge>{filteredDrones.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">Active</span>
                <StatusBadge
                  status="available"
                  label={activeDrones.length.toString()}
                  showIcon={false}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">Maintenance</span>
                <StatusBadge
                  status="maintenance"
                  label={maintenanceDrones.length.toString()}
                  showIcon={false}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">Standby</span>
                <StatusBadge
                  status="warning"
                  label={standbyDrones.length.toString()}
                  showIcon={false}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <CardTitle>Drone Fleet Details</CardTitle>
          <CardDescription>Station-wise drone monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList
              className="grid grid-cols-4"
              style={{ backgroundColor: isDark ? "#1a1a1a" : "#f3f4f6" }}
            >
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                  className="data-[state=active]:!bg-red-500 data-[state=active]:!text-white data-[state=active]:!shadow-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <DroneListTable
                  drones={tab.drones}
                  getUIStatus={getUIStatus}
                  prettyLabel={prettyLabel}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

    </div>
  );
}