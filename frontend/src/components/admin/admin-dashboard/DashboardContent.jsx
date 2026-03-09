import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { toast } from "react-hot-toast";
import DashboardMapSection from "./DashboardMapSection";
import DashboardSummaryCard from "./DashboardSummaryCard";
import QuickAccessLinks from "./QuickAccessLinks";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/admin/admin-dashboard`;

const MemoDashboardMap = memo(DashboardMapSection);

export default function DashboardContent() {
  const [stats, setStats] = useState({
    total_drones: 0,
    inactive_drones: 0,
    ready_drones: 0,
    standby: 0,
  });

  const [activeDrones, setActiveDrones] = useState([]);
  const [droneLocations, setDroneLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState("2d");


  const loadStats = useCallback(async (isAuto = false) => {
    try {
      const res = await fetch(`${API}/dashboard_stats.php`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      if (!isAuto) toast.error("Failed to load dashboard stats");
    }
  }, []);

  const loadActiveDrones = useCallback(async (isAuto = false) => {
    try {
      const res = await fetch(`${API}/active_drones.php`);
      const data = await res.json();
      setActiveDrones(data);
    } catch (err) {
      if (!isAuto) toast.error("Failed to load active drones");
    }
  }, []);

  const loadDroneLocations = useCallback(async (isAuto = false) => {
    try {
      const res = await fetch(`${API}/get_drone_locations.php`);
      const data = await res.json();
      setDroneLocations(data);
    } catch (err) {
      if (!isAuto) toast.error("Failed to load GPS locations");
    }
  }, []);


  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        loadStats(false),
        loadActiveDrones(false),
        loadDroneLocations(false),
      ]);
      setLoading(false);
    };

    init();
  }, [loadStats, loadActiveDrones, loadDroneLocations]);


  useEffect(() => {
    const statsInterval = setInterval(() => loadStats(true), 15000); // slow
    const dronesInterval = setInterval(() => loadActiveDrones(true), 8000);

    const gpsInterval = setInterval(() => {
      if (mapMode === "2d") {
        loadDroneLocations(true);
      }
    }, 6000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(dronesInterval);
      clearInterval(gpsInterval);
    };
  }, [mapMode, loadStats, loadActiveDrones, loadDroneLocations]);


  const memoDroneLocations = useMemo(
    () => droneLocations,
    [JSON.stringify(droneLocations)]
  );

  const summaryCardsData = useMemo(
    () => [
      {
        id: "total",
        title: "Total Drones",
        value: stats.total_drones,
        description: "Operational drones",
        color: "green",
      },
      {
        id: "ready",
        title: "Active",
        value: stats.ready_drones,
        description: "Ready for deployment",
        color: "green",
      },
      {
        id: "standby",
        title: "StandBy",
        value: stats.standby,
        description: "Spare Drone",
        color: "green",
      },
      {
        id: "inactive",
        title: "Maintenance ",
        value: stats.inactive_drones,
        description: "Need attention",
        color: "red",
      },
    ],
    [stats]
  );


  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCardsData.map((card) => (
          <DashboardSummaryCard key={card.id} card={card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 border border-[#2E2E2E] rounded-xl">
          <MemoDashboardMap
            mapMode={mapMode}
            setMapMode={setMapMode}
            activeDrones={activeDrones}
            droneLocations={memoDroneLocations}
          />
        </div>

        <div className="lg:col-span-1 rounded-xl p-6 border border-[#2E2E2E] h-fit">
          <QuickAccessLinks />
        </div>
      </div>
    </div>
  );
}
