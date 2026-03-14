import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Box,
  Radio
} from "@mui/material";

import BusinessIcon from "@mui/icons-material/Business";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import AirIcon from "@mui/icons-material/Air";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function SuggestedStationsPanel({
  incidentId,
  selectedStationName,
  onSelectStation
}) {

  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function loadStations(){

      try{

        const res = await fetch(
          `${API_BASE}/fire-fighter/getNearestStations.php?incident_id=${incidentId}`
        );

        const data = await res.json();

        // console.log("Nearest stations:", data);

        if(data?.nearest_stations){
          setStations(data.nearest_stations);
        }

      }catch(err){
        console.error(err);
      }finally{
        setLoading(false);
      }

    }

    if(incidentId) loadStations();

  },[incidentId]);


  const handleSelect = (stationName)=>{
    onSelectStation(
      selectedStationName === stationName ? null : stationName
    );
  };

  return (

    <Card>

      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <BusinessIcon color="primary"/>
            <Typography variant="h6">
              Nearest Fire Stations
            </Typography>
          </Box>
        }
      />

      <CardContent>

        {loading ? (

          <Typography align="center">
            Loading stations...
          </Typography>

        ) : stations.length ? (

          stations.map((station)=>(

            <Box
              key={station.station_name}
              onClick={()=>handleSelect(station.station_name)}
              sx={{
                p:2,
                mb:1.5,
                borderRadius:2,
                cursor:"pointer",
                border:"1px solid",
                borderColor:
                  selectedStationName===station.station_name
                  ? "primary.main"
                  : "divider",
                bgcolor:
                  selectedStationName===station.station_name
                  ? "primary.light"
                  : "action.hover"
              }}
            >

              {/* Station header */}
              <Box display="flex" justifyContent="space-between">

                <Box display="flex" alignItems="center" gap={1}>

                  <Radio
                    checked={selectedStationName===station.station_name}
                  />

                  <Typography fontWeight={500}>
                    {station.station_name}
                  </Typography>

                </Box>

                <Chip
                  label={`${Number(station.distance_km).toFixed(2)} km`}
                  size="small"
                  variant="outlined"
                />

              </Box>

              {/* Asset counts */}
              <Box mt={1} display="flex" gap={3}>

                <Box display="flex" alignItems="center" gap={0.5}>
                  <LocalFireDepartmentIcon sx={{ fontSize:16, color:"#ff7043" }}/>
                  <Typography variant="caption">
                    Vehicles: {station.vehicle_count}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={0.5}>
                  <AirIcon sx={{ fontSize:16, color:"#64b5f6" }}/>
                  <Typography variant="caption">
                    Drones: {station.drone_count}
                  </Typography>
                </Box>

              </Box>

            </Box>

          ))

        ) : (

          <Typography align="center">
            No stations found
          </Typography>

        )}

      </CardContent>

    </Card>

  );

}