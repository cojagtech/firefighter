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
require "../../../helpers/logActivity.php"; // 🔥 ACTIVITY LOG

$data = json_decode(file_get_contents("php://input"), true);

$id   = intval($data['id'] ?? 0);
$name = trim($data['stationName'] ?? '');
$lat  = isset($data['lat']) ? floatval($data['lat']) : 0;
$lng  = isset($data['lng']) ? floatval($data['lng']) : 0;

if (!$id || !$name || !$lat || !$lng) {
    echo json_encode(["status" => false, "message" => "Missing fields"]);
    exit;
}

/* ================= GET OLD DATA FOR LOG ================= */
$oldStmt = $conn->prepare("SELECT station_name, latitude, longitude FROM fire_station WHERE id=?");
$oldStmt->bind_param("i", $id);
$oldStmt->execute();
$oldResult = $oldStmt->get_result()->fetch_assoc();
$oldStmt->close();

$stmt = $conn->prepare("UPDATE fire_station SET station_name=?, latitude=?, longitude=? WHERE id=?");

if (!$stmt) {
    echo json_encode(["status" => false, "message" => "Prepare failed"]);
    exit;
}

$stmt->bind_param("sddi", $name, $lat, $lng, $id);

if ($stmt->execute()) {

    /* ================= AUDIT LOG ================= */
    $logUser = $_SESSION["user"] ?? [
        "id"   => null,
        "name" => "SYSTEM",
        "role" => "SYSTEM"
    ];

    $changes = "Updated station ID $id: ";

    if ($oldResult) {
        if ($oldResult['station_name'] !== $name) {
            $changes .= "Name '{$oldResult['station_name']}' → '$name', ";
        }
        if ($oldResult['latitude'] != $lat || $oldResult['longitude'] != $lng) {
            $changes .= "Location [{$oldResult['latitude']}, {$oldResult['longitude']}] → [$lat, $lng]";
        }
    }

    if (function_exists("logActivity")) {
        logActivity(
            $conn,
            $logUser,
            "UPDATE_STATION",
            "FIRE_STATION",
            rtrim($changes, ", "),
            $id
        );
    }

    echo json_encode(["status" => true]);

} else {
    echo json_encode(["status" => false, "message" => "Update failed"]);
}

$stmt->close();
$conn->close();
?>
