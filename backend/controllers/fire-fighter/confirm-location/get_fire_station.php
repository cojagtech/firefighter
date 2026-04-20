<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

require_once realpath(__DIR__ . "/../../../config/db.php");

$station_name = isset($_GET['station_name']) ? trim($_GET['station_name']) : '';

if (!$station_name) {
    echo json_encode([
        "success" => false,
        "error" => "station_name required"
    ]);
    exit;
}

$stmt = $conn->prepare("
    SELECT station_name, latitude, longitude 
    FROM fire_station 
    WHERE TRIM(station_name) = ?
    LIMIT 1
");

$stmt->bind_param("s", $station_name);
$stmt->execute();

$result = $stmt->get_result();
$data = $result->fetch_assoc();

if (!$data) {
    echo json_encode([
        "success" => false,
        "error" => "station not found",
        "received" => $station_name
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "data" => $data
]);
?>