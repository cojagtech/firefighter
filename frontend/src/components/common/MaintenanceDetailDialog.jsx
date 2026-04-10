import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FlightIcon from "@mui/icons-material/Flight";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import PersonIcon from "@mui/icons-material/Person";
import BuildIcon from "@mui/icons-material/Build";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useTheme } from "@/Context/ThemeContext";

const InfoRow = ({ icon, title, value, isDark }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: 1.5,
      py: 1.4,
      borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
    }}
  >
    <Box sx={{ mt: 0.3, color: "#ff5252", flexShrink: 0 }}>
      {icon}
    </Box>
    <Box>
      <Typography
        fontSize={11}
        fontWeight={500}
        sx={{ color: isDark ? "#6b7280" : "#9ca3af", letterSpacing: 0.5, textTransform: "uppercase" }}
      >
        {title}
      </Typography>
      <Typography
        fontSize={14}
        fontWeight={500}
        sx={{ color: isDark ? "#e5e7eb" : "#111827", mt: 0.3 }}
      >
        {value || "—"}
      </Typography>
    </Box>
  </Box>
);

const statusConfig = {
  pending:    { label: "Pending",    darkBg: "#78350f", lightBg: "#fef3c7", darkText: "#fcd34d", lightText: "#92400e" },
  scheduled:  { label: "Scheduled",  darkBg: "#1e3a5f", lightBg: "#dbeafe", darkText: "#93c5fd", lightText: "#1e40af" },
  completed:  { label: "Completed",  darkBg: "#166534", lightBg: "#dcfce7", darkText: "#86efac", lightText: "#166534" },
  cancelled:  { label: "Cancelled",  darkBg: "#7f1d1d", lightBg: "#fee2e2", darkText: "#fca5a5", lightText: "#991b1b" },
};

export default function MaintenanceDetailDialog({ selectedNotification, onClose }) {
  const { isDark } = useTheme();

  if (!selectedNotification) return null;

  const data = JSON.parse(selectedNotification.data || "{}");
  const statusKey = (data.status || "").toLowerCase();
  const status = statusConfig[statusKey] || statusConfig.pending;

  const dialogBg    = isDark ? "#0d0d0d" : "#ffffff";
  const leftPanelBg = isDark ? "#111111" : "#fafafa";
  const borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const subtitleColor = isDark ? "#9ca3af" : "#6b7280";

  return (
    <Dialog
      open={Boolean(selectedNotification)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
        },
      }}
      PaperProps={{
        sx: {
          background: dialogBg,
          borderRadius: "16px",
          overflow: "hidden",
          border: `1px solid ${borderColor}`,
          boxShadow: isDark
            ? "0 25px 80px rgba(0,0,0,0.9)"
            : "0 20px 60px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* CLOSE */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 10,
          color: subtitleColor,
          "&:hover": {
            color: isDark ? "#fff" : "#111",
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>

        {/* LEFT PANEL */}
        <Box
          sx={{
            width: { md: "36%" },
            background: leftPanelBg,
            borderRight: { md: `1px solid ${borderColor}` },
            borderBottom: { xs: `1px solid ${borderColor}`, md: "none" },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pt: 5,
            pb: 4,
            px: 3,
            position: "relative",
          }}
        >
          {/* Red top accent */}
          <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "#b71c1c" }} />

          <Avatar sx={{ width: 72, height: 72, mb: 2, background: "#b71c1c", color: "#fff" }}>
            <BuildIcon sx={{ fontSize: 32 }} />
          </Avatar>

          <Typography fontWeight={500} fontSize={16} sx={{ color: isDark ? "#ffffff" : "#111827", textAlign: "center" }}>
            {data.drone_name || "—"}
          </Typography>

          <Typography fontSize={12} sx={{ color: subtitleColor, mt: 0.5, mb: 2.5, textAlign: "center" }}>
            {data.drone_code || "—"}
          </Typography>

          <Chip
            label={status.label}
            size="small"
            sx={{
              background: isDark ? status.darkBg : status.lightBg,
              color: isDark ? status.darkText : status.lightText,
              fontWeight: 500,
              fontSize: 12,
              px: 1,
            }}
          />

          {/* <Divider sx={{ width: "100%", mt: 3, borderColor: borderColor }} />

          <Box sx={{ mt: 2.5, width: "100%" }}>
            <Typography fontSize={11} fontWeight={500} sx={{ color: subtitleColor, textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}>
              Station
            </Typography>
            <Typography fontSize={14} fontWeight={500} sx={{ color: isDark ? "#e5e7eb" : "#111827" }}>
              {data.station || "—"}
            </Typography>
          </Box> */}
        </Box>

        {/* RIGHT PANEL */}
        <Box sx={{ flex: 1, px: 3.5, py: 4 }}>
          <Typography fontSize={16} fontWeight={500} sx={{ color: "#ff5252", textTransform: "uppercase", letterSpacing: 1, mb: 2 }}>
            Maintenance Details
          </Typography>

          <InfoRow icon={<FlightIcon sx={{ fontSize: 18 }} />}           title="Drone Code"   value={data.drone_code}        isDark={isDark} />
          <InfoRow icon={<LocalFireDepartmentIcon sx={{ fontSize: 18 }} />} title="Station"   value={data.station}           isDark={isDark} />
          <InfoRow icon={<PersonIcon sx={{ fontSize: 18 }} />}           title="Reported By"  value={data.reported_by}       isDark={isDark} />
          <InfoRow icon={<BuildIcon sx={{ fontSize: 18 }} />}            title="Issue"        value={data.issue_description} isDark={isDark} />
          <InfoRow icon={<CalendarTodayIcon sx={{ fontSize: 18 }} />}    title="Scheduled"    value={data.scheduled_date}    isDark={isDark} />
          <InfoRow icon={<NotificationsIcon sx={{ fontSize: 18 }} />}    title="Message"      value={selectedNotification.message} isDark={isDark} />
        </Box>

      </Box>
    </Dialog>
  );
}