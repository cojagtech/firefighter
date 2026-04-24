import { useState, useRef, useEffect } from "react";
import StatsCards from "./StatsCards";
import StationsMap from "./StationsMap";
import AddStationModal from "./AddStationModal";
import StationFilters from "./StationFilters";
import StationList from "./StationList";
import { Button } from "@/components/ui/button";
import SafeIcon from "@/components/common/SafeIcon";

export default function StationManagement() {
  const [open, setOpen] = useState(false);
  const [editStation, setEditStation] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    city: "All",
  });

  const mapRef = useRef(null);

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

  const handleViewOnMap = (station) => {
    setSelectedStation(station);
    setTimeout(() => {
      mapRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <div
      className="p-6 min-h-screen"
      style={{
        backgroundColor: isDark ? "#0b0e11" : "rgb(243 244 246)",
        color: isDark ? "#ffffff" : "#000000",
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>
            Station Management
          </h1>
          <p style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }}>
            Manage & monitor stations
          </p>
        </div>

        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className="gap-2 active:scale-98"
        >
          <SafeIcon name="Plus" size={18} /> Add New Station
        </Button>

      </div>

      <div ref={mapRef} className="mt-6">
        <StationsMap selectedStation={selectedStation} />
      </div>

      <div className="mt-8">
        <StationFilters filters={filters} setFilters={setFilters} />
      </div>

      <div className="mt-6">
        <StationList
          filters={filters}
          onViewMap={handleViewOnMap}
          onEditStation={setEditStation}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {open && (
        <AddStationModal
          onClose={() => {
            setOpen(false);
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      )}

      {editStation && (
        <AddStationModal
          stationData={editStation}
          onClose={() => {
            setEditStation(null);
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      )}
    </div>
  );
}