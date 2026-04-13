<?php

header("Content-Type: application/json");
session_start();

require_once realpath(__DIR__ . "/../../config/db.php");
require_once realpath(__DIR__ . "/../../helpers/logActivity.php");

// =====================
// AUTH CHECK
// =====================
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'Pilot') {
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);
    exit;
}

// =====================
// INPUT
// =====================
$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data['drone_code']) ||
    empty($data['drone_name']) ||
    empty($data['scheduled_date']) ||
    empty(trim($data['issue_description']))
) {
    echo json_encode([
        "success" => false,
        "message" => "All fields are required"
    ]);
    exit;
}

$droneCode = $data['drone_code'];
$droneName = $data['drone_name'];
$scheduledDate = $data['scheduled_date'];
$issue = trim($data['issue_description']);

$station = $_SESSION['user']['station'] ?? null;
$reportedBy = $_SESSION['user']['fullName'] ?? "Unknown";

if (!$station) {
    echo json_encode([
        "success" => false,
        "message" => "Session missing"
    ]);
    exit;
}

// =====================
// CHECK DRONE STATUS
// =====================
$checkDrone = $conn->prepare("
    SELECT status
    FROM drones
    WHERE drone_code = ? AND station = ?
");

$checkDrone->bind_param("ss", $droneCode, $station);
$checkDrone->execute();
$checkDrone->bind_result($droneStatus);
$checkDrone->fetch();
$checkDrone->close();

// 🚫 BLOCK IF ALREADY IN MAINTENANCE
if ($droneStatus === 'Maintenance') {
    echo json_encode([
        "success" => false,
        "message" => "Drone is already under maintenance"
    ]);
    exit;
}

// =====================
// CHECK EXISTING SCHEDULE
// =====================
$check = $conn->prepare("
    SELECT id
    FROM maintenance_requests
    WHERE drone_code = ? AND station = ? AND status = 'scheduled'
    LIMIT 1
");

$check->bind_param("ss", $droneCode, $station);
$check->execute();
$check->bind_result($existingId);
$check->fetch();
$check->close();

// 🚫 BLOCK DUPLICATE
if ($existingId) {
    echo json_encode([
        "success" => false,
        "message" => "Drone is already under maintenance"
    ]);
    exit;
}

try {

    $conn->begin_transaction();

    // =====================
    // INSERT MAINTENANCE
    // =====================
    $stmt = $conn->prepare("
        INSERT INTO maintenance_requests
        (drone_code, drone_name, station, issue_description, scheduled_date, reported_by, scheduled_by, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'Pilot', 'scheduled', NOW())
    ");

    $stmt->bind_param(
        "ssssss",
        $droneCode,
        $droneName,
        $station,
        $issue,
        $scheduledDate,
        $reportedBy
    );

    $stmt->execute();
    $maintenanceId = $stmt->insert_id;
    $stmt->close();

    // =====================
    // UPDATE DRONE STATUS
    // =====================
    $update = $conn->prepare("
        UPDATE drones
        SET status = 'Maintenance'
        WHERE drone_code = ? AND station = ?
    ");

    $update->bind_param("ss", $droneCode, $station);
    $update->execute();
    $update->close();

    // =====================
    // INSERT NOTIFICATION
    // =====================
    $message = "Maintenance scheduled for {$droneName} ({$droneCode}) at {$station}";

    $details = json_encode([
        "drone_code" => $droneCode,
        "drone_name" => $droneName,
        "station" => $station,
        "issue_description" => $issue,
        "reported_by" => $reportedBy,
        "scheduled_date" => $scheduledDate,
        "status" => "scheduled",
        "scheduled_by" => "Pilot"
    ]);

    $notif = $conn->prepare("
        INSERT INTO notifications (type, message, created_by, data)
        VALUES ('maintenance', ?, ?, ?)
    ");

    $notif->bind_param("sss", $message, $reportedBy, $details);
    $notif->execute();
    $notif->close();

    // =====================
    // LOG ACTIVITY
    // =====================
    $logUser = $_SESSION["user"] ?? [
        "id" => null,
        "fullName" => "SYSTEM",
        "role" => "SYSTEM"
    ];

    logActivity(
        $conn,
        $logUser,
        "SCHEDULE_MAINTENANCE",
        "MAINTENANCE",
        "Scheduled maintenance for drone {$droneName} ({$droneCode}) at station {$station}. Issue: {$issue}. Scheduled date: {$scheduledDate}",
        $maintenanceId
    );

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Maintenance scheduled successfully"
    ]);

} catch (Exception $e) {

    $conn->rollback();

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}