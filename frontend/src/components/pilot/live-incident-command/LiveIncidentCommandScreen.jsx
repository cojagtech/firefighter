"use client";

import React, { useState, useEffect } from "react";
import SafeIcon from "@/components/common/SafeIcon";
import CommandToolbar from "./CommandToolbar";
import DroneLivePanel from "./DroneLivePanel";
import DroneCameraPanel from "./DroneCameraPanel";
import DetectionAlert from "./DetectionAlert";
import { Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

export default function LiveIncidentCommandScreen() {
  const { droneId } = useParams();
  const navigate = useNavigate();

  const [selectedDrone, setSelectedDrone] = useState("");
  const selectedVehicles = [];

  const [layout, setLayout] = useState("split");
  const [activePanel, setActivePanel] = useState(null);
  const [focusedPanel, setFocusedPanel] = useState("drone-location");
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // ✅ All logic unchanged
  useEffect(() => {
    if (droneId) setSelectedDrone(droneId);
  }, [droneId]);

  useEffect(() => {
    if (selectedDrone && !droneId) {
      navigate(`/pilot-live-incident-command/${selectedDrone}`, { replace: true });
    }
  }, [selectedDrone, droneId]);

  const maximizePanel = (panelKey) => {
    setActivePanel(panelKey);
    setFocusedPanel(panelKey);
    setLayout("full");
  };

  const minimizePanel = () => {
    setActivePanel(null);
    setLayout("split");
  };

  const changeLayout = (mode) => {
    setLayout(mode);
    setActivePanel(null);
    if (mode === "focus") setFocusedPanel("drone-location");
  };

  const handleFocusChange = (panelKey) => {
    if (layout === "focus" || layout === "full") {
      setFocusedPanel(panelKey);
      setActivePanel(panelKey);
    }
  };

  const enterBrowserFullscreen = () => {
    document.documentElement.requestFullscreen?.();
  };

  const exitBrowserFullscreen = () => {
    document.exitFullscreen?.();
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const panelBg = isDark ? "#1F1F1F" : "#f1f5f9";
  const pageBg = isDark ? "#0A0A0A" : "#f8fafc";

  const renderPanel = (key, Component, clickable = false) => (
    <div
      className={`rounded-lg h-full min-h-0 overflow-hidden ${
        clickable ? "cursor-pointer hover:ring-2 hover:ring-red-500" : ""
      }`}
      style={{ backgroundColor: panelBg }}
      onClick={clickable ? () => handleFocusChange(key) : undefined}
    >
      <Component
        selectedVehicles={selectedVehicles}
        selectedDrone={selectedDrone}
        onMaximize={() => maximizePanel(key)}
        isMaximized={layout === "full" && activePanel === key}
        onExit={minimizePanel}
      />
    </div>
  );

  return (
    <div
      className="h-screen flex flex-col"
      style={{ backgroundColor: isDark ? "#0A0A0A" : "#f8fafc" }}
    >
      <CommandToolbar
        layout={layout}
        onLayoutChange={changeLayout}
        onFullscreen={enterBrowserFullscreen}
        onExitFullscreen={exitBrowserFullscreen}
        isFullscreen={isFullscreen}
        selectedDrone={selectedDrone}
        onDroneChange={setSelectedDrone}
      />

      <div
        className="flex-1 p-4"
        style={{ backgroundColor: pageBg }}
      >
        {/* Split Layout */}
        {layout === "split" && (
          <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[50%]">
            <div>{renderPanel("drone-location", DroneLivePanel)}</div>
            <div>{renderPanel("drone-camera", DroneCameraPanel)}</div>
            <div>{renderPanel("3d-twin", DetectionAlert)}</div>
          </div>
        )}

        {/* Focus Layout */}
        {layout === "focus" && (
          <div className="flex flex-col gap-3 h-full">
            <div className="h-[60%]">
              {focusedPanel === "drone-location" && renderPanel("drone-location", DroneLivePanel)}
              {focusedPanel === "drone-camera" && renderPanel("drone-camera", DroneCameraPanel)}
              {focusedPanel === "3d-twin" && renderPanel("3d-twin", DetectionAlert)}
            </div>
            <div className="h-[35%] grid grid-cols-2 gap-2">
              {focusedPanel !== "drone-location" && renderPanel("drone-location", DroneLivePanel, true)}
              {focusedPanel !== "drone-camera" && renderPanel("drone-camera", DroneCameraPanel, true)}
              {focusedPanel !== "3d-twin" && renderPanel("3d-twin", DetectionAlert, true)}
            </div>
          </div>
        )}

        {/* Full Layout */}
        {layout === "full" && (
          <div className="flex flex-col gap-4 h-full">
            <div className="h-[75%]">
              {focusedPanel === "drone-location" && renderPanel("drone-location", DroneLivePanel)}
              {focusedPanel === "drone-camera" && renderPanel("drone-camera", DroneCameraPanel)}
              {focusedPanel === "3d-twin" && renderPanel("3d-twin", DetectionAlert)}
            </div>
            <div className="h-[25%] grid grid-cols-2 gap-2">
              {focusedPanel !== "drone-location" && renderPanel("drone-location", DroneLivePanel, true)}
              {focusedPanel !== "drone-camera" && renderPanel("drone-camera", DroneCameraPanel, true)}
              {focusedPanel !== "3d-twin" && renderPanel("3d-twin", DetectionAlert, true)}
            </div>
            <div className="flex justify-center pt-2">
              <Button
                variant="outlined"
                onClick={minimizePanel}
                startIcon={<SafeIcon name="Minimize2" />}
                sx={{
                  borderColor: isDark ? "#2E2E2E" : "#e2e8f0",
                  color: isDark ? "#ffffff" : "#111827",
                  "&:hover": {
                    backgroundColor: isDark ? "#1F1F1F" : "#f1f5f9",
                  },
                }}
              >
                Exit Full View
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}