"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FiSearch } from "react-icons/fi";

import DroneHeader from "./DroneHeader";
import QuickStats from "./QuickStats";
import OverviewTab from "./OverviewTab";
import HistoryTab from "./HistoryTab";
import MaintenanceTab from "./MaintenanceTab";
import AddDroneDialog from "./AddDroneDialog";
import EditDroneDialog from "./EditDroneDialog";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/admin/admin-drone-details`;

const LAST_STATION_KEY = "last_selected_station";
const LAST_DRONE_KEY_PREFIX = "last_selected_drone_";
const getDroneKey = (station) => `${LAST_DRONE_KEY_PREFIX}${station}`;

export default function DroneDetailsContent() {

  const [stations, setStations] = useState([]);
  const [drones, setDrones] = useState([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [stationOpen, setStationOpen] = useState(false);
  const [droneOpen, setDroneOpen] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [stationSearch, setStationSearch] = useState("");

  const stationRef = useRef(null);
  const droneRef = useRef(null);

  // ── Theme observer (same pattern as DroneMonitoringContent) ──────────────
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

  const dropdownBg    = isDark ? "#141414" : "#ffffff";
  const dropdownColor = isDark ? "#ffffff" : "#000000";
  const dropdownStyle = { backgroundColor: dropdownBg, color: dropdownColor };
  const hoverClass    = isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100";
  const activeClass   = isDark ? "bg-zinc-800 font-medium" : "bg-gray-100 font-medium";
  // ─────────────────────────────────────────────────────────────────────────

  const filteredStations = searchMode
    ? stations.filter((s) =>
        s.name.toLowerCase().includes(stationSearch.toLowerCase())
      )
    : stations;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stationRef.current && !stationRef.current.contains(e.target)) {
        setStationOpen(false);
        setSearchMode(false);
        setStationSearch("");
      }
      if (droneRef.current && !droneRef.current.contains(e.target)) {
        setDroneOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/admin/station/get_stations.php`)
      .then((res) => res.json())
      .then((data) => {
        const stationList = Array.isArray(data) ? data : data.stations || [];
        if (!stationList.length) return;

        setStations(stationList);

        const lastStation = localStorage.getItem(LAST_STATION_KEY);
        const stationToSelect = stationList.find((s) => s.name === lastStation)
          ? lastStation
          : stationList[0].name;

        setSelectedStation(stationToSelect);
        fetchDronesByStation(stationToSelect);
      });
  }, []);

  const fetchDronesByStation = (stationName) => {
    fetch(`${API}/getDronesByStation.php?station=${stationName}`)
      .then((res) => res.json())
      .then((data) => {
        setDrones(data || []);

        if (!data?.length) {
          setSelectedDrone(null);
          return;
        }

        const lastDrone = localStorage.getItem(getDroneKey(stationName));
        const droneToSelect = data.find((d) => d.drone_code === lastDrone)
          ? lastDrone
          : data[0].drone_code;

        fetchDroneDetails(droneToSelect, stationName);
      });
  };

  const fetchDroneDetails = (code, station = selectedStation) => {
    fetch(`${API}/getDroneDetails.php?drone_code=${code}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === false) return;

        setSelectedDrone(data);

        if (station && data.drone_code) {
          localStorage.setItem(getDroneKey(station), data.drone_code);
        }
      });
  };

  return (
    <div className="space-y-6 p-6">

      {/* Station + Drone Select */}
      <div className="flex gap-6 items-end">

        {/* ── Station Dropdown ─────────────────────────────────────── */}
        <div className="relative w-60" ref={stationRef}>

          <label className="text-md font-medium text-muted-foreground mb-2 block">
            Select Station:
          </label>

          <div
            onClick={() => setStationOpen((p) => !p)}
            className="h-9 w-full flex items-center px-3 rounded-md
                       bg-background border border-border cursor-pointer"
          >
            <div className="flex-1">
              {searchMode ? (
                <input
                  autoFocus
                  value={stationSearch}
                  onChange={(e) => setStationSearch(e.target.value)}
                  placeholder="Search station..."
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent text-sm text-foreground outline-none w-full"
                />
              ) : (
                <span className="text-sm text-foreground truncate">
                  {selectedStation || "Select station"}
                </span>
              )}
            </div>

            <FiSearch
              size={16}
              className="text-muted-foreground hover:text-foreground ml-2"
              onClick={(e) => {
                e.stopPropagation();
                setSearchMode(true);
                setStationOpen(true);
              }}
            />
          </div>

          {stationOpen && (
            <div
              className="absolute z-50 mt-1 w-full rounded-md border border-[#292C30] shadow-lg max-h-[150px] overflow-y-auto"
              style={dropdownStyle}
            >
              {filteredStations.length ? (
                filteredStations.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedStation(s.name);
                      fetchDronesByStation(s.name);
                      localStorage.setItem(LAST_STATION_KEY, s.name);
                      setStationOpen(false);
                      setSearchMode(false);
                      setStationSearch("");
                    }}
                    style={dropdownStyle}
                    className={`px-3 py-2 text-sm cursor-pointer hover:opacity-75
                      ${selectedStation === s.name ? activeClass : ""}`}
                  >
                    {s.name}
                  </div>
                ))
              ) : (
                <div
                  style={dropdownStyle}
                  className="px-3 py-2 text-sm opacity-60"
                >
                  No stations found
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Drone Dropdown ───────────────────────────────────────── */}
        <div className="relative w-50" ref={droneRef}>

          <label className="text-md font-medium text-muted-foreground mb-2 block">
            Select Drone:
          </label>

          <div
            onClick={() => setDroneOpen((p) => !p)}
            className="h-9 w-full flex items-center justify-between px-3 rounded-md
                       bg-background border border-border cursor-pointer"
          >
            <span className="text-sm text-foreground truncate">
              {drones.find((d) => d.drone_code === selectedDrone?.drone_code)
                ?.drone_name || "Select drone"}
            </span>
            <span className="text-muted-foreground text-xs ml-2">▼</span>
          </div>

          {droneOpen && (
            <div
              className="absolute z-50 mt-1 w-full rounded-md border border-[#292C30] shadow-lg max-h-[150px] overflow-y-auto"
              style={dropdownStyle}
            >
              {drones.length ? (
                drones.map((d) => (
                  <div
                    key={d.drone_code}
                    onClick={() => {
                      fetchDroneDetails(d.drone_code);
                      setDroneOpen(false);
                    }}
                    style={dropdownStyle}
                    className={`px-3 py-2 text-sm cursor-pointer hover:opacity-75
                      ${selectedDrone?.drone_code === d.drone_code ? activeClass : ""}`}
                  >
                    {d.drone_name}
                  </div>
                ))
              ) : (
                <div
                  style={dropdownStyle}
                  className="px-3 py-2 text-sm opacity-60"
                >
                  No drones found
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Header */}
      <DroneHeader selectedDrone={selectedDrone} />

      <QuickStats selectedDrone={selectedDrone} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

        <TabsList className="grid grid-cols-3 w-full bg-muted p-1 rounded-md">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
          >
            Flight History
          </TabsTrigger>
          <TabsTrigger
            value="maintenance"
            className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
          >
            Maintenance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab
            selectedDrone={selectedDrone}
            refreshDrone={() => fetchDroneDetails(selectedDrone?.drone_code)}
          />
        </TabsContent>

        <TabsContent value="history">
          <HistoryTab />
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceTab selectedDrone={selectedDrone} />
        </TabsContent>

      </Tabs>

      <AddDroneDialog />
      <EditDroneDialog />

    </div>
  );
}