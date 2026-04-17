import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import FlightIcon from "@mui/icons-material/Flight";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import VehicleSelectionCard from "./VehicleSelectionCard";
import DroneSelectionCard from "./DroneSelectionCard";
import SelectionSummary from "./SelectionSummary";

import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/fire-fighter/vehicle-drone-selection`;

const safeNumber = (v) =>
  v === null || v === undefined || v === "" ? null : Number(v);

const normalizeVehicleRow = (v = {}) => ({
  ...v,
  id: v.id,
  name: v.name ?? "Unnamed Vehicle",
  type: v.type ?? "—",
  station: v.station,
  device_id: v.device_id,
  vehicle_status:
    v.vehicle_status ?? v.vehicle_availability_status ?? v.status ?? "unknown",
  distanceKm: safeNumber(v.distanceKm),
  etaMinutes: safeNumber(v.etaMinutes),
});

const normalizeDroneRow = (row = {}) => ({
  id: row.id,
  drone_id: row.drone_code,
  name: row.name,
  status: row.status,
  battery: row.battery,
  flight_hours: row.flight_hours,
  station: row.station,
  pilot_name: row.pilot_name,
  pilot_number: row.pilot_number,
  is_ready: Boolean(row.is_ready),
});

export default function VehicleDroneSelectionPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const incident = state?.incident;
  const incidentId =
    incident?.id ?? incident?.incident_id ?? incident?.incidentId ?? null;

  const session = JSON.parse(sessionStorage.getItem("fireOpsSession") || "{}");
  const userStation = session.station;

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

  // Dynamic MUI theme
  const incidentTheme = createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      background: {
        default: isDark ? "#0F0F10" : "#f8fafc",
        paper: isDark ? "#131314" : "#ffffff",
      },
      primary: { main: "#E53935" },
      text: {
        primary: isDark ? "#EDEDED" : "#111827",
        secondary: isDark ? "#9A9A9A" : "#6b7280",
      },
      divider: isDark ? "#2A2A2A" : "#e2e8f0",
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#171717" : "#ffffff",
            borderRadius: 14,
            border: `1px solid ${isDark ? "#2F2F2F" : "#e2e8f0"}`,
          },
        },
      },
    },
  });

  useEffect(() => {
    if (!incident) navigate("/fire-fighter-dashboard");
  }, [incident, navigate]);

  if (!incident) return null;

  const [vehicles, setVehicles] = useState([]);
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedAssets, setSelectedAssets] = useState({
    vehicleIds: [],
    droneIds: [],
  });

  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  // ✅ All backend logic unchanged
  useEffect(() => {
    if (!userStation) return;
    let mounted = true;

    async function fetchAll() {
      setLoading(true);
      try {
        const vehRes = await fetch(
          `${API_BASE}/admin/admin-vehicle/get_vehicles.php`
        );
        const vehJson = await vehRes.json();

        const droneRes = await fetch(`${API}/get_drones.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ station: userStation }),
        });
        const droneJson = await droneRes.json();

        if (!mounted) return;

        setVehicles(
          (vehJson || [])
            .map(normalizeVehicleRow)
            .filter(
              (v) =>
                v.station === userStation &&
                v.vehicle_status?.toLowerCase() === "available"
            )
        );

        setDrones(
          (droneJson?.drones || [])
            .map(normalizeDroneRow)
            .filter(
              (d) =>
                d.station === userStation &&
                d.status?.toLowerCase() === "active"
            )
        );

        setLoading(false);
      } catch (e) {
        console.error(e);
        setSnack({
          open: true,
          severity: "error",
          message: "Failed to load station assets",
        });
        setLoading(false);
      }
    }

    fetchAll();
    return () => (mounted = false);
  }, [userStation]);

  const selectedVehicleObjects = useMemo(
    () => vehicles.filter((v) => selectedAssets.vehicleIds.includes(v.id)),
    [vehicles, selectedAssets]
  );

  const selectedDroneObjects = useMemo(
    () => drones.filter((d) => selectedAssets.droneIds.includes(d.id)),
    [drones, selectedAssets]
  );

  const canActivate =
    selectedDroneObjects.length > 0 && selectedVehicleObjects.length > 0;

  return (
    <ThemeProvider theme={incidentTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", p: 4 }}>
        <Box maxWidth="1280px" mx="auto">

          <Stack spacing={1} mb={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <FlightIcon color="primary" />
              <Box>
                <Typography variant="h4" fontWeight={800}>
                  Vehicle & Drone Selection
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Station: {userStation}
                </Typography>
              </Box>
            </Stack>

            <Button
              size="small"
              startIcon={<ArrowBackIcon />}
              sx={{ color: "text.secondary", width: "fit-content" }}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </Stack>

          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 4 }}>
            <Stack spacing={4}>
              <AssetSection
                icon={<LocalShippingIcon color="primary" />}
                title="Available Vehicles"
                count={selectedAssets.vehicleIds.length}
                total={vehicles.length}
              >
                {loading ? (
                  <CircularProgress />
                ) : vehicles.length === 0 ? (
                  <NoAssetPlaceholder message="No vehicles for this station" />
                ) : (
                  vehicles.map((v) => (
                    <VehicleSelectionCard
                      key={v.id}
                      vehicle={v}
                      isSelected={selectedAssets.vehicleIds.includes(v.id)}
                      onToggle={() =>
                        setSelectedAssets((p) => ({
                          ...p,
                          vehicleIds: p.vehicleIds.includes(v.id)
                            ? p.vehicleIds.filter((id) => id !== v.id)
                            : [...p.vehicleIds, v.id],
                        }))
                      }
                    />
                  ))
                )}
              </AssetSection>

              <AssetSection
                icon={<FlightIcon color="primary" />}
                title="Available Drones"
                count={selectedAssets.droneIds.length}
                total={drones.length}
              >
                {loading ? (
                  <CircularProgress />
                ) : drones.length === 0 ? (
                  <NoAssetPlaceholder message="No drones for this station" />
                ) : (
                  drones.map((d) => (
                    <DroneSelectionCard
                      key={d.id}
                      drone={d}
                      isSelected={selectedAssets.droneIds.includes(d.id)}
                      onToggle={() =>
                        setSelectedAssets((p) => ({
                          ...p,
                          droneIds: p.droneIds.includes(d.id)
                            ? p.droneIds.filter((id) => id !== d.id)
                            : [...p.droneIds, d.id],
                        }))
                      }
                    />
                  ))
                )}
              </AssetSection>
            </Stack>

            <SelectionSummary
              selectedVehicles={selectedVehicleObjects}
              selectedDrones={selectedDroneObjects}
              canActivate={canActivate}
              onActivate={async () => {
                if (!incidentId) {
                  setSnack({
                    open: true,
                    severity: "error",
                    message: "Invalid Incident ID",
                  });
                  return;
                }

                const selectedDrone = selectedDroneObjects[0];
                const selectedVehicle = selectedVehicleObjects[0];

                const droneDbId = selectedDrone?.id;
                const droneCode = selectedDrone?.drone_id;
                const vehicleDeviceId = selectedVehicle?.device_id;

                if (!droneDbId || !vehicleDeviceId) {
                  setSnack({
                    open: true,
                    severity: "error",
                    message: "Select both drone and vehicle",
                  });
                  return;
                }

                // ✅ Extract lat/lng safely
                const lat = incident?.latitude || incident?.lat;
                const lng = incident?.longitude || incident?.lng;

                if (!lat || !lng) {
                  setSnack({
                    open: true,
                    severity: "error",
                    message: "Incident location missing",
                  });
                  return;
                }

                try {
                  console.log("Sending location:", { incidentId, lat, lng });

                  // ✅ Generate altitude (50–70)
                  const altitude = Math.floor(Math.random() * (70 - 50 + 1)) + 50;

                  const payload = {
                    incident_id: incidentId,
                    latitude: lat,
                    longitude: lng,
                    altitude: altitude,
                  };

                  // ✅ 1. SEND INCIDENT LOCATION TO BOTH APIs (NON-BLOCKING SAFE)
                  // await Promise.allSettled([
                  //   fetch("http://43.205.31.167:8082/api/incident_location", {
                  //     method: "POST",
                  //     headers: {
                  //       "Content-Type": "application/json",
                  //     },
                  //     body: JSON.stringify(payload),
                  //   }),

                  //   fetch("http://43.205.31.167:8081/api/incident_location", {
                  //     method: "POST",
                  //     headers: {
                  //       "Content-Type": "application/json",
                  //     },
                  //     body: JSON.stringify(payload),
                  //   }),
                  // ]);

                  // // 🔥 2. SEND INCIDENT TO PYTHON (NON-BLOCKING) // try { // await fetch("http://65.2.23.154:5001/api/incident", { // method: "POST", // headers: { // "Content-Type": "application/json", // }, // body: JSON.stringify({ // incident_id: incidentId, // drone_id: droneCode, // }), // }); // } catch (err) { // console.warn("Python incident API failed, continuing...", err); // }

                  // ✅ 2. START DRONE MISSION
                  await fetch(`${API}/start_drone_mission.php`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      incident_id: incidentId,
                      drone_id: droneDbId,
                    }),
                  });

                  // ✅ 3. UPDATE INCIDENT STATUS
                  const res = await fetch(`${API}/update_incident_status.php`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      incidentId,
                      droneId: droneCode,
                      vehicleDeviceId,
                    }),
                  });

                  const data = await res.json();
                  if (!data.success) throw new Error(data.message);

                  // ✅ 4. NAVIGATE
                  navigate(
                    `/live-incident-command/${incidentId}/${droneCode}/${vehicleDeviceId}`,
                    {
                      state: {
                        incident: {
                          ...incident,
                          status: "in_progress",
                          isNewAlert: 0,
                        },
                        selectedVehicles: selectedVehicleObjects,
                        selectedDrones: selectedDroneObjects,
                        droneId: droneCode,
                        vehicleDeviceId,
                      },
                    }
                  );

                } catch (err) {
                  console.error(err);
                  setSnack({
                    open: true,
                    severity: "error",
                    message: "Activation failed",
                  });
                }
              }}
              onBack={() => navigate(-1)}
            />
          </Box>
        </Box>

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          <Alert severity={snack.severity}>{snack.message}</Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

function AssetSection({ icon, title, count, total, children }) {
  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              {icon}
              <Typography fontWeight={600}>{title}</Typography>
            </Box>
            <Chip label={`${count} Selected`} size="small" />
          </Box>
        }
        subheader={`${total} assets`}
      />
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function NoAssetPlaceholder({ message }) {
  return (
    <Box textAlign="center" py={4}>
      <WarningAmberIcon />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}