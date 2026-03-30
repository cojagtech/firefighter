import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
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

export default function ConfirmLocationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [incident, setIncident] = useState(state?.incident || null);
  const [loading, setLoading] = useState(!state?.incident);

  const [currentLat, setCurrentLat] = useState(null);
  const [currentLng, setCurrentLng] = useState(null);
  const [hasMarkerMoved, setHasMarkerMoved] = useState(false);
  const [selectedStationName, setSelectedStationName] = useState(null);

  // 🔥 NEW: Assets state
  const [assets, setAssets] = useState([]);

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

  // ✅ Load incident if not passed
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

  // ✅ Set coordinates
  useEffect(() => {
    if (!incident) return;

    const lat = Number(incident.latitude ?? incident.coordinates?.lat);
    const lng = Number(incident.longitude ?? incident.coordinates?.lng);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setCurrentLat(lat);
      setCurrentLng(lng);
    } else {
      setCurrentLat(null);
      setCurrentLng(null);
    }
  }, [incident]);

  // 🔥 MAIN: Fetch nearby assets
  useEffect(() => {
    if (!incident?.id) return;

    fetch(
      `${API_BASE}/fire-fighter/nearby-assets.php?incident_id=${incident.id}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("🔥 Nearby Assets:", data);
        setAssets(data.assets || []);
      })
      .catch((err) => console.error("Assets API Error:", err));
  }, [incident]);

  // Theme
  const incidentTheme = createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: { main: "#E53935" },
    },
  });

  if (loading || !incident) {
    return <p style={{ padding: 40 }}>Loading...</p>;
  }

  const confirmAndProceed = () => {
    const payload = {
      ...incident,
      latitude: currentLat,
      longitude: currentLng,
      coordinates: { lat: currentLat, lng: currentLng },
      locationAdjusted: hasMarkerMoved,
      selectedStationName: selectedStationName || null,
    };

    if (selectedStationName) {
      navigate(
        `/confirm-forward-incidence/${incident.id}/${encodeURIComponent(
          selectedStationName
        )}`,
        { state: { incident: payload } }
      );
    } else {
      navigate(`/vehicle-drone-selection/${incident.id}`, {
        state: { incident: payload },
      });
    }
  };

  return (
    <ThemeProvider theme={incidentTheme}>
      <CssBaseline />

      <Box sx={{ minHeight: "100vh", p: 3 }}>
        <Stack spacing={4} maxWidth="1200px" mx="auto">

          {/* Header */}
          <Stack direction="row" spacing={2} alignItems="center">
            <PlaceIcon color="primary" />
            <Typography variant="h5" fontWeight={700}>
              Confirm Incident Location
            </Typography>
          </Stack>

          {/* Incident Info */}
          <Card>
            <CardHeader title={incident.name} />
            <CardContent>
              <Typography variant="body2">
                Coordinates: {currentLat}, {currentLng}
              </Typography>
            </CardContent>
          </Card>

          {/* Layout */}
          <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>

            {/* Map */}
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

            {/* Right Panel */}
            <Stack flex={1} spacing={3}>

              {/* 🔥 REAL DATA */}
              <NearbyAssetsPanel assets={assets} />

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
                      <Typography variant="body2">
                        Location adjusted — assets should be recalculated
                      </Typography>
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

function InfoField({ label, value, mono }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" component="div">
        {label}
      </Typography>
      <Typography
        variant="body2"
        component="div"
        sx={{ fontFamily: mono ? "monospace" : "inherit", fontWeight: 500 }}
      >
        {value}
      </Typography>
    </Box>
  );
}