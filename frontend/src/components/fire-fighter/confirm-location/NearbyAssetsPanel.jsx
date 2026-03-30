import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Box,
  LinearProgress,
} from "@mui/material";

import RadioIcon from "@mui/icons-material/Radio";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import FlightIcon from "@mui/icons-material/Flight";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BuildIcon from "@mui/icons-material/Build";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NearMeIcon from "@mui/icons-material/NearMe";


// 🔥 ICON MAPPING
const getAssetIcon = (type) => {
  switch (type) {
    case "fire-truck":
      return LocalShippingIcon;
    case "drone":
      return FlightIcon;
    default:
      return DirectionsCarIcon;
  }
};


// 🔥 STATUS CONFIG
const getStatusConfig = (status) => {
  switch (status) {
    case "available":
      return {
        label: "Available",
        color: "success",
        icon: <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />,
      };
    case "busy":
      return {
        label: "Busy",
        color: "warning",
        icon: <WarningAmberIcon sx={{ fontSize: 16 }} />,
      };
    case "maintenance":
      return {
        label: "Maintenance",
        color: "error",
        icon: <BuildIcon sx={{ fontSize: 16 }} />,
      };
    default:
      return { label: status || "Unknown", color: "default" };
  }
};


export default function NearbyAssetsPanel({ assets = [] }) {
  // ✅ Only available assets
  const availableAssets = assets
    .filter((a) => a.status === "available")
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 6);

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <RadioIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Nearby Assets
            </Typography>
          </Box>
        }
      />

      <CardContent>
        {availableAssets.length === 0 ? (
          <Typography align="center" color="text.secondary">
            No available assets nearby
          </Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {availableAssets.map((asset) => {
              const Icon = getAssetIcon(asset.type);
              const status = getStatusConfig(asset.status);

              return (
                <Box
                  key={asset.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  <Box display="flex" gap={2}>

                    {/* Icon */}
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Icon fontSize="small" />
                    </Box>

                    {/* Content */}
                    <Box flex={1}>

                      {/* Title + Status */}
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="subtitle2" noWrap>
                          {asset.name}
                        </Typography>
                        <Chip size="small" {...status} />
                      </Box>

                      {/* Distance */}
                      <Box display="flex" justifyContent="space-between" mt={1}>
                        <Box display="flex" gap={0.5} alignItems="center">
                          <NearMeIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption">
                            Distance
                          </Typography>
                        </Box>
                        <Typography variant="caption" fontWeight={600}>
                          {asset.distance} km
                        </Typography>
                      </Box>

                      {/* ETA (for drones) */}
                      {/* {asset.type === "drone" && asset.eta !== undefined && (
                        <Box display="flex" justifyContent="space-between" mt={0.5}>
                          <Box display="flex" gap={0.5} alignItems="center">
                            <AccessTimeIcon sx={{ fontSize: 14 }} />
                            <Typography variant="caption">ETA</Typography>
                          </Box>
                          <Typography variant="caption" fontWeight={600}>
                            {asset.eta} min
                          </Typography>
                        </Box>
                      )} */}

                      {/* Battery */}
                      {/* {asset.type === "drone" && asset.battery !== undefined && (
                        <Box mt={1}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption">Battery</Typography>
                            <Typography variant="caption">
                              {asset.battery}%
                            </Typography>
                          </Box>

                          <LinearProgress
                            variant="determinate"
                            value={asset.battery}
                            sx={{ height: 5, borderRadius: 2 }}
                            color={asset.battery > 20 ? "primary" : "error"}
                          />
                        </Box>
                      )} */}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}