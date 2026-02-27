<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

/*
|--------------------------------------------------------------------------
| Fetch all drones with latest GPS + full fleet details
|--------------------------------------------------------------------------
*/

$sql = "
    SELECT 
        d.id,
        d.drone_code,
        d.drone_name,
        d.station,
        d.ward,
        d.status,
        d.battery,
        d.flight_hours,
        d.health_status,
        d.firmware_version,
        d.is_ready,

        d.pilot_id,
        d.pilot_name,
        d.pilot_email,
        d.pilot_phone,
        d.pilot_role,
        d.pilot_status,

        g.latitude,
        g.longitude,
        g.timestamp AS last_gps_time
    FROM drones d
    LEFT JOIN (
        SELECT 
            drone_code,
            latitude,
            longitude,
            timestamp
        FROM drone_gps_logs
        WHERE (drone_code, timestamp) IN (
            SELECT 
                drone_code,
                MAX(timestamp)
            FROM drone_gps_logs
            GROUP BY drone_code
        )
    ) g ON d.drone_code = g.drone_code
    ORDER BY d.drone_code ASC
";

$result = $conn->query($sql);

$data = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

echo json_encode($data, JSON_PRETTY_PRINT);
