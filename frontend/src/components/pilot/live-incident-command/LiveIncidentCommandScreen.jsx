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

  // ✅ URL → state sync
  useEffect(() => {
    if (droneId) {
      setSelectedDrone(droneId);
    }
  }, [droneId]);

  // ✅ state → URL sync (MAIN FIX)
  useEffect(() => {
    if (selectedDrone && !droneId) {
      navigate(`/pilot-live-incident-command/${selectedDrone}`, {
        replace: true,
      });
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

  const renderPanel = (key, Component, clickable = false) => (
    <div
      className={`rounded-lg h-full min-h-0 overflow-hidden bg-[#1F1F1F] ${
        clickable ? "cursor-pointer hover:ring-2 hover:ring-red-500" : ""
      }`}
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
    <div className="h-screen flex flex-col bg-background">

      <CommandToolbar
        layout={layout}
        onLayoutChange={changeLayout}
        onFullscreen={enterBrowserFullscreen}
        onExitFullscreen={exitBrowserFullscreen}
        isFullscreen={isFullscreen}
        selectedDrone={selectedDrone}
        onDroneChange={setSelectedDrone}
      />

      <div className="flex-1 p-4 bg-[#0A0A0A]">

        {layout === "split" && (
          <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[50%]">
            <div>{renderPanel("drone-location", DroneLivePanel)}</div>
            <div>{renderPanel("drone-camera", DroneCameraPanel)}</div>
            <div>{renderPanel("3d-twin", DetectionAlert)}</div>
          </div>
        )}

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