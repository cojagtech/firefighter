<?php

session_start();
require_once realpath(__DIR__ . "/../../config/db.php");

/**
 * AUTH CHECK
 */
if (
    !isset($_SESSION['user']) ||
    $_SESSION['user']['role'] !== 'Pilot'
) {
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);
    exit;
}

$station = $_SESSION['user']['station'];

/**
 * FETCH DRONES (FIXED SQL)
 */
$stmt = $conn->prepare("
    SELECT
        id,
        drone_name,
        drone_code,
        status,
        flight_hours,
        health_status,
        firmware_version,
        station
    FROM drones
    WHERE station = ?
    ORDER BY drone_name ASC
");

$stmt->bind_param("s", $station);
$stmt->execute();

echo json_encode([
    "success" => true,
    "drones" => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)
]);