import React from "react";
import SafeIcon from "@/components/common/SafeIcon";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Chip,
  Menu,
  MenuItem,
  Divider,
  IconButton,
} from "@mui/material";

export default function CommandToolbar({
  layout,
  onLayoutChange,
  onFullscreen,
  onExitFullscreen,
  isFullscreen,
  incidentId,
  incidentName,
}) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  return (
    <div className="bg-[#141414] backdrop-blur-sm p-4 border-b border-[#1f1f1f]">
      <div className="flex items-center justify-between gap-4">

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#291818] border border-[#dc2626]">
            <SafeIcon name="AlertTriangle" className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{incidentName}</p>
            <p className="text-xs text-muted-foreground font-mono">{incidentId}</p>
          </div>

          <Chip
            label={
              <span className="flex items-center gap-1">
                <span className="mr-1.5 h-2 w-2 rounded-full bg-white"></span>
                LIVE
              </span>
            }
            color="error"
            className="ml-2 animate-pulse"
            size="small"
          />
        </div>

        <div className="flex items-center gap-2">

          <Button
            variant={layout === "split" ? "contained" : "outlined"}
            size="small"
            onClick={() => onLayoutChange("split")}
            sx={layout === "split" ? { backgroundColor: "#dc2626" } : {}}
          >
            <SafeIcon name="LayoutGrid" className="mr-2 h-4 w-4" />
            Split
          </Button>

          <Button
            variant={layout === "full" ? "contained" : "outlined"}
            size="small"
            onClick={() => onLayoutChange("full")}
            sx={layout === "full" ? { backgroundColor: "#dc2626" } : {}}
          >
            <SafeIcon name="Maximize2" className="mr-2 h-4 w-4" />
            Full
          </Button>

          <Button
            variant={layout === "focus" ? "contained" : "outlined"}
            size="small"
            onClick={() => onLayoutChange("focus")}
            sx={layout === "focus" ? { backgroundColor: "#dc2626" } : {}}
          >
            <SafeIcon name="Focus" className="mr-2 h-4 w-4" />
            Focus
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              window.location.href = "http://13.127.220.89:8081/";
            }}
            sx={{ ml: 1 }}
          >
            Control Panel
          </Button>
        </div>

        <div className="flex items-center gap-2">

          <Button
            variant="outlined"
            size="small"
            onClick={isFullscreen ? onExitFullscreen : onFullscreen}
          >
            <SafeIcon
              name={isFullscreen ? "Minimize2" : "Maximize"}
              className="h-4 w-4"
            />
          </Button>

          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <SafeIcon name="MoreVertical" className="h-4 w-4" />
          </IconButton>

          <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
            <span className="px-4 py-2 text-xs text-muted-foreground font-semibold">
              Command Options
            </span>
            <Divider />

            <MenuItem onClick={() => setAnchorEl(null)}>
              <SafeIcon name="Download" className="mr-2 h-4 w-4" /> Export Report
            </MenuItem>

            <MenuItem onClick={() => setAnchorEl(null)}>
              <SafeIcon name="Share2" className="mr-2 h-4 w-4" /> Share Feed
            </MenuItem>

            <MenuItem onClick={() => setAnchorEl(null)}>
              <SafeIcon name="Settings" className="mr-2 h-4 w-4" /> Panel Settings
            </MenuItem>

            <Divider />

            <MenuItem
              sx={{ color: "error.main" }}
              onClick={() => setAnchorEl(null)}
            >
              <SafeIcon name="LogOut" className="mr-2 h-4 w-4" /> End Mission
            </MenuItem>
          </Menu>

          <Button
            size="small"
            startIcon={<ArrowBackIcon />}
            sx={{
              color: "text.secondary",
              ":hover": { backgroundColor: "#dc2626", color: "white" },
            }}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
