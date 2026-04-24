<?php
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");
require_once realpath(__DIR__ . "/../../../helpers/logActivity.php");

$data = json_decode(file_get_contents("php://input"), true);

$stationName = trim($data['stationName'] ?? '');
$stationCode = strtoupper(trim($data['code'] ?? '')); // ✅ uppercase
$lat = isset($data['lat']) ? floatval($data['lat']) : 0;
$lng = isset($data['lng']) ? floatval($data['lng']) : 0;

/* ---------- REQUIRED ---------- */
if ($stationName === '' || $stationCode === '' || $lat === 0.0 || $lng === 0.0) {
    echo json_encode(["status" => false, "message" => "All fields required"]);
    exit;
}

/* ---------- PREFIX CHECK ---------- */
if (!str_starts_with($stationCode, "STN-")) {
    echo json_encode([
        "status" => false,
        "message" => "Station code must start with STN-"
    ]);
    exit;
}

/* ---------- SUFFIX VALIDATION ---------- */
$suffix = substr($stationCode, 4);

/*
  Rules:
  - must contain at least one number
  - letters allowed
  - only A-Z, 0-9, -
*/
if (
    !$suffix ||
    !preg_match("/^(?=.*[0-9])[A-Z0-9\-]+$/", $suffix)
) {
    echo json_encode([
        "status" => false,
        "message" => "Station code must contain at least one number"
    ]);
    exit;
}

/* ---------- DUPLICATE NAME ---------- */
$stmt = $conn->prepare("SELECT id FROM fire_station WHERE station_name = ?");
$stmt->bind_param("s", $stationName);
$stmt->execute();

if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(["status" => false, "message" => "Station already exists"]);
    $stmt->close();
    exit;
}
$stmt->close();

/* ---------- DUPLICATE CODE ---------- */
$stmt = $conn->prepare("SELECT id FROM fire_station WHERE station_code = ?");
$stmt->bind_param("s", $stationCode);
$stmt->execute();

if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(["status" => false, "message" => "Station code already exists"]);
    $stmt->close();
    exit;
}
$stmt->close();

/* ---------- INSERT ---------- */
$stmt = $conn->prepare("
INSERT INTO fire_station (station_name, station_code, latitude, longitude)
VALUES (?, ?, ?, ?)
");

$stmt->bind_param("ssdd", $stationName, $stationCode, $lat, $lng);

if ($stmt->execute()) {

    $logUser = $_SESSION["user"] ?? [
        "id" => null,
        "fullName" => "SYSTEM",
        "role" => "SYSTEM"
    ];

    logActivity(
        $conn,
        $logUser,
        "ADD_STATION",
        "STATION",
        "Added new station {$stationName} ({$stationCode})",
        null
    );

    echo json_encode(["status" => true, "message" => "Station added successfully"]);
} else {
    echo json_encode(["status" => false, "message" => "Insert failed"]);
}

$stmt->close();
$conn->close();
?>