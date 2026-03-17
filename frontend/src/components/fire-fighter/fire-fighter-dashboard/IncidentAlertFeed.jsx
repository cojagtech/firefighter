import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardFooter from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import SafeIcon from "@/components/common/SafeIcon";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

export default function IncidentAlertFeed({ IncidentAPI_BASE, station }) {
  const [incidents, setIncidents] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

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

  const DARK = isDark
    ? {
        base: "#121314",
        card: "#17181A",
        border: "#222427",
        hover: "#1f2023",
        text: "#e6e6e6",
        muted: "#8f8f8f",
        dialogBg: "#141516",
        dialogBorder: "#2a2c30",
        sectionBg: "#18191b",
        sectionBorder: "#24262a",
      }
    : {
        base: "#f8fafc",
        card: "#ffffff",
        border: "#e2e8f0",
        hover: "#f1f5f9",
        text: "#111827",
        muted: "#6b7280",
        dialogBg: "#ffffff",
        dialogBorder: "#e2e8f0",
        sectionBg: "#f8fafc",
        sectionBorder: "#e2e8f0",
      };

  const navigate = useNavigate();
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await fetch(
          `${IncidentAPI_BASE}/get_incidents.php?station=${encodeURIComponent(station)}`
        );
        const data = await res.json();
        setIncidents(data);
      } catch (e) {
        console.error("Fetch Error", e);
      }
    };

    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, [IncidentAPI_BASE]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/alert.mp3");
      audioRef.current.volume = 1;
      audioRef.current.loop = true;
    }

    const newAlerts = incidents.filter((i) => i.isNewAlert);

    if (newAlerts.length > 0 && !isMuted) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [incidents]);

  useEffect(() => {
    const unlock = () => {
      audioRef.current?.play().catch(() => {});
      document.removeEventListener("click", unlock);
    };
    document.addEventListener("click", unlock);
  }, []);

  const StatusTag = ({ status }) => {
    const palette = {
      new: { bg: "rgba(255,55,55,0.25)", text: "#ff4d4d" },
      assigned: { bg: "rgba(255,180,0,0.25)", text: "#ffcc66" },
      "in-progress": { bg: "rgba(0,140,255,0.25)", text: "#58a6ff" },
      closed: { bg: "rgba(0,255,120,0.25)", text: "#4ade80" },
    };
    const p = palette[status] || palette.new;

    return (
      <Chip
        label={
          status === "in-progress"
            ? "In Progress"
            : status[0].toUpperCase() + status.slice(1)
        }
        size="small"
        sx={{ backgroundColor: p.bg, color: p.text, fontWeight: 600, px: 1 }}
      />
    );
  };

  const formatTime = (str) => {
    const d = new Date(str);
    const diff = (Date.now() - d) / 60000;
    if (diff < 1) return "Just now";
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString();
  };

  const acknowledge = (id) => {
    navigate(`/confirm-location/${id}`);
  };

  const toggleSiren = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
    setIsMuted(!isMuted);
  };

  const viewDetails = (id) => {
    const incident = incidents.find((i) => i.id === id);
    if (incident) {
      setSelectedIncident(incident);
      setOpenDialog(true);
    }
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setSelectedIncident(null);
  };

  const Section = ({ title, children, full }) => (
    <Box
      sx={{
        gridColumn: full ? "1 / -1" : "auto",
        background: DARK.sectionBg,
        border: `1px solid ${DARK.sectionBorder}`,
        borderRadius: "10px",
        p: 2.5,
        mt: 1,
      }}
    >
      <div
        className="text-red-400 mb-2 tracking-wide"
        style={{ fontSize: "0.77rem", fontWeight: 600 }}
      >
        {title.toUpperCase()}
      </div>
      <div className="space-y-2.5">{children}</div>
    </Box>
  );

  const Row = ({ label, value, mono, children }) => (
    <div className="flex justify-between items-start gap-3">
      <div style={{ fontSize: "0.9rem", color: DARK.muted }}>{label}</div>
      <div
        className={`text-right ${mono ? "font-mono" : ""}`}
        style={{ fontSize: "0.95rem", color: DARK.text }}
      >
        {children || value}
      </div>
    </div>
  );

  if (!incidents.length)
    return (
      <Card
        sx={{
          background: DARK.card,
          color: DARK.text,
          border: `1px solid ${DARK.border}`,
        }}
      >
        <CardContent className="py-10 text-center">
          <SafeIcon name="CheckCircle" className="h-12 w-12 text-green-400 mx-auto" />
          <p className="text-lg font-semibold" style={{ color: DARK.text }}>
            No Active Incidents
          </p>
          <p className="text-sm" style={{ color: DARK.muted }}>
            No new alerts currently
          </p>
        </CardContent>
      </Card>
    );

  return (
    <Box
      sx={{
        background: DARK.base,
        maxHeight: "300px",
        overflowY: "auto",
        pr: 1,
        "&::-webkit-scrollbar": { width: "8px" },
        "&::-webkit-scrollbar-track": { background: isDark ? "#0f1011" : "#f1f5f9" },
        "&::-webkit-scrollbar-thumb": {
          background: isDark ? "#1c1d1f" : "#cbd5e1",
          borderRadius: "8px",
          border: `2px solid ${isDark ? "#0f1011" : "#f1f5f9"}`,
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: isDark ? "#2a2c30" : "#94a3b8",
        },
        scrollbarWidth: "thin",
        scrollbarColor: isDark ? "#1c1d1f #0f1011" : "#cbd5e1 #f1f5f9",
      }}
    >
      {incidents.map((inc) => {
        const isNew = inc.isNewAlert;

        return (
          <Card
            key={inc.id}
            sx={{
              background: DARK.card,
              border: `1px solid ${isNew ? "#ff4d4d80" : DARK.border}`,
              boxShadow: isNew ? "0 0 12px 2px rgba(255,60,60,0.30)" : "none",
              transition: "0.2s",
              margin: "10px",
              "&:hover": { background: DARK.hover },
            }}
            className={isNew ? "animate-pulse-slow" : ""}
          >
            <CardHeader
              title={
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium" style={{ color: DARK.text }}>
                      {inc.name}
                    </p>
                    <p className="text-xs" style={{ color: DARK.muted }}>
                      {inc.id}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusTag status={inc.status} />
                    {isNew && (
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                    )}
                    <Button
                      size="small"
                      onClick={toggleSiren}
                      sx={{
                        minWidth: "32px",
                        color: isMuted ? "#9ca3af" : "#ff4d4d",
                      }}
                    >
                      <SafeIcon
                        name={isMuted ? "VolumeX" : "Volume2"}
                        className="h-4 w-4"
                      />
                    </Button>
                    <span className="text-[10px]" style={{ color: DARK.muted }}>
                      {formatTime(inc.timeReported)}
                    </span>
                  </div>
                </div>
              }
            />

            <CardContent className="text-sm space-y-1.5">
              <div className="flex gap-2">
                <SafeIcon name="MapPin" className="h-4 w-4 text-gray-500" />
                <span style={{ color: DARK.muted }}>Location:</span>
                <span style={{ color: DARK.text }}>{inc.location}</span>
              </div>
              <div className="flex gap-2">
                <SafeIcon name="Crosshair" className="h-4 w-4 text-gray-500" />
                <span style={{ color: DARK.muted }}>Coordinates:</span>
                <span className="font-mono text-[11px]" style={{ color: DARK.text }}>
                  {inc.coordinates.lat}, {inc.coordinates.lng}
                </span>
              </div>
            </CardContent>

            <CardFooter className="flex gap-2 px-4 pb-4">
              {isNew && (
                <Button
                  fullWidth
                  size="small"
                  onClick={() => acknowledge(inc.id)}
                  sx={{
                    background: "#ff4444",
                    color: "#fff",
                    fontWeight: 600,
                    "&:hover": { background: "#e63939" },
                  }}
                >
                  <SafeIcon name="Check" className="mr-2 h-4 w-4" />
                  Acknowledge
                </Button>
              )}
              <Button
                fullWidth
                size="small"
                onClick={() => viewDetails(inc.id)}
                variant={isNew ? "outlined" : "contained"}
                sx={{
                  borderColor: isNew ? "#ff4d4d" : "transparent",
                  color: isNew ? "#ff6b6b" : "#fff",
                  background: isNew ? "transparent" : "#2563eb",
                }}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        );
      })}

      <Divider sx={{ borderColor: DARK.border }} />

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={closeDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            background: DARK.dialogBg,
            borderRadius: "12px",
            border: `1px solid ${DARK.dialogBorder}`,
            boxShadow: "0 0 30px rgba(255,0,0,0.15)",
            color: DARK.text,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${DARK.dialogBorder}`,
            px: 3,
            py: 2.5,
          }}
        >
          <div>
            <div className="text-lg font-semibold" style={{ color: DARK.text }}>
              Incident Details
            </div>
            <div className="text-xs" style={{ color: DARK.muted }}>
              {selectedIncident?.id}
            </div>
          </div>
          {selectedIncident && <StatusTag status={selectedIncident.status} />}
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 3 }}>
          {selectedIncident && (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <Section title="Incident Info">
                <Row label="Name" value={selectedIncident.name} />
                <Row label="Type" value={selectedIncident.type} />
                <Row label="Status">
                  <StatusTag status={selectedIncident.status} />
                </Row>
              </Section>
              <Section title="Location Info">
                <Row label="Address" value={selectedIncident.location} />
                <Row label="Coordinates" mono
                  value={`${selectedIncident.coordinates.lat}, ${selectedIncident.coordinates.lng}`}
                />
                <Row label="Station" value={selectedIncident.coordinates.stationName} />
              </Section>
              <Section full title="Timeline">
                <Row label="Reported At" value={new Date(selectedIncident.timeReported).toLocaleString()} />
                <Row label="Alert State" value={selectedIncident.isNewAlert ? "New Alert" : "Acknowledged"} />
              </Section>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ borderTop: `1px solid ${DARK.dialogBorder}`, px: 3, py: 2 }}>
          <Button
            onClick={closeDialog}
            sx={{
              border: "1px solid #ff4d4d",
              color: "#ff6b6b",
              px: 4,
              fontWeight: 600,
              "&:hover": { background: "rgba(255,77,77,0.1)" },
            }}
          >
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}