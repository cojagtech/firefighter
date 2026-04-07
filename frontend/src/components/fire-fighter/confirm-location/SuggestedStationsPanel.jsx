import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Box,
  Radio,
  CircularProgress
} from "@mui/material";

import BusinessIcon from "@mui/icons-material/Business";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function SuggestedStationsPanel({
  incidentId,
  selectedStationName,
  onSelectStation
}) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStations() {
      setLoading(true);
      setError(null);

      if (!incidentId || incidentId === 0) {
        console.warn("Invalid incidentId:", incidentId);
        setError("Invalid incident ID");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching nearest stations for incidentId:", incidentId);

        const res = await fetch(
          `${API_BASE}/fire-fighter/getNearestStations.php?incident_id=${incidentId}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch stations from API");
        }

        const data = await res.json();
        console.log("API Response:", data);

        if (data.error) {
          console.warn("API returned error:", data.error);
          setError(data.error);
          setStations([]);
        } else {
          // Log incident coordinates
          console.log("Incident Coordinates:", {
            latitude: data.incident.latitude,
            longitude: data.incident.longitude,
            station: data.incident.stationName
          });

          setStations(data.nearest_stations || []);
        }
      } catch (err) {
        console.error("Error fetching stations:", err);
        setError("Unable to load stations");
      } finally {
        setLoading(false);
      }
    }

    loadStations();
  }, [incidentId]);

  const handleSelect = (stationName) => {
    onSelectStation(selectedStationName === stationName ? null : stationName);
  };

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <BusinessIcon color="primary" />
            <Typography variant="h6">Nearest Fire Stations</Typography>
          </Box>
        }
      />
      <CardContent>
        {loading ? (
          <Box textAlign="center" py={2}>
            <CircularProgress size={24} />
            <Typography variant="body2" mt={1}>
              Loading stations...
            </Typography>
          </Box>
        ) : error ? (
          <Typography align="center" color="error">
            {error}
          </Typography>
        ) : stations.length ? (
          stations.map((station) => (
            <Box
              key={station.id}
              onClick={() => handleSelect(station.station_name)}
              sx={{
                p: 2,
                mb: 1.5,
                borderRadius: 2,
                cursor: "pointer",
                border: "1px solid",
                borderColor:
                  selectedStationName === station.station_name
                    ? "primary.main"
                    : "divider",
                bgcolor:
                  selectedStationName === station.station_name
                    ? "primary.light"
                    : "action.hover",
                transition: "0.2s"
              }}
            >
              {/* Header */}
              <Box display="flex" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={1}>
                  <Radio
                    checked={selectedStationName === station.station_name}
                  />
                  <Typography fontWeight={500}>
                    {station.station_name}
                  </Typography>
                </Box>
                <Chip
                  label={`${(station.distance_km ?? 0).toFixed(3)} km`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>

              {/* Assets */}
              <Box mt={1} display="flex" gap={3}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <LocalFireDepartmentIcon
                    sx={{ fontSize: 16, color: "#ff7043" }}
                  />
                  <Typography variant="caption">
                    Vehicles: {station.vehicle_count ?? 0}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="caption">
                    Drones: {station.drone_count ?? 0}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))
        ) : (
          <Typography align="center">No stations found</Typography>
        )}
      </CardContent>
    </Card>
  );
}