<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once realpath(__DIR__ . "/../../../config/db.php");
require_once realpath(__DIR__ . "/../../../helpers/logActivity.php");

$raw  = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(["status" => false, "message" => "Invalid request"]);
    exit;
}

$id   = intval($data['id'] ?? 0);
$name = trim($data['stationName'] ?? '');
$lat  = $data['lat'] ?? null;
$lng  = $data['lng'] ?? null;

/* ---------- VALIDATION ---------- */
if (!$id) {
    echo json_encode(["status" => false, "message" => "Station ID is required"]);
    exit;
}

if (!$name) {
    echo json_encode(["status" => false, "message" => "Station name is required"]);
    exit;
}

if ($lat === null || $lng === null || !is_numeric($lat) || !is_numeric($lng)) {
    echo json_encode(["status" => false, "message" => "Valid coordinates are required"]);
    exit;
}

$lat = floatval($lat);
$lng = floatval($lng);

/* ---------- FETCH OLD DATA ---------- */
$oldStmt = $conn->prepare("
    SELECT station_name, station_code, latitude, longitude 
    FROM fire_station 
    WHERE id = ?
");
$oldStmt->bind_param("i", $id);
$oldStmt->execute();
$oldData = $oldStmt->get_result()->fetch_assoc();
$oldStmt->close();

if (!$oldData) {
    echo json_encode(["status" => false, "message" => "Station not found"]);
    exit;
}

/* ---------- NO CHANGE CHECK ---------- */
if (
    $oldData['station_name'] === $name &&
    floatval($oldData['latitude']) === $lat &&
    floatval($oldData['longitude']) === $lng
) {
    echo json_encode([
        "status" => false,
        "message" => "No changes detected"
    ]);
    exit;
}

/* ---------- DUPLICATE NAME CHECK ---------- */
$stmt = $conn->prepare("
    SELECT id FROM fire_station 
    WHERE station_name = ? AND id != ?
");
$stmt->bind_param("si", $name, $id);
$stmt->execute();

if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(["status" => false, "message" => "Station name already exists"]);
    $stmt->close();
    exit;
}
$stmt->close();

/* ---------- UPDATE ---------- */
$stmt = $conn->prepare("
    UPDATE fire_station 
    SET station_name=?, latitude=?, longitude=? 
    WHERE id=?
");

if (!$stmt) {
    echo json_encode(["status" => false, "message" => "Database prepare error"]);
    exit;
}

$stmt->bind_param("sddi", $name, $lat, $lng, $id);

if (!$stmt->execute()) {
    echo json_encode(["status" => false, "message" => "Update failed"]);
    exit;
}

/* ---------- FORMAT VALUES ---------- */
$oldLat = round($oldData['latitude'], 6);
$newLat = round($lat, 6);

$oldLng = round($oldData['longitude'], 6);
$newLng = round($lng, 6);

/* ---------- CHANGE LOG ---------- */
$changes = [];

if ($oldData['station_name'] !== $name) {
    $changes[] = "name: {$oldData['station_name']} → {$name}";
}

if ($oldLat !== $newLat) {
    $changes[] = "latitude: {$oldLat} → {$newLat}";
}

if ($oldLng !== $newLng) {
    $changes[] = "longitude: {$oldLng} → {$newLng}";
}

/* ---------- LOG ACTIVITY ---------- */
if (!empty($changes)) {

    $logUser = $_SESSION["user"] ?? [
        "id" => null,
        "fullName" => "SYSTEM",
        "role" => "SYSTEM"
    ];

    $oldName = $oldData['station_name'];
    $code    = $oldData['station_code'];

    $description = "Updated {$oldData['station_name']} ({$code}):\n" . implode("\n", $changes);

    logActivity(
        $conn,
        $logUser,
        "UPDATE_STATION",
        "STATION",
        $description,
        $id
    );
}

echo json_encode([
    "status" => true,
    "message" => "Station updated successfully"
]);

$stmt->close();
$conn->close();