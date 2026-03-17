import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { toast } from "react-hot-toast";

function RecenterMap({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], 14);
    setTimeout(() => map.invalidateSize(), 200);
  }, [lat, lng, map]);

  return null;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/admin/station`;

export default function AddStationModal({ onClose, stationData }) {
  const isEditMode = !!stationData;

  const [stationName, setStationName] = useState("");
  const [code, setCode] = useState("");
  const [lat, setLat] = useState(18.5064749);
  const [lng, setLng] = useState(73.868444);
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

  useEffect(() => {
    if (stationData) {
      setStationName(stationData.name);
      setCode(stationData.code);
      setLat(parseFloat(stationData.lat));
      setLng(parseFloat(stationData.lng));
    }
  }, [stationData]);

  const searchLocation = async (name) => {
    if (!name || name.length < 2) return;
    try {
      const res = await fetch(
        `${API}/pune_fire_stations.php?q=${encodeURIComponent(name)}`
      );
      const data = await res.json();
      if (data.length > 0) {
        setLat(parseFloat(data[0].lat));
        setLng(parseFloat(data[0].lng));
      }
    } catch (err) {
      console.error(err);
      toast.error("Station search failed");
    }
  };

  const handleSave = async () => {
    if (!stationName || !code) {
      toast.error("Station name and code required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        stationName,
        code,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      };
      if (stationData?.id) {
        payload.id = stationData.id;
      }
      const res = await fetch(
        `${API}/${stationData ? "update_station.php" : "add_station.php"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.status) {
        toast.success(stationData ? "Station updated" : "Station added");
        onClose();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  // Theme-aware styles
  const modalBg = isDark ? "#0f1114" : "#ffffff";
  const inputBg = isDark ? "#1a1d21" : "#f8fafc";
  const inputReadonlyBg = isDark ? "#111317" : "#f1f5f9";
  const borderColor = isDark ? "#374151" : "#e2e8f0";
  const textColor = isDark ? "#ffffff" : "#000000";
  const mutedColor = isDark ? "#9ca3af" : "#6b7280";

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[9999]">
      <div
        className="w-[95%] max-w-5xl rounded-2xl p-6 shadow-2xl relative z-[10000]"
        style={{
          backgroundColor: modalBg,
          border: `1px solid ${borderColor}`,
          color: textColor,
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold" style={{ color: textColor }}>
            {isEditMode ? "Edit Station" : "Add Station"}
          </h2>
          <button
            onClick={onClose}
            style={{ color: mutedColor }}
            className="text-xl hover:text-red-500 transition"
          >
            ✕
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            placeholder="Station Name"
            value={stationName}
            onChange={(e) => {
              const value = e.target.value;
              setStationName(value);
              searchLocation(value);
            }}
            style={{
              backgroundColor: inputBg,
              border: `1px solid ${borderColor}`,
              color: textColor,
            }}
            className="p-3 rounded-lg focus:outline-none focus:border-red-500 placeholder:text-gray-400"
          />

          <input
            placeholder="Station Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            readOnly={isEditMode}
            style={{
              backgroundColor: inputBg,
              border: `1px solid ${borderColor}`,
              color: textColor,
              opacity: isEditMode ? 0.6 : 1,
              cursor: isEditMode ? "not-allowed" : "text",
            }}
            className="p-3 rounded-lg focus:outline-none focus:border-red-500 placeholder:text-gray-400"
          />

          <input
            value={lat}
            readOnly
            style={{
              backgroundColor: inputReadonlyBg,
              border: `1px solid ${borderColor}`,
              color: mutedColor,
            }}
            className="p-3 rounded-lg"
          />

          <input
            value={lng}
            readOnly
            style={{
              backgroundColor: inputReadonlyBg,
              border: `1px solid ${borderColor}`,
              color: mutedColor,
            }}
            className="p-3 rounded-lg"
          />
        </div>

        {/* Map */}
        <div className="mt-2 relative z-[10001]">
          <MapContainer
            center={[lat, lng]}
            zoom={14}
            className="h-[320px] rounded-xl overflow-hidden"
            style={{ border: `1px solid ${borderColor}` }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <RecenterMap lat={lat} lng={lng} />
            <Marker
              draggable
              position={[lat, lng]}
              eventHandlers={{
                dragend: (e) => {
                  const p = e.target.getLatLng();
                  setLat(p.lat);
                  setLng(p.lng);
                },
              }}
            />
          </MapContainer>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            style={{
              border: `1px solid ${borderColor}`,
              color: mutedColor,
              backgroundColor: "transparent",
            }}
            className="px-5 py-2 rounded-lg hover:bg-red-600 hover:!text-white hover:!border-red-600 transition"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleSave}
            className="bg-red-600 px-6 py-2 rounded-lg text-white font-medium hover:bg-red-700 disabled:opacity-50 transition"
          >
            {loading
              ? isEditMode ? "Updating..." : "Saving..."
              : isEditMode ? "Update Station" : "Save Station"}
          </button>
        </div>
      </div>
    </div>
  );
}