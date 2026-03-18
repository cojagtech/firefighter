import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Chip,
} from "@mui/material";

import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import FlightIcon from "@mui/icons-material/Flight";
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// Shared theme hook
function useIsDark() {
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
  return isDark;
}

export default function SelectionSummary({
  selectedVehicles = [],
  selectedDrones = [],
  canActivate = false,
  onActivate = () => {},
  onBack = () => {},
}) {
  const isDark = useIsDark();

  const C = isDark
    ? {
        cardBg: "#141414",
        cardBorder: "#222222",
        divider: "#2c2c2c",
        sectionHeader: "#aaaaaa",
        backBtnColor: "#dddddd",
        backBtnBorder: "#444444",
      }
    : {
        cardBg: "#ffffff",
        cardBorder: "#e2e8f0",
        divider: "#e2e8f0",
        sectionHeader: "#6b7280",
        backBtnColor: "#111827",
        backBtnBorder: "#e2e8f0",
      };

  const totalDistance = selectedVehicles.reduce(
    (acc, v) => acc + (v.distanceKm || 0),
    0
  );

  const maxEta = Math.max(
    ...[
      ...selectedVehicles.map((v) => v.etaMinutes || 0),
      ...selectedDrones.map((d) => d.etaMinutes || 0),
    ]
  );

  return (
    <Card
      sx={{
        borderRadius: "18px",
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        p: 1,
      }}
    >
      <CardContent sx={{ px: 3, py: 2 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 0.5, fontSize: "1.3rem" }}
        >
          Selection Summary
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Review your asset selection
        </Typography>

        <SummaryBox
          icon={<LocalShippingIcon />}
          label="Vehicle(s)"
          count={selectedVehicles.length}
          isDark={isDark}
        />
        <SummaryBox
          icon={<FlightIcon />}
          label="Drone(s)"
          count={selectedDrones.length}
          isDark={isDark}
        />
        <SummaryBox
          icon={<GroupIcon />}
          label="Crew Member(s)"
          count={selectedVehicles.reduce(
            (acc, v) => acc + (v.crew?.length || 0),
            0
          )}
          last
          isDark={isDark}
        />

        <Divider sx={{ my: 2.5, borderColor: C.divider }} />

        <FlexRow label="Total Distance" value={`${totalDistance.toFixed(1)} km`} />
        <FlexRow label="Max ETA" value={`${maxEta} minutes`} />

        <Divider sx={{ my: 2.5, borderColor: C.divider }} />

        <SectionHeader text="SELECTED VEHICLES" color={C.sectionHeader} />
        {selectedVehicles.map((v) => (
          <SelectedItem
            key={v.id}
            name={v.name}
            rightLabel={`${v.etaMinutes || 0}m`}
            isDark={isDark}
          />
        ))}

        <SectionHeader text="SELECTED DRONE(S)" color={C.sectionHeader} />
        {selectedDrones.map((d) => (
          <SelectedItem
            key={d.id}
            name={d.name}
            rightLabel={`${d.battery || 0}%  ${d.etaMinutes || "—"}m`}
            isDark={isDark}
          />
        ))}

        <StatusBox canActivate={canActivate} />

        <Button
          variant="contained"
          color="error"
          disabled={!canActivate}
          onClick={onActivate}
          fullWidth
          sx={{
            py: 1.5,
            mt: 3,
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.95rem",
            letterSpacing: 0.5,
          }}
        >
          ⚡ ACTIVATE DRONE
        </Button>

        <Button
          variant="outlined"
          onClick={onBack}
          fullWidth
          sx={{
            py: 1.2,
            mt: 1.5,
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.9rem",
            color: C.backBtnColor,
            borderColor: C.backBtnBorder,
            "&:hover": {
              borderColor: "#ef4444",
              color: "#ef4444",
              backgroundColor: "rgba(239,68,68,0.08)",
            },
          }}
        >
          ← Back
        </Button>
      </CardContent>
    </Card>
  );
}

function SummaryBox({ icon, label, count, last, isDark }) {
  return (
    <Box
      sx={{
        border: `1px solid ${isDark ? "#2b2b2b" : "#e2e8f0"}`,
        borderRadius: "10px",
        px: 2,
        py: 1.5,
        mb: last ? 2 : 1.5,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: isDark ? "#1a1a1a" : "#f8fafc",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.3 }}>
        {icon}
        <Typography
          fontWeight={600}
          sx={{ color: isDark ? "#ffffff" : "#111827" }}
        >
          {label}
        </Typography>
      </Box>

      <Chip
        label={count}
        sx={{
          background: isDark ? "rgba(255,255,255,0.07)" : "#e5e7eb",
          color: isDark ? "#dddddd" : "#111827",
          fontWeight: 700,
          borderRadius: "8px",
        }}
        size="small"
      />
    </Box>
  );
}

function FlexRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={700}>{value}</Typography>
    </Box>
  );
}

function SectionHeader({ text, color }) {
  return (
    <Typography
      variant="overline"
      sx={{ color: color, mb: 1, display: "block", fontSize: "0.75rem" }}
    >
      {text}
    </Typography>
  );
}

function SelectedItem({ name, rightLabel, isDark }) {
  return (
    <Box
      sx={{
        border: `1px solid ${isDark ? "#2d2d2d" : "#e2e8f0"}`,
        borderRadius: "8px",
        px: 2,
        py: 1,
        mb: 1,
        background: isDark ? "#1b1b1b" : "#f8fafc",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Typography
        fontWeight={600}
        sx={{ color: isDark ? "#ffffff" : "#111827" }}
      >
        {name}
      </Typography>
      <Typography color="text.secondary">{rightLabel}</Typography>
    </Box>
  );
}

function StatusBox({ canActivate }) {
  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: "10px",
        border: `1px solid ${
          canActivate ? "rgba(0,255,0,0.35)" : "rgba(255,180,0,0.35)"
        }`,
        background: canActivate
          ? "rgba(0,180,0,0.15)"
          : "rgba(255,180,0,0.1)",
        display: "flex",
        gap: 2,
      }}
    >
      {canActivate ? (
        <CheckCircleIcon sx={{ color: "#27C47A" }} />
      ) : (
        <WarningAmberIcon sx={{ color: "#F3C241" }} />
      )}
      <Box>
        <Typography
          fontWeight={700}
          sx={{ color: canActivate ? "#27C47A" : "#F3C241" }}
        >
          {canActivate ? "Ready to Activate" : "Cannot Activate"}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {canActivate
            ? "All requirements met. Click activate to proceed."
            : "Select required assets before activation."}
        </Typography>
      </Box>
    </Box>
  );
}