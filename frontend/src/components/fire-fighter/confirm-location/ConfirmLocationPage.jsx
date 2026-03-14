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

const darkIncidentTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#0F0F10", paper: "#131314" },
    primary: { main: "#E53935" },
    text: { primary: "#EDEDED", secondary: "#999" },
    divider: "#2A2A2A",
  },
});

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

  if (loading || !incident) {
    return <p style={{ color: "white", padding: 40 }}>Loading...</p>;
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
        `/confirm-forward-incidence/${incident.id}/${encodeURIComponent(
          selectedStationName,
        )}`,
        { state: { incident: payload } },
      );
    } else {
      navigate(`/vehicle-drone-selection/${incident.id}`, {
        state: { incident: payload },
      });
    }
  };

  return (
    <ThemeProvider theme={darkIncidentTheme}>
      <CssBaseline />

      <Box sx={{ minHeight: "100vh", p: 3 }}>
        <Stack spacing={4} maxWidth="1200px" mx="auto">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: "#1E1E1F",
                border: "1px solid #2A2A2A",
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

          <Card>
            <CardHeader
              title={<Typography variant="h6">{incident.name}</Typography>}
            />
            <CardContent>
              <Stack direction="row" spacing={4} flexWrap="wrap">
                <InfoField label="Incident ID" value={incident.id} mono />
                <InfoField
                  label="Type"
                  value={incident.type || incident.name}
                  mono
                />
                <InfoField
                  label="Status"
                  value={
                    <Chip size="small" label={incident.status} color="error" />
                  }
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
                    bgcolor: "#111",
                    border: "1px solid #2A2A2A",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#777",
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
                <Card sx={{ borderColor: "primary.main", bgcolor: "#211112" }}>
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
