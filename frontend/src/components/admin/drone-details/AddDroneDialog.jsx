import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { FiSearch } from "react-icons/fi";

const API_ENDPOINT = `${import.meta.env.VITE_API_BASE_URL}/admin/admin-drone-details/addDrone.php`;

const INITIAL_DRONE = {
  drone_code: "",
  drone_name: "",
  status: "standby",
  flight_hours: 0,
  health_status: "Optimal",
  firmware_version: "",
  is_ready: 1,
  station: "",
};

export default function AddDroneDialog({ open, onOpenChange, stations, onSuccess }) {
  const [drone, setDrone] = useState(INITIAL_DRONE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [stationOpen, setStationOpen] = useState(false);
  const [stationSearch, setStationSearch] = useState("");
  const [stationSearchMode, setStationSearchMode] = useState(false);

  useEffect(() => {
    const close = () => {
      setStationOpen(false);
      setStationSearch("");
      setStationSearchMode(false);
    };

    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const filteredStations = stationSearchMode
  ? stations.filter((s) =>
      s.name.toLowerCase().includes(stationSearch.toLowerCase())
    )
  : stations;

  const isFormValid =
    drone.drone_code &&
    drone.drone_name &&
    drone.station &&
    drone.firmware_version;

  const updateField = (field, value) => {
    setDrone((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(drone).forEach(([key, value]) =>
        formData.append(key, value)
      );

      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await res.json();

      if (res.status === 409) {
        toast.error(result.message || "Drone code already exists");
        return;
      }

      if (!res.ok || !result.success) {
        toast.error(result.message || "Failed to add drone");
        return;
      }

      toast.success("Drone added successfully");
      setDrone(INITIAL_DRONE);
      onOpenChange(false);
      onSuccess();

    } catch (error) {
      toast.error("Server error");
    } finally {
      setIsSubmitting(false);
    }
  }, [drone, isFormValid, onOpenChange, onSuccess]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#0D0F12] border border-[#2E2E2E] text-[#FAFAFA]">
        <DialogHeader>
          <DialogTitle>Add New Drone</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <InputField
            label="Drone Code"
            value={drone.drone_code}
            placeholder="DR-001"
            onChange={(v) => updateField("drone_code", v)}
          />

          <InputField
            label="Drone Name"
            value={drone.drone_name}
            placeholder="Phantom X"
            onChange={(v) => updateField("drone_name", v)}
          />

          <InputField
            label="Flight Hours"
            type="number"
            value={drone.flight_hours}
            onChange={(v) => {
            const num = Number(v);
            
            if (num > 100) {
            toast.error("Flight hours cannot exceed 100");
            return;
            }

            updateField("flight_hours", num);
            }}
            />


          <InputField
            label="Firmware"
            value={drone.firmware_version}
            placeholder="v1.0.0"
            onChange={(v) => updateField("firmware_version", v)}
          />

          <SelectField
            label="Status"
            value={drone.status}
            options={["Active", "StandBy", "Maintenance"]}
            onChange={(v) => updateField("status", v)}
          />

          <SelectField
            label="Health Status"
            value={drone.health_status}
            options={["Optimal", "Degraded", "Require Service"]}
            onChange={(v) => updateField("health_status", v)}
          />

          <SelectField
            label="Is Ready"
            value={drone.is_ready ? "Yes" : "No"}
            options={["Yes", "No"]}
            onChange={(v) => updateField("is_ready", v === "Yes" ? 1 : 0)}
          />

          {/* STATION FIELD (SEARCHABLE) */}
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <label className="text-sm text-muted-foreground">Station</label>

            {/* Trigger */}
            <div
              onClick={() => setStationOpen((p) => !p)}
              className="w-full mt-1 h-9 flex items-center px-3 rounded-md
                        bg-[#0D0F12] border border-[#2E2E2E]
                        cursor-pointer"
            >
              {/* Value / Search */}
              <div className="flex-1">
                {stationSearchMode ? (
                  <input
                    autoFocus
                    value={stationSearch}
                    onChange={(e) => setStationSearch(e.target.value)}
                    placeholder="Search station..."
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent text-sm text-[#FAFAFA]
                              outline-none w-full"
                  />
                ) : (
                  <span className="text-sm text-[#FAFAFA] truncate">
                    {drone.station || "Select Station"}
                  </span>
                )}
              </div>

              {/* Search Icon */}
              <FiSearch
                size={16}
                className="ml-2 text-muted-foreground hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setStationSearchMode(true);
                  setStationOpen(true);
                }}
              />
            </div>

            {/* Dropdown */}
            {stationOpen && (
              <div
                className="absolute z-50 mt-1 w-full rounded-md
                          bg-[#0D0F12] border border-[#2E2E2E]
                          shadow-lg
                          max-h-[100px] overflow-y-auto
                          dark-scrollbar"
              >
                {filteredStations.length ? (
                  filteredStations.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        updateField("station", s.name);
                        setStationOpen(false);
                        setStationSearch("");
                        setStationSearchMode(false);
                      }}
                      className={`px-3 py-2 text-sm cursor-pointer
                        hover:bg-[#1A1D23]
                        ${drone.station === s.name ? "bg-[#1A1D23]" : ""}`}
                    >
                      {s.name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No stations found
                  </div>
                )}
              </div>
            )}
          </div>


        </div>

        <Button
          disabled={!isFormValid || isSubmitting}
          className="w-full bg-[#dc2626] hover:bg-[#b81f1f]"
          onClick={handleSubmit}
        >
          {isSubmitting ? "Saving..." : "Save Drone"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label className="text-sm text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 h-9 rounded-md bg-[#0D0F12] border border-[#2E2E2E] px-3 focus:outline-none focus:border-[#dc2626]"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  getOptionValue,
  getOptionLabel,
}) {
  return (
    <div>
      <label className="text-sm text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 h-9 rounded-md bg-[#0D0F12] border border-[#2E2E2E] px-3"
      >
        <option value="">Select {label}</option>

        {options.map((option) => {
          const optionValue = getOptionValue
            ? getOptionValue(option)
            : option;

          const optionLabel = getOptionLabel
            ? getOptionLabel(option)
            : option;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}


