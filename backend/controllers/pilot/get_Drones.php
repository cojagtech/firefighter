<?php
session_start();

require_once realpath(__DIR__ . "/../../config/db.php");

// ✅ Correct authorization check
if (
    !isset($_SESSION['user']) ||
    $_SESSION['user']['role'] !== 'Pilot'
) {
    http_response_code(401);
    echo json_encode([
        "status" => false,
        "message" => "Unauthorized"
    ]);
    exit;
}

$station = $_SESSION['user']['station'];

$stmt = $conn->prepare("
    SELECT 
        drone_code,
        drone_name,
        status,
        battery,
        flight_hours,
        health_status,
        firmware_version,
        is_ready
    FROM drones
    WHERE station = ?
      AND pilot_status = 'available'
    ORDER BY drone_name ASC
");

$stmt->bind_param("s", $station);
$stmt->execute();

$result = $stmt->get_result();
$drones = [];

while ($row = $result->fetch_assoc()) {
    $drones[] = $row;
}

echo json_encode($drones);