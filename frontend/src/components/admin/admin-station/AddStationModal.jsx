import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { FormModal, FormField } from "../../ui/form";
import { toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/admin/station`;

const STN_PREFIX = "STN-";

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14);
    setTimeout(() => map.invalidateSize(), 200);
  }, [lat, lng, map]);
  return null;
}

export default function AddStationModal({ onClose, stationData }) {
  const isEditMode = !!stationData;

  const [formData, setFormData] = useState({
    stationName: "",
    code: STN_PREFIX,
    lat: 18.5064749,
    lng: 73.868444,
  });

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------- INIT ---------- */
  useEffect(() => {
    if (stationData) {
      const data = {
        stationName: stationData.name || "",
        code: stationData.code || STN_PREFIX,
        lat: parseFloat(stationData.lat),
        lng: parseFloat(stationData.lng),
      };

      setFormData(data);
      setInitialData(data);
    } else {
      const data = {
        stationName: "",
        code: STN_PREFIX,
        lat: 18.5064749,
        lng: 73.868444,
      };

      setFormData(data);
      setInitialData(data);
    }

    setError("");
  }, [stationData]);

  /* ---------- CHANGE DETECTION ---------- */
  const isChanged =
  formData.stationName !== initialData?.stationName ||
  formData.code !== initialData?.code ||
  Number(formData.lat).toFixed(6) !== Number(initialData?.lat).toFixed(6) ||
  Number(formData.lng).toFixed(6) !== Number(initialData?.lng).toFixed(6);

  /* ---------- HANDLERS ---------- */

  const searchLocation = async (name) => {
    if (!name || name.length < 2) return;
    try {
      const res = await fetch(
        `${API}/pune_fire_stations.php?q=${encodeURIComponent(name)}`
      );
      const data = await res.json();
      if (data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lng),
        }));
      }
    } catch {
      toast.error("Station search failed");
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setError("");

    setFormData((prev) => ({
      ...prev,
      stationName: value,
    }));

    searchLocation(value);
  };

  const handleCodeChange = (e) => {
    let val = e.target.value.toUpperCase();

    if (!val.startsWith(STN_PREFIX)) {
      val = STN_PREFIX + val.replace(STN_PREFIX, "");
    }

    if (val.length < STN_PREFIX.length) val = STN_PREFIX;

    const suffix = val.slice(STN_PREFIX.length);

    if (!/^[A-Z0-9\-]*$/.test(suffix)) {
      setError("Only letters, numbers and '-' allowed");
      return;
    }

    setError("");

    setFormData((prev) => ({
      ...prev,
      code: STN_PREFIX + suffix,
    }));
  };

  /* ---------- SUBMIT ---------- */
  const handleSave = async () => {
    if (!isChanged) return;

    const { stationName, code, lat, lng } = formData;

    if (!stationName || !code) {
      setError("Please fill all required fields");
      return;
    }

    const suffix = code.replace(STN_PREFIX, "");

    if (!suffix) {
      setError("Station code cannot be empty");
      return;
    }

    if (!/^(?=.*[0-9])[A-Z0-9\-]+$/.test(suffix)) {
      setError("Station code must contain at least one number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = { stationName, code, lat, lng };
      if (stationData?.id) payload.id = stationData.id;

      const res = await fetch(
        `${API}/${isEditMode ? "update_station.php" : "add_station.php"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!data.status) {
        setError(data.message || "Operation failed");
        return;
      }

      toast.success(
        isEditMode
          ? "Station updated successfully"
          : "Station added successfully"
      );

      onClose();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      open={true}
      onClose={onClose}
      title={isEditMode ? "Edit Station" : "Add Station"}
      onSubmit={handleSave}
      submitLabel={isEditMode ? "Update Station" : "Save Station"}
      loadingLabel={isEditMode ? "Updating..." : "Saving..."}
      loading={loading}
      disabled={loading || !isChanged || !!error}
      error={error}
      maxWidth="sm"
    >
      <FormField
        label="Station Name"
        name="stationName"
        value={formData.stationName}
        onChange={handleNameChange}
        required
      />

      <FormField
        label="Station Code"
        name="code"
        value={formData.code}
        onChange={handleCodeChange}
        disabled={isEditMode}
        required
      />

      <FormField label="Latitude" name="lat" value={formData.lat} disabled />
      <FormField label="Longitude" name="lng" value={formData.lng} disabled />

      <div className="col-span-2 mt-2 z-[10001]">
        <MapContainer
          center={[formData.lat, formData.lng]}
          zoom={14}
          className="h-[180px] rounded-xl overflow-hidden"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <RecenterMap lat={formData.lat} lng={formData.lng} />
          <Marker
            draggable
            position={[formData.lat, formData.lng]}
            eventHandlers={{
              dragend: (e) => {
                const p = e.target.getLatLng();
                setFormData((prev) => ({
                  ...prev,
                  lat: p.lat,
                  lng: p.lng,
                }));
              },
            }}
          />
        </MapContainer>
      </div>
    </FormModal>
  );
}