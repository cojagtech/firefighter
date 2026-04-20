import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Stack,
} from "@mui/material";

import PlaceIcon from "@mui/icons-material/Place";
import InfoIcon from "@mui/icons-material/Info";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import MapWithDraggableMarker from "./MapWithDraggableMarker";
import NearbyAssetsPanel from "./NearbyAssetsPanel";
import SuggestedStationsPanel from "./SuggestedStationsPanel";

import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ---------------- SCRIPT LOADER ----------------
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

export default function ConfirmLocationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [incident, setIncident] = useState(state?.incident || null);
  const [loading, setLoading] = useState(!state?.incident);

  const [currentLat, setCurrentLat] = useState(null);
  const [currentLng, setCurrentLng] = useState(null);

  const [hasMarkerMoved, setHasMarkerMoved] = useState(false);

  // ✅ FIX: this is now REAL source of truth
  const [selectedStationName, setSelectedStationName] = useState(null);

  const [stateStations, setStateStations] = useState(
    state?.station || null
  );

  const [assets, setAssets] = useState([]);

  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  const [flyingHeight, setFlyingHeight] = useState(null);
  const [fireStationCoords, setFireStationCoords] = useState(null);

  const cesiumLoadedRef = useRef(false);

  // ---------------- DARK MODE ----------------
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

  // ---------------- INCIDENT LOAD ----------------
  useEffect(() => {
    if (incident) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/fire-fighter/fire-fighter-dashboard/get_incidents.php`)
      .then((res) => res.json())
      .then((data) => {
        const inc = data.find((i) => i.id === id);
        if (!inc) {
          alert("Incident not found");
          navigate("/fire-fighter-dashboard");
          return;
        }
        setIncident(inc);
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load incident");
        navigate("/fire-fighter-dashboard");
      });
  }, [id, incident, navigate]);

  // ---------------- COORDS ----------------
  useEffect(() => {
    if (!incident) return;

    const lat = Number(incident.latitude ?? incident.coordinates?.lat);
    const lng = Number(incident.longitude ?? incident.coordinates?.lng);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setCurrentLat(lat);
      setCurrentLng(lng);
    }
  }, [incident]);

  // ---------------- ASSETS ----------------
  useEffect(() => {
    if (!incident?.id) return;

    fetch(
      `${API_BASE}/fire-fighter/nearby-assets.php?incident_id=${incident.id}`
    )
      .then((res) => res.json())
      .then((data) => setAssets(data.assets || []))
      .catch((err) => console.error(err));
  }, [incident]);

  // ---------------- FIRE STATION (NOW BASED ON SELECTION) ----------------
  useEffect(() => {
    if (!stateStations) return;

    fetch(
      `${API_BASE}/fire-fighter/confirm-location/get_fire_station.php?station_name=${encodeURIComponent(
        stateStations
      )}`
    )
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          setFireStationCoords(response.data);
        }
      })
      .catch((err) => console.error(err));
  }, [stateStations]);

  // ---------------- HEIGHT CALC ----------------
  const calculateHeight = (lat, lng) => {
    if (!window.viewer || !window.getFlyingHeight) return;

    const fireLat = Number(fireStationCoords?.latitude);
    const fireLon = Number(fireStationCoords?.longitude);

    if (!Number.isFinite(fireLat) || !Number.isFinite(fireLon)) return;

    window.getFlyingHeight(fireLon, fireLat, lng, lat, (height) => {
      setFlyingHeight(height);
    });
  };

  useEffect(() => {
    if (!currentLat || !currentLng) return;
    if (!fireStationCoords) return;

    const interval = setInterval(() => {
      if (window.viewer && window.getFlyingHeight) {
        clearInterval(interval);
        calculateHeight(currentLat, currentLng);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [currentLat, currentLng, fireStationCoords]);

  // ---------------- CESIUM ----------------
  useEffect(() => {
    let waitViewer;
    let waitInit;

    async function initCesium() {
      try {
        if (!cesiumLoadedRef.current) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href =
            "https://cesium.com/downloads/cesiumjs/releases/1.96/Build/Cesium/Widgets/widgets.css";
          document.head.appendChild(link);

          await loadScript(
            "https://cdnjs.cloudflare.com/ajax/libs/cesium/1.96.0/Cesium.js"
          );

          await loadScript("/assets/js/globel.js");
          await loadScript("/assets/js/map.js");

          cesiumLoadedRef.current = true;
        }

        const container = document.getElementById("map-container");
        if (container) container.innerHTML = "";

        waitInit = setInterval(() => {
          if (!window.initMap) return;

          window.initMap();
          clearInterval(waitInit);

          waitViewer = setInterval(() => {
            if (!window.Cesium || !window.viewer) return;

            console.log("🌍 Cesium Loaded");
            clearInterval(waitViewer);
          }, 200);
        }, 100);
      } catch (err) {
        console.error(err);
      }
    }

    initCesium();

    return () => {
      if (waitViewer) clearInterval(waitViewer);
      if (waitInit) clearInterval(waitInit);

      if (window.viewer) {
        window.viewer.destroy();
        window.viewer = null;
      }
    };
  }, []);

  // ---------------- CONFIRM FIX (IMPORTANT PART) ----------------
  const confirmAndProceed = () => {
    const finalStation = selectedStationName;

    const payload = {
      ...incident,
      latitude: currentLat,
      longitude: currentLng,
      coordinates: { lat: currentLat, lng: currentLng },
      locationAdjusted: hasMarkerMoved,
      selectedStationName: finalStation,
      flyingHeight, // ✅ ADD THIS
    };

    if (finalStation) {
      navigate(
        `/confirm-forward-incidence/${incident.id}/${encodeURIComponent(finalStation)}`,
        { state: { incident: payload } }
      );
    } else {
      navigate(`/vehicle-drone-selection/${incident.id}`, {
        state: { incident: payload },
      });
    }
  };

  const incidentTheme = createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: { main: "#E53935" },
    },
  });

  if (loading || !incident) {
    return <p style={{ padding: 40 }}>Loading...</p>;
  }

  return (
    <ThemeProvider theme={incidentTheme}>
      <CssBaseline />

      <div
        id="map-container"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      />

      <Box sx={{ minHeight: "100vh", p: 3 }}>
        <Stack spacing={3} maxWidth="1200px" mx="auto">

          <Card>
            <CardHeader title={incident.name} />
            <CardContent>
              <Typography>
                Coordinates: {currentLat}, {currentLng}
              </Typography>

              {flyingHeight !== null && (
                <Typography color="primary" fontWeight={600}>
                  🚁 Flying Height: {flyingHeight} meters
                </Typography>
              )}
            </CardContent>
          </Card>

          <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>

            <Box flex={2}>
              {currentLat && currentLng && (
                <MapWithDraggableMarker
                  initialLat={currentLat}
                  initialLng={currentLng}
                  onMarkerMove={(lat, lng) => {
                    setCurrentLat(lat);
                    setCurrentLng(lng);
                    setHasMarkerMoved(true);
                  }}
                />
              )}
            </Box>

            <Stack flex={1} spacing={3}>

              <NearbyAssetsPanel assets={assets} />

              {/* ✅ FIXED CONNECTION */}
              <SuggestedStationsPanel
                incidentId={incident.id}
                selectedStationName={selectedStationName}
                onSelectStation={setSelectedStationName}
              />

              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={confirmAndProceed}
              >
                Confirm & Continue
              </Button>

              <Button
                variant="outlined"
                startIcon={<ChevronLeftIcon />}
                onClick={() => navigate(-1)}
              >
                Back
              </Button>

              {hasMarkerMoved && (
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={2}>
                      <InfoIcon color="primary" />
                      <Typography>Location adjusted</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              )}

            </Stack>
          </Stack>

        </Stack>
      </Box>
    </ThemeProvider>
  );
}