import React from "react";
import SafeIcon from "@/components/common/SafeIcon";
import { Button, Chip } from "@mui/material";

export default function DroneCameraPanel({ onMaximize, isMaximized = false, onExit, droneId,}) {

  const liveUrl = droneId ? `http://43.205.31.167:4005/?stream=${droneId}` : null;

  if (!droneId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a drone to view stream
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${isMaximized ? "p-6" : "p-4"}`}>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SafeIcon name="Video" className="h-5 w-5 text-[#dc2626]" />
          <h3 className={`font-semibold ${isMaximized ? "text-xl" : "text-base"}`}>
            Drone Live Camera
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Chip
            label={
              <span className="px-2 py-0.5 text-xs bg-red-600 text-white rounded animate-pulse">
                LIVE
              </span>
            }
            color="error"
            size="small"
            className="animate-pulse text-xs"
          />

          {!isMaximized && onMaximize && (
            <button onClick={onMaximize}>
              <SafeIcon name="Maximize2" className="h-4 w-4" />
            </button>
          )}

          {isMaximized && onExit && (
            <button onClick={onExit}>
              <SafeIcon name="X" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div
        className={`rounded-lg overflow-hidden border-2 border-dashed border border-[#2E2E2E] flex items-center justify-center`}
        style={{ height: isMaximiszed ? "120vh" : "125vh" }}
      >
        <iframe
          key={droneId}   
          src={liveUrl}
          className="w-full h-full"
          allow="autoplay"
          title={`Drone Camera ${droneId}`}
        ></iframe>
      </div>
    </div>
  );
}
