import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/pilot`;

export default function SelectDrone({ selectedDrone, setSelectedDrone }) {
  const [drones, setDrones] = useState([]);

  useEffect(() => {
    const fetchDrones = async () => {
      try {
        const res = await fetch(`${API}/get_station_drones.php`, {
          credentials: "include",
        });

        const data = await res.json();

        if (data.success && data.drones.length > 0) {
          setDrones(data.drones);

          // ✅ auto-select first drone only if none selected
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
      <label className="text-md font-medium text-muted-foreground mb-2 block">
        Select Drone :
      </label>

      <div className="relative">
        <select
          value={selectedDrone?.id || ""}
          onChange={(e) => {
            const drone = drones.find(
              (d) => d.id === Number(e.target.value)
            );
            setSelectedDrone(drone);
          }}
          className="
            w-full
            appearance-none
            bg-[#121212]
            border border-[#2A2A2A]
            rounded-md
            px-3 py-2
            pr-8
            text-sm
            text-white
            focus:outline-none
            focus:border-[#3A3A3A]
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
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
}