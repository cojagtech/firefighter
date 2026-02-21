import React, { useState, useMemo } from "react";
import { Eye, List, ArrowUpDown } from "lucide-react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  Button,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

/* ---------------- STATUS CHIP ---------------- */

const StatusChip = ({ status }) => {
  const variants = {
    new: { bg: "rgba(255,50,50,0.25)", color: "#ff5252", label: "New" },
    "in-progress": {
      bg: "rgba(255,153,0,0.25)",
      color: "#ffa726",
      label: "In Progress",
    },
    assigned: {
      bg: "rgba(0,123,255,0.25)",
      color: "#42a5f5",
      label: "Assigned",
    },
    closed: { bg: "rgba(128,0,255,0.25)", color: "#b388ff", label: "Closed" },
    active: { bg: "rgba(255,0,0,0.25)", color: "#ff5252", label: "Active" },
    forwarded: {
      bg: "rgba(0,200,83,0.25)",
      color: "#00e676",
      label: "Forwarded",
    },
  };

  const s = variants[status] || { bg: "#333", color: "#eee", label: status };

  return (
    <Chip
      size="small"
      label={s.label}
      sx={{ background: s.bg, color: s.color, fontWeight: "bold" }}
    />
  );
};

/* ---------------- MAIN TABLE COMPONENT ---------------- */

function IncidentTableComponent({ incidents, filter, onFilterChange }) {
  const [sortField, setSortField] = useState("timeReported");
  const [sortDirection, setSortDirection] = useState("desc");

  const [open, setOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const handleOpen = (incident) => {
    setSelectedIncident(incident);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedIncident(null);
  };

  const handleSort = (field) => {
    if (sortField === field)
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDirection("asc");
    }
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
      <Card
        sx={{
          background: "#121314",
          border: "1px solid #1e1f22",
          color: "#eaeaea",
        }}
      >
        <CardHeader
          title={
            <Typography sx={{ display: "flex", gap: 1, fontWeight: 600 }}>
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
                    borderColor: "#2E2E2E",
                    backgroundColor:
                      filter === f ? "#dc2626" : "transparent",
                    color: "#fff",
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
                <TableRow>
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      onClick={() =>
                        col.sortable !== false && handleSort(col.id)
                      }
                      sx={{ fontWeight: 600 }}
                    >
                      {col.label}
                      {col.sortable !== false && (
                        <TableSortLabel
                          active={sortField === col.id}
                          direction={sortDirection}
                          IconComponent={() => (
                            <ArrowUpDown size={12} />
                          )}
                        />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {sorted.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ p: 4 }}>
                      <Alert severity="info">
                        No incidents found
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}

                {sorted.map((i) => (
                  <TableRow key={i.id} hover>
                    <TableCell>{i.id}</TableCell>
                    <TableCell>{i.name}</TableCell>
                    <TableCell>{i.location}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {Number(i.latitude).toFixed(4)},
                      {Number(i.longitude).toFixed(4)}
                    </TableCell>
                    <TableCell>{i.timeReported}</TableCell>
                    <TableCell>
                      <StatusChip status={i.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<Eye size={14} />}
                        onClick={() => handleOpen(i)}
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

      {/* ---------------- MODAL ---------------- */}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: "#121314",
            color: "#fff",
            borderRadius: 3,
            border: "1px solid #1e1f22",
          },
        }}
      >
        {selectedIncident && (
          <>
            <DialogTitle sx={{ fontWeight: 600 }}>
              Incident Details — {selectedIncident.id}
            </DialogTitle>

            <DialogContent dividers>
              {/* INCIDENT INFO */}
              <Typography variant="h6" sx={{ color: "#ff5252", mb: 2 }}>
                INCIDENT INFO
              </Typography>

              <Typography>Name: {selectedIncident.name}</Typography>
              <Typography>
                Location: {selectedIncident.location}
              </Typography>
              <Typography>
                Coordinates: {selectedIncident.latitude},{" "}
                {selectedIncident.longitude}
              </Typography>

              {/* FIXED STATUS (No div inside p error) */}
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography fontWeight={500}>Status:</Typography>
                <StatusChip status={selectedIncident.status} />
              </Box>

              {/* TIMELINE */}
              <Typography
                variant="h6"
                sx={{ color: "#ff5252", mt: 4, mb: 2 }}
              >
                TIMELINE
              </Typography>

              <Typography>
                Reported At: {selectedIncident.timeReported}
              </Typography>

              <Typography>
                Station: {selectedIncident.stationName}
              </Typography>
            </DialogContent>

            <DialogActions>
              <Button
                onClick={handleClose}
                variant="outlined"
                sx={{
                  borderColor: "#ff5252",
                  color: "#ff5252",
                  "&:hover": {
                    backgroundColor: "rgba(255,82,82,0.1)",
                  },
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

/* ---------------- EXPORT ---------------- */

export default function IncidentStreamTable({
  incidents,
  filter,
  onFilterChange,
}) {
  return (
    <IncidentTableComponent
      incidents={incidents}
      filter={filter}
      onFilterChange={onFilterChange}
    />
  );
}