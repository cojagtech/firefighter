<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

$sql = "
SELECT 
  d.drone_code,
  d.drone_name,
  d.status,
  g.latitude,
  g.longitude,
  g.timestamp AS last_gps_time
FROM drones d
LEFT JOIN drone_gps_logs g
  ON g.id = (
    SELECT id
    FROM drone_gps_logs
    WHERE drone_code = d.drone_code
    ORDER BY timestamp DESC
    LIMIT 1
  )
ORDER BY d.drone_code ASC
";

$result = $conn->query($sql);

$data = [];

if ($result) {
  while ($row = $result->fetch_assoc()) {
    $data[] = $row;
  }
}

echo json_encode($data);
