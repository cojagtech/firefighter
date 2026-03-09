import React from "react";
import VTSLivePanel from "./VTSLivePanel";
import DroneLivePanel from "./DroneLivePanel";
import DroneCameraPanel from "./DroneCameraPanel";
import DetectionAlert from "./DigitalTwinPanel";

export default function CommandPanelGrid({
  onMaximizeVTS,
  onMaximizeDroneLocation,
  onMaximizeDroneCamera,
  onMaximize3DTwin
}) {
  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <VTSLivePanel onMaximize={onMaximizeVTS} />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <DroneLivePanel onMaximize={onMaximizeDroneLocation} />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <DroneCameraPanel onMaximize={onMaximizeDroneCamera} />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <DigitalTwinPanel onMaximize={onMaximize3DTwin} />
      </div>
    </div>
  );
}
