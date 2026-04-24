<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");
require_once realpath(__DIR__ . "/../../../helpers/logActivity.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request"
    ]);
    exit;
}

$drone_code       = $_POST['drone_code'] ?? '';
$flight_hours     = $_POST['flight_hours'] ?? null;
$health_status    = $_POST['health_status'] ?? '';
$firmware_version = $_POST['firmware_version'] ?? '';
$status           = $_POST['status'] ?? '';

/* ---------- REQUIRED ---------- */
if (!$drone_code) {
    echo json_encode([
        "success" => false,
        "message" => "Drone code required"
    ]);
    exit;
}

/* ---------- VALIDATION ---------- */
if ($flight_hours !== null && $flight_hours < 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid flight hours"
    ]);
    exit;
}

$logUser = $_SESSION["user"] ?? [
    "id"       => null,
    "fullName" => "SYSTEM",
    "role"     => "SYSTEM"
];

try {
    $conn->begin_transaction();

    /* ---------- FETCH OLD DATA ---------- */
    $oldStmt = $conn->prepare("
        SELECT drone_name, flight_hours, health_status, firmware_version, status
        FROM drones
        WHERE drone_code = ?
    ");
    $oldStmt->bind_param("s", $drone_code);
    $oldStmt->execute();
    $oldData = $oldStmt->get_result()->fetch_assoc();
    $oldStmt->close();

    if (!$oldData) {
        throw new Exception("Drone not found");
    }

    /* ---------- UPDATE ---------- */
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
        throw new Exception($stmt->error);
    }

    $stmt->close();

    /* ---------- CHANGE LOG (DETAILED) ---------- */
    $descParts = [];

    if ($oldData['flight_hours'] != $flight_hours) {
        $descParts[] = "flight_hours: {$oldData['flight_hours']} → {$flight_hours}";
    }

    if ($oldData['health_status'] !== $health_status) {
        $descParts[] = "health_status: {$oldData['health_status']} → {$health_status}";
    }

    if ($oldData['firmware_version'] !== $firmware_version) {
        $descParts[] = "firmware_version: {$oldData['firmware_version']} → {$firmware_version}";
    }

    if ($oldData['status'] !== $status) {
        $descParts[] = "status: {$oldData['status']} → {$status}";
    }

    /* ---------- BUILD DESCRIPTION ---------- */
    if (!empty($descParts)) {

        $drone_name = $oldData['drone_name'] ?? '';

        $description = "Updated drone {$drone_name} ({$drone_code}):\n"
            . implode("\n", $descParts);

        logActivity(
            $conn,
            $logUser,
            "UPDATE_DRONE",
            "DRONE",
            $description,
            null
        );
    }

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Drone updated successfully"
    ]);

} catch (Exception $e) {

    $conn->rollback();

    echo json_encode([
        "success" => false,
        "message" => "Server error"
        // for debugging: $e->getMessage()
    ]);
}

$conn->close();