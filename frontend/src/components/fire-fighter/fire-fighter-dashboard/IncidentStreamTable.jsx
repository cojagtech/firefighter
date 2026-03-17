import React, { useState, useMemo, useEffect } from "react";
import { Eye, List, ArrowUpDown } from "lucide-react";
import {
  Box, Card, CardContent, CardHeader, Typography,
  Table, TableBody, TableCell, TableHead, TableRow,
  TableSortLabel, Chip, Button, Alert, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";

const StatusChip = ({ status }) => {
  const variants = {
    new: { bg: "rgba(255,50,50,0.25)", color: "#ff5252", label: "New" },
    "in-progress": { bg: "rgba(255,153,0,0.25)", color: "#ffa726", label: "In Progress" },
    assigned: { bg: "rgba(0,123,255,0.25)", color: "#42a5f5", label: "Assigned" },
    closed: { bg: "rgba(128,0,255,0.25)", color: "#b388ff", label: "Closed" },
    active: { bg: "rgba(255,0,0,0.25)", color: "#ff5252", label: "Active" },
    forwarded: { bg: "rgba(0,200,83,0.25)", color: "#00e676", label: "Forwarded" },
  };
  const s = variants[status] || { bg: "#333", color: "#eee", label: status };
  return (
    <Chip size="small" label={s.label}
      sx={{ background: s.bg, color: s.color, fontWeight: "bold" }}
    />
  );
};

function IncidentTableComponent({ incidents, filter, onFilterChange }) {
  const [sortField, setSortField] = useState("timeReported");
  const [sortDirection, setSortDirection] = useState("desc");
  const [open, setOpen] = useState(false);
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

  const UI = isDark
    ? {
        card: "#121314",
        border: "#1e1f22",
        text: "#eaeaea",
        muted: "#9ca3af",
        head: "#1a1b1e",
        hover: "#1f2124",
        dialogBg: "#121314",
      }
    : {
        card: "#ffffff",
        border: "#e2e8f0",
        text: "#111827",
        muted: "#6b7280",
        head: "#f8fafc",
        hover: "#f1f5f9",
        dialogBg: "#ffffff",
      };

  const handleOpen = (incident) => { setSelectedIncident(incident); setOpen(true); };
  const handleClose = () => { setOpen(false); setSelectedIncident(null); };

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
  };

  const filteredIncidents = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const monthStr = todayStr.slice(0, 7);
    return incidents.filter((i) => {
      if (!i.timeReported) return false;
      const incidentDate = i.timeReported.split(" ")[0];
      if (filter === "today") return incidentDate === todayStr;
      if (filter === "month") return incidentDate.startsWith(monthStr);
      if (filter === "active") return i.status === "active";
      if (filter === "critical") return i.status === "new";
      return true;
    });
  }, [filter, incidents]);

  const sorted = [...filteredIncidents].sort((a, b) => {
    const mod = sortDirection === "asc" ? 1 : -1;
    return a[sortField] > b[sortField] ? mod : -mod;
  });

  const columns = [
    { id: "id", label: "Incident ID" },
    { id: "name", label: "Name" },
    { id: "location", label: "Location" },
    { id: "coordinates", label: "Coordinates", sortable: false },
    { id: "timeReported", label: "Time" },
    { id: "status", label: "Status" },
    { id: "actions", label: "Actions", sortable: false },
  ];

  return (
    <>
      <Card sx={{ background: UI.card, border: `1px solid ${UI.border}`, color: UI.text }}>
        <CardHeader
          title={
            <Typography sx={{ display: "flex", gap: 1, fontWeight: 600, color: UI.text }}>
              <List size={18} /> Incident Stream
            </Typography>
          }
          subheader={
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {["all", "today", "month", "active", "critical"].map((f) => (
                <Button
                  key={f}
                  size="small"
                  variant={filter === f ? "contained" : "outlined"}
                  onClick={() => onFilterChange(f)}
                  sx={{
                    textTransform: "none",
                    borderColor: isDark ? "#2E2E2E" : "#e2e8f0",
                    backgroundColor: filter === f ? "#dc2626" : "transparent",
                    color: filter === f ? "#fff" : UI.text,
                    "&:hover": {
                      backgroundColor: filter === f ? "#b91c1c" : isDark ? "#1f2124" : "#f1f5f9",
                    },
                  }}
                >
                  {f.toUpperCase()}
                </Button>
              ))}
            </Stack>
          }
        />

        <CardContent sx={{ p: 0 }}>
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: UI.head }}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      onClick={() => col.sortable !== false && handleSort(col.id)}
                      sx={{ fontWeight: 600, color: UI.text, borderBottom: `1px solid ${UI.border}` }}
                    >
                      {col.label}
                      {col.sortable !== false && (
                        <TableSortLabel
                          active={sortField === col.id}
                          direction={sortDirection}
                          IconComponent={() => <ArrowUpDown size={12} />}
                        />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {sorted.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ p: 4, borderBottom: "none" }}>
                      <Alert severity="info">No incidents found</Alert>
                    </TableCell>
                  </TableRow>
                )}

                {sorted.map((i) => (
                  <TableRow
                    key={i.id}
                    sx={{
                      "&:hover": { background: UI.hover },
                      borderBottom: `1px solid ${UI.border}`,
                    }}
                  >
                    <TableCell sx={{ color: UI.text, borderBottom: "none" }}>{i.id}</TableCell>
                    <TableCell sx={{ color: UI.text, borderBottom: "none" }}>{i.name}</TableCell>
                    <TableCell sx={{ color: UI.muted, borderBottom: "none" }}>{i.location}</TableCell>
                    <TableCell sx={{ fontSize: 12, color: UI.muted, borderBottom: "none" }}>
                      {Number(i.latitude).toFixed(4)}, {Number(i.longitude).toFixed(4)}
                    </TableCell>
                    <TableCell sx={{ color: UI.muted, borderBottom: "none" }}>{i.timeReported}</TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      <StatusChip status={i.status} />
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      <Button
                        size="small"
                        startIcon={<Eye size={14} />}
                        onClick={() => handleOpen(i)}
                        sx={{ color: "#ff5252", "&:hover": { color: "#ff8080" } }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: UI.dialogBg,
            color: UI.text,
            borderRadius: 3,
            border: `1px solid ${UI.border}`,
          },
        }}
      >
        {selectedIncident && (
          <>
            <DialogTitle sx={{ fontWeight: 600, color: UI.text, borderBottom: `1px solid ${UI.border}` }}>
              Incident Details — {selectedIncident.id}
            </DialogTitle>

            <DialogContent dividers sx={{ borderColor: UI.border }}>
              <Typography variant="h6" sx={{ color: "#ff5252", mb: 2 }}>INCIDENT INFO</Typography>
              <Typography sx={{ color: UI.text }}>Name: {selectedIncident.name}</Typography>
              <Typography sx={{ color: UI.text }}>Location: {selectedIncident.location}</Typography>
              <Typography sx={{ color: UI.text }}>
                Coordinates: {selectedIncident.latitude}, {selectedIncident.longitude}
              </Typography>
              <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <Typography fontWeight={500} sx={{ color: UI.text }}>Status:</Typography>
                <StatusChip status={selectedIncident.status} />
              </Box>

              <Typography variant="h6" sx={{ color: "#ff5252", mt: 4, mb: 2 }}>TIMELINE</Typography>
              <Typography sx={{ color: UI.text }}>Reported At: {selectedIncident.timeReported}</Typography>
              <Typography sx={{ color: UI.text }}>Station: {selectedIncident.stationName}</Typography>
            </DialogContent>

            <DialogActions sx={{ borderTop: `1px solid ${UI.border}` }}>
              <Button
                onClick={handleClose}
                variant="outlined"
                sx={{
                  borderColor: "#ff5252",
                  color: "#ff5252",
                  "&:hover": { backgroundColor: "rgba(255,82,82,0.1)" },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}

export default function IncidentStreamTable({ incidents, filter, onFilterChange }) {
  return (
    <IncidentTableComponent
      incidents={incidents}
      filter={filter}
      onFilterChange={onFilterChange}
    />
  );
}