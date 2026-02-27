<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

$drone_code = $_GET['drone_code'] ?? null;

if (!$drone_code) {
  echo json_encode(["success" => false, "error" => "Drone code missing"]);
  exit;
}


$sql = "
  SELECT latitude, longitude
  FROM drone_gps_logs
  WHERE drone_code = ?
  ORDER BY timestamp DESC
  LIMIT 1
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $drone_code);
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();

if ($result) {
  echo json_encode([
    "success" => true,
    "lat" => (float)$result['latitude'],
    "lng" => (float)$result['longitude']
  ]);
} else {
  echo json_encode(["success" => true, "lat" => null, "lng" => null]);
}
