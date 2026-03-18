import { MapContainer, TileLayer, Marker, Popup, LayersControl } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const { BaseLayer } = LayersControl;

const markerIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapWithDraggableMarkerMui({
  initialLat,
  initialLng,
  onMarkerMove,
  incidentName = "Incident",
  hasMarkerMoved,
}) {
  const [position, setPosition] = useState(null);
  const [originalPosition, setOriginalPosition] = useState(null);

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

  // ✅ Backend unchanged
  useEffect(() => {
    if (
      Number.isFinite(initialLat) &&
      Number.isFinite(initialLng) &&
      !originalPosition
    ) {
      const startPos = [initialLat, initialLng];
      setPosition(startPos);
      setOriginalPosition(startPos);
    }
  }, [initialLat, initialLng, originalPosition]);

  const C = isDark
    ? {
        cardBg: "#141414",
        cardBorder: "#222222",
        invalidBg: "#111111",
        invalidText: "gray",
        coordsBg: "#1e1e1e",
        coordsLabel: "gray",
        coordsText: "#ffffff",
      }
    : {
        cardBg: "#ffffff",
        cardBorder: "#e2e8f0",
        invalidBg: "#f8fafc",
        invalidText: "#9ca3af",
        coordsBg: "#f1f5f9",
        coordsLabel: "#6b7280",
        coordsText: "#111827",
      };

  if (!position) {
    return (
      <Card
        sx={{
          background: C.cardBg,
          border: `1px solid ${C.cardBorder}`,
          borderRadius: 3,
        }}
      >
        <CardHeader
          title={
            <Typography sx={{ color: isDark ? "#ffffff" : "#111827" }}>
              Incident Location Map
            </Typography>
          }
        />
        <CardContent>
          <Box
            sx={{
              height: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.invalidText,
              bgcolor: C.invalidBg,
              borderRadius: 2,
            }}
          >
            Invalid or missing coordinates
          </Box>
        </CardContent>
      </Card>
    );
  }

  function DraggableMarker() {
    const eventHandlers = {
      dragend(e) {
        const { lat, lng } = e.target.getLatLng();
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          const newPos = [lat, lng];
          setPosition(newPos);
          onMarkerMove(lat, lng, false);
        }
      },
    };

    return (
      <Marker
        icon={markerIcon}
        draggable
        eventHandlers={eventHandlers}
        position={position}
      >
        <Popup>
          <b>{incidentName}</b> <br />
          {position[0].toFixed(4)}, {position[1].toFixed(4)}
        </Popup>
      </Marker>
    );
  }

  return (
    <Card
      sx={{
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 3,
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocationOnIcon color="primary" />
              <Typography
                variant="h6"
                sx={{ color: isDark ? "#ffffff" : "#111827" }}
              >
                Incident Location Map
              </Typography>
            </Box>
            {hasMarkerMoved && <Chip label="ADJUSTED" color="warning" />}
          </Box>
        }
      />

      <CardContent>
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom
          style={{ height: "400px", borderRadius: "10px", width: "100%" }}
        >
          <LayersControl position="topright">
            <BaseLayer checked name="Normal Map">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </BaseLayer>
            <BaseLayer name="Satellite View">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles © Esri"
              />
            </BaseLayer>
          </LayersControl>
          <DraggableMarker />
        </MapContainer>

        <Box
          mt={2}
          p={1}
          sx={{ bgcolor: C.coordsBg, borderRadius: 1 }}
        >
          <Typography fontSize={13} sx={{ color: C.coordsLabel }}>
            Coordinates
          </Typography>
          <Typography
            fontFamily="monospace"
            sx={{ color: C.coordsText }}
          >
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </Typography>
        </Box>

        {hasMarkerMoved && originalPosition && (
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => {
              const [resetLat, resetLng] = originalPosition;
              setPosition(originalPosition);
              onMarkerMove(resetLat, resetLng, true);
            }}
          >
            Reset to Original Location
          </Button>
        )}
      </CardContent>
    </Card>
  );
}