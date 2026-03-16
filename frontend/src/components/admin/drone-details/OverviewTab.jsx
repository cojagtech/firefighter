"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import SafeIcon from "@/components/common/SafeIcon";
import StatusBadge from "@/components/common/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "react-hot-toast";

import PilotList from "./PilotList";

const API = `${import.meta.env.VITE_API_BASE_URL}/admin/admin-drone-details`;

const droneIcon = new L.Icon({
  iconUrl: "/assets/images/drone.png",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

function FlyToLocation({ gpsLocation }) {
  const map = useMap();
  useEffect(() => {
    if (gpsLocation) {
      map.flyTo([gpsLocation.lat, gpsLocation.lng], map.getZoom(), {
        animate: true,
        duration: 1.5,
      });
    }
  }, [gpsLocation, map]);
  return null;
}

const getStatusVariant = (status) => {
  switch (status) {
    case "patrolling": return "available";
    case "active_mission": return "busy";
    case "standby": return "warning";
    case "offline": return "offline";
    default: return "offline";
  }
};

export default function OverviewTab({ selectedDrone, refreshDrone }) {
  const [gpsLocation, setGpsLocation] = useState(null);
  const [selectedPilot, setSelectedPilot] = useState(null);
  const [reassignOpen, setReassignOpen] = useState(false);

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

  // Base dialog style
  const dialogStyle = {
    backgroundColor: isDark ? "#0D0F12" : "#ffffff",
    borderColor: isDark ? "#2E2E2E" : "#e2e8f0",
    color: isDark ? "#FAFAFA" : "#000000",
    // 👇 Override shadcn CSS variables so hover:bg-accent uses correct color
    "--background": isDark ? "13 15 18" : "255 255 255",
    "--foreground": isDark ? "250 250 250" : "0 0 0",
    "--accent": isDark ? "30 30 30" : "241 245 249",
    "--accent-foreground": isDark ? "250 250 250" : "0 0 0",
    "--border": isDark ? "46 46 46" : "226 232 240",
    "--muted": isDark ? "20 20 20" : "248 250 252",
    "--muted-foreground": isDark ? "161 161 170" : "100 116 139",
  };

  const defaultPune = { lat: 18.5204, lng: 73.8567 };

  // ✅ All backend logic unchanged
  const removePilot = () => {
    if (!selectedDrone) return;
    const formData = new FormData();
    formData.append("drone_code", selectedDrone.drone_code);
    formData.append("pilot_id", selectedDrone.pilot_id);
    fetch(`${API}/removePilotFromDrone.php`, {
      method: "POST",
      credentials: "include",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success("Pilot removed successfully");
          refreshDrone();
        } else {
          toast.error("Failed to remove pilot.");
        }
      });
  };

  useEffect(() => {
    if (!selectedDrone?.drone_code) return;
    const fetchGps = () => {
      fetch(`${API}/get_drone_locations.php?drone_code=${selectedDrone.drone_code}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setGpsLocation({ lat: Number(data.lat), lng: Number(data.lng) });
          } else {
            setGpsLocation(null);
          }
        })
        .catch(() => console.error("GPS Fetch Error"));
    };
    fetchGps();
    const interval = setInterval(fetchGps, 5000);
    return () => clearInterval(interval);
  }, [selectedDrone?.drone_code]);

  const reassignPilot = () => {
    if (!selectedPilot || !selectedDrone?.pilot_id) return;
    const formData = new FormData();
    formData.append("drone_code", selectedDrone.drone_code);
    formData.append("pilot_id", selectedPilot.id);
    formData.append("pilot_name", selectedPilot.fullName);
    formData.append("pilot_email", selectedPilot.email);
    formData.append("pilot_phone", selectedPilot.phone);
    formData.append("pilot_role", selectedPilot.designation);
    formData.append("old_pilot_id", selectedDrone.pilot_id);
    fetch(`${API}/reassignPilotToDrone.php`, {
      method: "POST",
      credentials: "include",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success("Pilot reassigned successfully");
          setReassignOpen(false);
          setSelectedPilot(null);
          refreshDrone();
        } else {
          toast.error(data.error || "Failed to reassign pilot");
        }
      });
  };

  const assignPilot = () => {
    if (!selectedPilot) return;
    const formData = new FormData();
    formData.append("drone_code", selectedDrone.drone_code);
    formData.append("pilot_id", selectedPilot.id);
    formData.append("pilot_name", selectedPilot.fullName);
    formData.append("pilot_email", selectedPilot.email);
    formData.append("pilot_phone", selectedPilot.phone);
    formData.append("pilot_role", selectedPilot.designation);
    formData.append("old_pilot_id", selectedDrone?.pilot_id || "");
    fetch(`${API}/assignPilotToDrone.php`, {
      method: "POST",
      credentials: "include",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success("Pilot assigned successful!");
          refreshDrone();
        } else {
          toast.error(data.error || "Failed to assign pilot");
        }
      });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">

        {/* Drone Information */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Drone Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Serial</span>
              <span className="font-medium">{selectedDrone?.drone_code || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Station</span>
              <span className="font-medium">{selectedDrone?.station || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Firmware</span>
              <span className="font-medium">{selectedDrone?.firmware_version || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Status</span>
              <StatusBadge
                status={getStatusVariant(selectedDrone?.status)}
                label={selectedDrone?.status}
                showIcon={false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Assigned Pilot */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Assigned Pilot</CardTitle></CardHeader>
          <CardContent>
            {selectedDrone?.pilot_id ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="border border-red-500">
                    <AvatarFallback>{selectedDrone.pilot_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedDrone.pilot_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedDrone.pilot_role}</p>
                  </div>
                </div>

                <Info label="Email" value={selectedDrone.pilot_email} isSmall />
                <Info label="Phone" value={selectedDrone.pilot_phone} isSmall />

                <div className="flex justify-between items-center mt-2">
                  <span className="text-muted-foreground text-sm">Pilot Status</span>
                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-red-600 text-white border border-red-600">
                    {selectedDrone.pilot_status}
                  </span>
                </div>

                <div className="flex gap-3">
                  {/* Reassign Dialog */}
                  <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Reassign Pilot
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="max-w-md border [&_*]:text-inherit"
                      style={dialogStyle}
                    >
                      <DialogHeader>
                        <DialogTitle
                          className="text-lg font-semibold"
                          style={{ color: isDark ? "#FAFAFA" : "#000000" }}
                        >
                          Select Pilot ({selectedDrone?.station})
                        </DialogTitle>
                      </DialogHeader>

                      <PilotList
                        station={selectedDrone?.station}
                        selectedPilot={selectedPilot}
                        setSelectedPilot={setSelectedPilot}
                      />

                      <Button
                        variant="outline"
                        disabled={!selectedPilot}
                        onClick={reassignPilot}
                        className="w-full mt-4"
                      >
                        Assign Pilot
                      </Button>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={removePilot}
                  >
                    Remove Pilot
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <SafeIcon
                  name="AlertCircle"
                  size={32}
                  className="mx-auto text-muted-foreground"
                />
                <p className="text-sm text-muted-foreground mb-4">No pilot assigned</p>

                {/* Assign Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">Assign Pilot</Button>
                  </DialogTrigger>
                  <DialogContent
                    className="border [&_*]:text-inherit"
                    style={dialogStyle}
                  >
                    <DialogHeader>
                      <DialogTitle style={{ color: isDark ? "#FAFAFA" : "#000000" }}>
                        Select Pilot ({selectedDrone?.station})
                      </DialogTitle>
                    </DialogHeader>
                    <PilotList
                      station={selectedDrone?.station}
                      selectedPilot={selectedPilot}
                      setSelectedPilot={setSelectedPilot}
                    />
                    <Button
                      className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
                      disabled={!selectedPilot}
                      onClick={assignPilot}
                    >
                      Confirm Assignment
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card
        className="aspect-video rounded-lg relative z-10"
        style={{ border: `1px solid ${isDark ? "#404040" : "#e2e8f0"}` }}
      >
        <MapContainer
          center={[defaultPune.lat, defaultPune.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FlyToLocation gpsLocation={gpsLocation} />
          {gpsLocation && (
            <Marker
              position={[gpsLocation.lat, gpsLocation.lng]}
              icon={droneIcon}
            >
              <Popup>
                <b>{selectedDrone?.drone_name}</b><br />
                Lat: {gpsLocation.lat.toFixed(5)}<br />
                Lng: {gpsLocation.lng.toFixed(5)}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </Card>
    </div>
  );

  function Info({ label, value, isSmall }) {
    return (
      <div className="flex justify-between">
        <span className={`text-muted-foreground ${isSmall ? "text-sm" : ""}`}>
          {label}
        </span>
        <span className={`font-medium ${isSmall ? "text-sm" : ""}`}>{value}</span>
      </div>
    );
  }
}