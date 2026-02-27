<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

$station = $_GET['station'] ?? null;

if (!$station) {
    echo json_encode([]);
    exit;
}


$sql = "
    SELECT 
        drone_code,
        drone_name,
        ward AS location,
        station,
        status,
        battery
    FROM drones
    WHERE station = ?
    ORDER BY drone_code ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $station);
$stmt->execute();

$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
