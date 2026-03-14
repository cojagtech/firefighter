import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import SafeIcon from '@/components/common/SafeIcon';
import StatusBadge from '@/components/common/StatusBadge';

export default function DroneListTable({ drones, onViewDetails }) {
  const getHealthStatusVariant = (status) => {
    switch (status) {
      case 'Optimal':
        return 'bg-emerald-600/10 text-emerald-600';
      case 'Degraded':
        return 'bg-amber-600/10 text-amber-600';
      case 'Requires Service':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusType = (status) => {
    switch (status) {
      case 'Active':
        return 'active';
      case 'Maintenance':
        return 'maintenance';
      case 'StandBy':
        return 'standby';
      case 'Busy':
        return 'busy';
      default:
        return 'offline';
    }
  };

  if (!drones || drones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <SafeIcon name="Plane" size={48} className="text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No drones found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead>Drone Name</TableHead>
            <TableHead>Drone code</TableHead>
            <TableHead>Fire Station</TableHead>
            <TableHead>Status</TableHead>
            {/* <TableHead>Battery</TableHead> */}
            <TableHead>Flight Hours</TableHead>
            <TableHead>Health</TableHead>
            <TableHead>Pilot</TableHead>
            <TableHead>Firmware</TableHead>
            {/* <TableHead className="text-right">Actions</TableHead> */}
          </TableRow>
        </TableHeader>

        <TableBody>
          {drones.map((drone) => (
            
            <TableRow key={drone.drone_code} className="border-border hover:bg-muted/50">
              
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <SafeIcon name="Plane" size={16} className="text-muted-foreground" />
                  {drone.drone_name || "Unknown"}
                </div>
              </TableCell>

              <TableCell className="text-sm text-muted-foreground">
                {drone.drone_code || "—"}
              </TableCell>

              <TableCell className="text-sm">
                {drone.station || "—"}
              </TableCell>

              <TableCell>
                <StatusBadge
                  status={getStatusType(drone.status)}
                  label={drone.status || "Unknown"}
                />
              </TableCell>

              {/* <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        (drone.battery || 0) > 70
                          ? 'bg-emerald-600'
                          : (drone.battery || 0) > 40
                          ? 'bg-amber-600'
                          : 'bg-destructive'
                      }`}
                      style={{ width: `${drone.battery || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-10">
                    {drone.battery || 0}%
                  </span>
                </div>
              </TableCell> */}

              <TableCell className="text-sm">
                {drone.flight_hours
                  ? `${Number(drone.flight_hours).toFixed(1)}h`
                  : "0.0h"}
              </TableCell>

              <TableCell>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${getHealthStatusVariant(
                    drone.health_status || "Unknown"
                  )}`}
                >
                  {drone.health_status || "Unknown"}
                </span>
              </TableCell>

              <TableCell className="text-sm">
                {drone.pilot_name || "—"}
              </TableCell>

              <TableCell className="text-sm text-muted-foreground">
                {drone.firmware_version || "—"}
              </TableCell>

              {/* <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(drone)}
                  className="hover:bg-muted"
                >
                  <SafeIcon name="Eye" size={16} className="mr-1" />
                  View
                </Button>
              </TableCell> */}

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
