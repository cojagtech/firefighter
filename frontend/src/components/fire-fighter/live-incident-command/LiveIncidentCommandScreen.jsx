"use client";

import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import SafeIcon from "@/components/common/SafeIcon";
import CommandToolbar from "./CommandToolbar";
import VTSLivePanel from "./VTSLivePanel";
import DroneLivePanel from "./DroneLivePanel";
import DroneCameraPanel from "./DroneCameraPanel";
import DetectionAlert from "./DetectionAlert";
import { Button } from "@mui/material";

export default function LiveIncidentCommandScreen() {
  const { state } = useLocation();
  const { incidentId, droneId, vehicleDeviceId } = useParams();
  const navigate = useNavigate();

  const incident = state?.incident;
  const selectedVehicles = state?.selectedVehicles || [];
  const selectedDrones = state?.selectedDrones || [];

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

  useEffect(() => {
    if (!incident) {
      navigate("/firefighter-dashboard");
    }
  }, [incident, navigate]);

  if (!incident) return null;

  const [layout, setLayout] = useState("split");
  const [activePanel, setActivePanel] = useState(null);
  const [focusedPanel, setFocusedPanel] = useState("vts");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ✅ All logic unchanged
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
    if (mode === "focus") setFocusedPanel("vts");
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
  const mainBg = isDark ? "#0A0A0A" : "#e2e8f0";

  const renderPanel = (key, Component, clickable = false) => (
    <div
      style={{ backgroundColor: panelBg }}
      className={`rounded-lg h-full min-h-0 overflow-hidden ${
        clickable ? "cursor-pointer hover:ring-2 hover:ring-red-500" : ""
      }`}
      onClick={clickable ? () => handleFocusChange(key) : undefined}
    >
      <Component
        incident={incident}
        selectedVehicles={selectedVehicles}
        selectedDrones={selectedDrones}
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
        incidentId={incident.id}
        incidentName={incident.name}
      />

      <div
        className="flex-1 min-h-[calc(160vh-168px)] overflow-visible p-4"
        style={{ backgroundColor: mainBg }}
      >
        {/* Split Layout */}
        {layout === "split" && (
          <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
            {renderPanel("vts", VTSLivePanel)}
            {renderPanel("drone-location", DroneLivePanel)}
            {renderPanel("drone-camera", DroneCameraPanel)}
            {renderPanel("3d-twin", DetectionAlert)}
          </div>
        )}

        {/* Focus Layout */}
        {layout === "focus" && (
          <div className="flex flex-col gap-3 h-full">
            <div className="h-[50%] min-h-0">
              {focusedPanel === "vts" && renderPanel("vts", VTSLivePanel)}
              {focusedPanel === "drone-location" &&
                renderPanel("drone-location", DroneLivePanel)}
              {focusedPanel === "drone-camera" &&
                renderPanel("drone-camera", DroneCameraPanel)}
              {focusedPanel === "3d-twin" &&
                renderPanel("3d-twin", DetectionAlert)}
            </div>

            <div className="h-[40%] grid grid-cols-3 gap-2">
              {focusedPanel !== "vts" && renderPanel("vts", VTSLivePanel, true)}
              {focusedPanel !== "drone-location" &&
                renderPanel("drone-location", DroneLivePanel, true)}
              {focusedPanel !== "drone-camera" &&
                renderPanel("drone-camera", DroneCameraPanel, true)}
              {focusedPanel !== "3d-twin" &&
                renderPanel("3d-twin", DetectionAlert, true)}
            </div>
          </div>
        )}

        {/* Full Layout */}
        {layout === "full" && (
          <div className="flex flex-col gap-4 h-full">
            <div className="h-[75%] min-h-0">
              {focusedPanel === "vts" && renderPanel("vts", VTSLivePanel)}
              {focusedPanel === "drone-location" &&
                renderPanel("drone-location", DroneLivePanel)}
              {focusedPanel === "drone-camera" &&
                renderPanel("drone-camera", DroneCameraPanel)}
              {focusedPanel === "3d-twin" &&
                renderPanel("3d-twin", DetectionAlert)}
            </div>

            <div className="h-[25%] grid grid-cols-3 gap-2">
              {focusedPanel !== "vts" && renderPanel("vts", VTSLivePanel, true)}
              {focusedPanel !== "drone-location" &&
                renderPanel("drone-location", DroneLivePanel, true)}
              {focusedPanel !== "drone-camera" &&
                renderPanel("drone-camera", DroneCameraPanel, true)}
              {focusedPanel !== "3d-twin" &&
                renderPanel("3d-twin", DetectionAlert, true)}
            </div>

            <div className="flex justify-center pt-2">
              <Button
                variant="outlined"
                onClick={minimizePanel}
                startIcon={<SafeIcon name="Minimize2" />}
                sx={{
                  borderColor: isDark ? "#444" : "#e2e8f0",
                  color: isDark ? "#ffffff" : "#111827",
                  "&:hover": {
                    borderColor: "#ef4444",
                    color: "#ef4444",
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