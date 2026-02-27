<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

$sql = "
  SELECT
    COUNT(*) AS total_drones,
    SUM(status = 'maintenance') AS inactive_drones,
    SUM(status != 'maintenance') AS ready_drones
  FROM drones
";

$result = mysqli_query($conn, $sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch dashboard stats"]);
    exit;
}

$row = mysqli_fetch_assoc($result);

echo json_encode([
    "total_drones"    => (int)$row['total_drones'],
    "inactive_drones" => (int)$row['inactive_drones'],
    "ready_drones"    => (int)$row['ready_drones']
]);
