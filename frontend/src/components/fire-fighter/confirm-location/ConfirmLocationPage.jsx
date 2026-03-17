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
const API = `${API_BASE}/fire-fighter/fire-fighter-dashboard`;

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

  // ✅ All backend logic unchanged
  useEffect(() => {
    if (incident) {
      setLoading(false);
      return;
    }

    fetch(`${API}/get_incidents.php`)
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

  useEffect(() => {
    if (!incident) return;

    const lat = Number(incident.latitude ?? incident.coordinates?.lat);
    const lng = Number(incident.longitude ?? incident.coordinates?.lng);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setCurrentLat(lat);
      setCurrentLng(lng);
    } else {
      console.error("❌ Invalid coordinates after resolve:", incident);
      setCurrentLat(null);
      setCurrentLng(null);
    }
  }, [incident]);

  // Theme-aware MUI theme
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
        secondary: isDark ? "#999999" : "#6b7280",
      },
      divider: isDark ? "#2A2A2A" : "#e2e8f0",
    },
  });

  const C = isDark
    ? {
        iconBoxBg: "#1E1E1F",
        iconBoxBorder: "#2A2A2A",
        invalidMapBg: "#111111",
        invalidMapBorder: "#2A2A2A",
        invalidMapText: "#777777",
        adjustedCardBg: "#211112",
      }
    : {
        iconBoxBg: "#f1f5f9",
        iconBoxBorder: "#e2e8f0",
        invalidMapBg: "#f8fafc",
        invalidMapBorder: "#e2e8f0",
        invalidMapText: "#9ca3af",
        adjustedCardBg: "#fff1f2",
      };

  if (loading || !incident) {
    return (
      <p style={{ color: isDark ? "white" : "#111827", padding: 40 }}>
        Loading...
      </p>
    );
  }

  const assets = [
    { id: "T-1", name: "Fire Truck A", type: "fire", distance: 1.2 },
    { id: "D-1", name: "Drone Recon", type: "drone", distance: 0.8 },
  ];

  const confirmAndProceed = () => {
    const payload = {
      ...incident,
      latitude: currentLat,
      longitude: currentLng,
      coordinates: {
        lat: currentLat,
        lng: currentLng,
      },
      locationAdjusted: hasMarkerMoved,
      selectedStationName: selectedStationName || null,
    };

    if (selectedStationName) {
      navigate(
        `/confirm-forward-incidence/${incident.id}/${encodeURIComponent(selectedStationName)}`,
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
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: C.iconBoxBg,
                border: `1px solid ${C.iconBoxBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PlaceIcon sx={{ color: "primary.main" }} />
            </Box>

            <Box>
              <Typography variant="h4" fontWeight={800}>
                Confirm Incident Location
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Adjust marker precisely before dispatch
              </Typography>
            </Box>
          </Stack>

          {/* Incident Info Card */}
          <Card>
            <CardHeader
              title={<Typography variant="h6">{incident.name}</Typography>}
            />
            <CardContent>
              <Stack direction="row" spacing={4} flexWrap="wrap">
                <InfoField label="Incident ID" value={incident.id} mono />
                <InfoField label="Type" value={incident.type || incident.name} mono />
                <InfoField
                  label="Status"
                  value={<Chip size="small" label={incident.status} color="error" />}
                />
                <InfoField label="Location" value={incident.location} />
                <InfoField
                  label="Coordinates"
                  value={
                    Number.isFinite(currentLat) && Number.isFinite(currentLng)
                      ? `${currentLat}, ${currentLng}`
                      : "Not Available"
                  }
                  mono
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Map + Panels */}
          <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
            <Box flex={2}>
              {Number.isFinite(currentLat) && Number.isFinite(currentLng) ? (
                <MapWithDraggableMarker
                  initialLat={currentLat}
                  initialLng={currentLng}
                  incidentName={incident.name}
                  hasMarkerMoved={hasMarkerMoved}
                  onMarkerMove={(lat, lng, isReset = false) => {
                    setCurrentLat(lat);
                    setCurrentLng(lng);
                    setHasMarkerMoved(!isReset);
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: 400,
                    bgcolor: C.invalidMapBg,
                    border: `1px solid ${C.invalidMapBorder}`,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.invalidMapText,
                  }}
                >
                  Invalid or missing incident coordinates
                </Box>
              )}
            </Box>

            <Stack flex={1} spacing={3}>
              <NearbyAssetsPanel assets={assets} />

              <SuggestedStationsPanel
                incidentId={incident.id}
                selectedStationName={selectedStationName}
                onSelectStation={setSelectedStationName}
              />

              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<CheckIcon />}
                  onClick={confirmAndProceed}
                >
                  {selectedStationName
                    ? "Confirm & Share Incident"
                    : "Confirm Location & Continue"}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<ChevronLeftIcon />}
                  onClick={() => navigate(-1)}
                >
                  Back to Dashboard
                </Button>
              </Stack>

              {hasMarkerMoved && (
                <Card sx={{ borderColor: "primary.main", bgcolor: C.adjustedCardBg }}>
                  <CardContent>
                    <Stack direction="row" spacing={2}>
                      <InfoIcon color="primary" />
                      <Box>
                        <Typography fontWeight="bold">
                          Location Adjusted
                        </Typography>
                        <Typography variant="caption">
                          Routing & response units recalculated
                        </Typography>
                      </Box>
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