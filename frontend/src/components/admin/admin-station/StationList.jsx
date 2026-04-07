import { useEffect, useState, useCallback } from "react";
import StationCard from "./StationCard";
import { toast } from "react-hot-toast";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/admin/station`;

export default function StationList({
  filters,
  onViewMap = () => {},
  onEditStation = () => {},
  refreshTrigger,
}) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmStation, setConfirmStation] = useState(null);

  const fetchStations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API}/get_stations.php?search=${encodeURIComponent(filters.search || "")}`
      );
      if (!res.ok) throw new Error("Network response not ok");
      const data = await res.json();
      if (data.status) {
        setStations(data.stations || []);
      } else {
        toast.error("Failed to load stations");
      }
    } catch (err) {
      console.error("Fetch stations error:", err);
      toast.error("Server error while fetching stations");
    } finally {
      setLoading(false);
    }
  }, [filters.search]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations, refreshTrigger]);

  const handleDeleteConfirmed = async () => {
    const station = confirmStation;
    setConfirmStation(null);
    setDeletingId(station.id);

    try {
      const res = await fetch(`${API}/delete_station.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: station.id }),
      });

      const data = await res.json();

      if (data?.success) {
        setStations((prev) => prev.filter((s) => s.id !== station.id));
        toast.success(data.message || "Station deleted successfully");
      } else {
        toast.error(data?.message || "Failed to delete station");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while deleting station");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p className="text-gray-400">Loading stations...</p>;
  if (stations.length === 0) return <p className="text-gray-500">No stations found</p>;

  return (
    <>
      <div className="space-y-6">
        {stations.map((station) => (
          <StationCard
            key={station.id}
            station={station}
            onViewMap={onViewMap}
            onEditStation={onEditStation}
            onDeleteStation={() => setConfirmStation(station)}
            isDeleting={deletingId === station.id}
          />
        ))}
      </div>

      <ConfirmDeleteDialog
        open={!!confirmStation}
        title="Delete Station"
        description="Are you sure you want to delete"
        itemName={confirmStation?.name}
        itemSub={confirmStation?.code}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmStation(null)}
      />
    </>
  );
}