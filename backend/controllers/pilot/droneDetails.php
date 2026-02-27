<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

session_start();
require_once "../../config/db.php";

/**
 * AUTH CHECK
 */
if (
    !isset($_SESSION['user']) ||
    !isset($_SESSION['user']['role']) ||
    $_SESSION['user']['role'] !== 'Pilot'
) {
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);
    exit;
}

/**
 * STATION CHECK
 */
if (!isset($_SESSION['user']['station'])) {
    echo json_encode([
        "success" => false,
        "message" => "Station not found in session"
    ]);
    exit;
}

$station = $_SESSION['user']['station'];

/**
 * DRONE ID VALIDATION
 */
if (!isset($_GET['drone_id']) || empty($_GET['drone_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Drone ID is required"
    ]);
    exit;
}

$droneId = (int) $_GET['drone_id'];

/**
 * FETCH DRONE (WITH STATION CHECK)
 */
$stmt = $conn->prepare("
    SELECT 
        id,
        drone_name,
        drone_code,
        status,
        station,
        created_at
    FROM drones
    WHERE id = ?
      AND station = ?
    LIMIT 1
");

$stmt->bind_param("is", $droneId, $station);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Drone not found or access denied"
    ]);
    exit;
}

$drone = $result->fetch_assoc();

echo json_encode([
    "success" => true,
    "drone" => $drone
]);