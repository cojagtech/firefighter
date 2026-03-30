import React, { useEffect, useState } from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const InfoRow = ({ title, value }) => (
  <Box
    sx={{
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      pb: 1.2,
      mb: 1.5,
    }}
  >
    <Typography fontSize={13} fontWeight="bold" sx={{ color: "#e5e7eb" }}>
      {title}
    </Typography>
    <Typography fontSize={14} sx={{ color: "#9ca3af" }}>
      {value || "-"}
    </Typography>
  </Box>
);

export default function ProfileDialog({ open, onClose }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);

        const sessionData = sessionStorage.getItem("fireOpsSession");
        if (!sessionData) return;

        const { userId } = JSON.parse(sessionData);

        const res = await fetch(
          `${API_BASE}/common/login/get_user_profile.php?id=${userId}`
        );

        const data = await res.json();
        setProfileData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [open]);

  const initials = profileData?.fullName
    ? profileData.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "?";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
        },
      }}
      PaperProps={{
        sx: {
          background: "#0a0a0a", // 🔥 PURE BLACK
          borderRadius: "18px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.9)",
        },
      }}
    >
      {/* CLOSE BUTTON */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          color: "#9ca3af",
          "&:hover": {
            color: "#fff",
            background: "rgba(255,255,255,0.08)",
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      {loading ? (
        <Box sx={{ p: 6, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
          
          {/* 🔥 LEFT PANEL */}
          <Box
            sx={{
              width: { md: "35%" },
              p: 5,
              textAlign: "center",
              background: "#111111", // matte black (no blue)
              borderRight: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Avatar
              sx={{
                width: 110,
                height: 110,
                mb: 2,
                fontSize: 34,
                mx: "auto",
                background: "linear-gradient(135deg,#ff4d4d,#b71c1c)",
              }}
            >
              {initials}
            </Avatar>

            <Typography fontWeight="bold" fontSize={20} sx={{ color: "#ffffff" }}>
              {profileData?.fullName}
            </Typography>

            <Typography fontSize={13} sx={{ color: "#9ca3af", mb: 2 }}>
              {profileData?.email}
            </Typography>

            <Chip
              label={profileData?.status === 1 ? "Active" : "Inactive"}
              sx={{
                background:
                  profileData?.status === 1 ? "#166534" : "#7f1d1d",
                color: "#fff",
                fontWeight: "bold",
                px: 1.5,
              }}
            />
          </Box>

          {/* 🔥 RIGHT PANEL */}
          <Box sx={{ flex: 1, px: 5, py: 4 }}>
            <InfoRow title="Designation" value={profileData?.designation} />
            <InfoRow title="Role" value={profileData?.role} />
            <InfoRow title="Station" value={profileData?.station} />
            <InfoRow title="Address" value={profileData?.address} />
            <InfoRow title="Phone" value={profileData?.phone} />
          </Box>

        </Box>
      )}
    </Dialog>
  );
}