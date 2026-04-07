<?php

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
require_once realpath(__DIR__ . "/../../config/db.php");
require_once realpath(__DIR__ . "/../../helpers/logActivity.php"); // ✅ Added

// =====================
// AUTH CHECK
// =====================
if (
    !isset($_SESSION['user']) ||
    $_SESSION['user']['role'] !== 'Pilot'
) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
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
    echo json_encode(["success" => false, "message" => "All fields are required"]);
    exit;
}

$droneCode = $data['drone_code'];
$droneName = $data['drone_name'];
$scheduledDate = $data['scheduled_date'];
$issue = trim($data['issue_description']);

$station = $_SESSION['user']['station'];
$reportedBy = $_SESSION['user']['fullName'];

// ✅ Added
$logUser = $_SESSION["user"] ?? [
    "id" => null,
    "fullName" => "SYSTEM",
    "role" => "SYSTEM"
];

// =====================
// VERIFY DRONE
// =====================
$check = $conn->prepare("
    SELECT id
    FROM drones
    WHERE drone_code = ? AND station = ?
");
$check->bind_param("ss", $droneCode, $station);
$check->execute();
$result = $check->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Invalid drone"]);
    exit;
}

try {

    // =====================
    // START TRANSACTION
    // =====================
    $conn->begin_transaction();

    // =====================
    // INSERT MAINTENANCE REQUEST
    // =====================
    $stmt = $conn->prepare("
        INSERT INTO maintenance_requests
        (
            drone_code,
            drone_name,
            station,
            issue_description,
            scheduled_date,
            reported_by,
            status,
            created_at
        )
        VALUES
        (?, ?, ?, ?, ?, ?, 'scheduled', NOW())
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

    // =====================
    // LOG ACTIVITY ✅ Added
    // =====================
    logActivity(
        $conn,
        $logUser,
        "SCHEDULE_MAINTENANCE",
        "MAINTENANCE",
        "Scheduled maintenance for drone {$droneName} ({$droneCode}) at station {$station} on {$scheduledDate}. Issue: {$issue}",
        null
    );


    // =====================
    // INSERT NOTIFICATION
    // =====================
    $notifMsg = "Maintenance scheduled for {$droneName} ({$droneCode}) on {$scheduledDate}";

    $details = json_encode([
        "drone_code" => $droneCode,
        "drone_name" => $droneName,
        "station" => $station,
        "reported_by" => $reportedBy,
        "issue_description" => $issue,
        "scheduled_date" => $scheduledDate,
        "status" => "scheduled"
    ]);

    $notif = $conn->prepare("
        INSERT INTO notifications (type, message, created_by, data)
        VALUES ('maintenance', ?, ?, ?)
    ");

    $notif->bind_param("sss", $notifMsg, $reportedBy, $details);
    $notif->execute();

    // =====================
    // COMMIT
    // =====================
    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Maintenance scheduled successfully"
    ]);

} catch (Exception $e) {

    // Rollback if anything fails
    $conn->rollback();

    echo json_encode([
        "success" => false,
        "message" => "Failed to schedule maintenance"
    ]);
}
?>