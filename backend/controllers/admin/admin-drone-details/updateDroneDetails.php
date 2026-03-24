<?php
session_start();

ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");
require_once realpath(__DIR__ . "/../../../helpers/logActivity.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
    exit;
}


$drone_code       = $_POST['drone_code'] ?? '';
$flight_hours     = $_POST['flight_hours'] ?? null;
$health_status    = $_POST['health_status'] ?? '';
$firmware_version = $_POST['firmware_version'] ?? '';
$status           = $_POST['status'] ?? '';

if (!$drone_code) {
    echo json_encode(["success" => false, "message" => "Drone code missing"]);
    exit;
}

$logUser = $_SESSION["user"] ?? [
    "id"       => null,
    "fullName" => "SYSTEM",
    "role"     => "SYSTEM"
];

try {
    $conn->begin_transaction();

    $oldStmt = $conn->prepare("
        SELECT flight_hours, health_status, firmware_version, status
        FROM drones
        WHERE drone_code = ?
    ");
    $oldStmt->bind_param("s", $drone_code);
    $oldStmt->execute();
    $oldData = $oldStmt->get_result()->fetch_assoc();
    $oldStmt->close();

    $stmt = $conn->prepare("
        UPDATE drones 
        SET 
            flight_hours = ?, 
            health_status = ?, 
            firmware_version = ?, 
            status = ?
        WHERE drone_code = ?
    ");

    $stmt->bind_param(
        "dssss",
        $flight_hours,
        $health_status,
        $firmware_version,
        $status,
        $drone_code
    );

    if (!$stmt->execute()) {
        throw new Exception("Update failed");
    }

    $stmt->close();

    $descParts = [];

    if ($oldData) {
        if ($oldData['flight_hours'] != $flight_hours) {
            $descParts[] = "flight_hours: {$oldData['flight_hours']} → $flight_hours";
        }
        if ($oldData['health_status'] !== $health_status) {
            $descParts[] = "health_status: {$oldData['health_status']} → $health_status";
        }
        if ($oldData['firmware_version'] !== $firmware_version) {
            $descParts[] = "firmware_version: {$oldData['firmware_version']} → $firmware_version";
        }
        if ($oldData['status'] !== $status) {
            $descParts[] = "status: {$oldData['status']} → $status";
        }
    }

    $description = "Updated drone $drone_code";
    if (!empty($descParts)) {
        $description .= " (" . implode(", ", $descParts) . ")";
    }

    logActivity(
        $conn,
        $logUser,
        "UPDATE_DRONE",
        "DRONE",
        $description,
        null
    );

    $conn->commit();

    echo json_encode(["success" => true]);

} catch (Exception $e) {

    $conn->rollback();

    echo json_encode([
        "success" => false,
        "message" => "Server error"
    ]);
}

$conn->close();
