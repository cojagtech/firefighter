import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Stack,
  Chip,
} from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/fire-fighter/confirm-forward`;

export default function ConfirmForwardIncidence() {
  const { incidentId, stationName } = useParams();
  const navigate = useNavigate();

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
  const handleFinalConfirm = async () => {
    await fetch(`${API}/forward_incident.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incidentId,
        stationName: decodeURIComponent(stationName),
      }),
    });

    alert("Incident forwarded successfully");
    navigate("/fire-fighter-dashboard");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 4,
        bgcolor: isDark ? "#0F0F10" : "#f8fafc",
        color: isDark ? "#ffffff" : "#111827",
      }}
    >
      <Stack spacing={3} maxWidth={600} mx="auto">
        <Card
          sx={{
            bgcolor: isDark ? "#131314" : "#ffffff",
            border: `1px solid ${isDark ? "#2a2a2a" : "#e2e8f0"}`,
          }}
        >
          <CardHeader
            title={
              <Typography
                variant="h6"
                sx={{ color: isDark ? "#ffffff" : "#111827" }}
              >
                Confirm Incident Forwarding
              </Typography>
            }
          />
          <CardContent>
            <Typography sx={{ color: isDark ? "#ffffff" : "#111827" }}>
              Incident ID: <Chip label={incidentId} color="error" />
            </Typography>
            <Typography sx={{ mt: 1, color: isDark ? "#ffffff" : "#111827" }}>
              Forward To:{" "}
              <Chip
                label={decodeURIComponent(stationName)}
                color="error"
              />
            </Typography>
          </CardContent>
        </Card>

        {/* Confirm Button — Red */}
        <Button
          variant="contained"
          size="large"
          startIcon={<CheckIcon />}
          onClick={handleFinalConfirm}
          sx={{
            backgroundColor: "#dc2626",
            color: "#ffffff",
            "&:hover": { backgroundColor: "#b91c1c" },
          }}
        >
          Confirm & Share Incident
        </Button>

        {/* Go Back Button — Red border, white text */}
        <Button
          variant="outlined"
          startIcon={<ChevronLeftIcon />}
          onClick={() => navigate(-1)}
          sx={{
            borderColor: "#dc2626",
            color: isDark ? "#ffffff" : "#dc2626",
            "&:hover": {
              borderColor: "#b91c1c",
              backgroundColor: "rgba(220,38,38,0.08)",
              color: isDark ? "#ffffff" : "#b91c1c",
            },
          }}
        >
          Go Back
        </Button>
      </Stack>
    </Box>
  );
}