<?php

require_once realpath(__DIR__ . "/../../config/db.php");

$incidentId = $_GET['incident_id'];

$sql = "
SELECT 
    fs.id,
    fs.station_name,
    fs.latitude,
    fs.longitude,

    (
        6371 * ACOS(
            COS(RADIANS(MAX(i.latitude))) *
            COS(RADIANS(fs.latitude)) *
            COS(RADIANS(fs.longitude) - RADIANS(MAX(i.longitude))) +
            SIN(RADIANS(MAX(i.latitude))) *
            SIN(RADIANS(fs.latitude))
        )
    ) AS distance_km,

    COUNT(DISTINCT v.id) AS vehicle_count,
    COUNT(DISTINCT d.id) AS drone_count

FROM fire_station fs

JOIN incidents i 
    ON i.id = ?

LEFT JOIN vehicles v
    ON v.station = fs.station_name
    AND v.status = 'available'

LEFT JOIN drones d
    ON d.station = fs.station_name
    AND d.status = 'Active'

WHERE fs.station_name != i.stationName

GROUP BY fs.id

ORDER BY distance_km ASC

LIMIT 3;
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $incidentId); // assuming incident_id is integer
$stmt->execute();

$result = $stmt->get_result();

$stations = [];

while ($row = $result->fetch_assoc()) {
    $stations[] = $row;
}

echo json_encode([
    "incident_id" => $incidentId,
    "nearest_stations" => $stations
]);