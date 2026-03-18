import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/pilot`;

export default function SelectDrone({ selectedDrone, setSelectedDrone }) {
  const [drones, setDrones] = useState([]);

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
  useEffect(() => {
    const fetchDrones = async () => {
      try {
        const res = await fetch(`${API}/get_station_drones.php`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.drones.length > 0) {
          setDrones(data.drones);
          setSelectedDrone((prev) => prev || data.drones[0]);
        }
      } catch (err) {
        console.error("Failed to fetch drones", err);
      }
    };

    fetchDrones();
  }, [setSelectedDrone]);

  return (
    <div className="flex flex-col gap-1 w-[200px]">
      <label
        className="text-md font-medium mb-2 block"
        style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
      >
        Select Drone :
      </label>

      <div className="relative">
        <select
          value={selectedDrone?.id || ""}
          onChange={(e) => {
            const drone = drones.find((d) => d.id === Number(e.target.value));
            setSelectedDrone(drone);
          }}
          style={{
            backgroundColor: isDark ? "#121212" : "#ffffff",
            color: isDark ? "#ffffff" : "#111827",
            border: `1px solid ${isDark ? "#2A2A2A" : "#e2e8f0"}`,
          }}
          className="
            w-full
            appearance-none
            rounded-md
            px-3 py-2
            pr-8
            text-sm
            focus:outline-none
          "
        >
          {drones.map((drone) => (
            <option key={drone.id} value={drone.id}>
              {drone.drone_name}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
        />
      </div>
    </div>
  );
}