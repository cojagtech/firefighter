<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

$stationName = trim($data['stationName'] ?? '');
$stationCode = trim($data['code'] ?? '');
$lat = isset($data['lat']) ? floatval($data['lat']) : 0;
$lng = isset($data['lng']) ? floatval($data['lng']) : 0;

if ($stationName === '' || $stationCode === '' || $lat === 0.0 || $lng === 0.0) {
    echo json_encode(["status" => false, "message" => "All fields required"]);
    exit;
}


$stmt = $conn->prepare("INSERT INTO fire_station (station_name, station_code, latitude, longitude) VALUES (?, ?, ?, ?)");

if (!$stmt) {
    echo json_encode(["status" => false, "message" => "Database prepare error"]);
    exit;
}

$stmt->bind_param("ssdd", $stationName, $stationCode, $lat, $lng);

if ($stmt->execute()) {
    echo json_encode(["status" => true, "message" => "Station added successfully"]);
} else {
    if ($conn->errno == 1062) {
        echo json_encode(["status" => false, "message" => "Station code already exists"]);
    } else {
        echo json_encode(["status" => false, "message" => "Insert failed"]);
    }
}

$stmt->close();
$conn->close();
?>
