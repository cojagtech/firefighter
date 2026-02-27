<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

require_once realpath(__DIR__ . "/../../../config/db.php");

if (!isset($_GET['droneCode'])) {
    echo json_encode([
        "success" => false,
        "message" => "droneCode missing"
    ]);
    exit;
}

$droneCode = $_GET['droneCode'];

$sql = "SELECT id, drone_code, latitude, longitude, speed, timestamp 
        FROM drone_gps_logs
        WHERE drone_code = ? 
        ORDER BY timestamp DESC 
        LIMIT 1";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Query prepare failed"
    ]);
    exit;
}

$stmt->bind_param("s", $droneCode);
$stmt->execute();

$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode($row);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Drone not found"
    ]);
}

$stmt->close();
$conn->close();
?>
