<?php
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

if (!$conn) {
    echo json_encode(["status" => false, "message" => "Database connection failed"]);
    exit;
}

$search = isset($_GET['search']) ? $conn->real_escape_string($_GET['search']) : "";

$sql = "SELECT id, station_name, station_code, latitude, longitude FROM fire_station WHERE 1";

if ($search !== "") {
    $sql .= " AND (station_name LIKE '%$search%' OR station_code LIKE '%$search%')";
}

$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["status" => false, "message" => "Query failed"]);
    exit;
}

$stations = [];

while ($row = $result->fetch_assoc()) {
    $stations[] = [
        "id" => $row["id"],
        "name" => $row["station_name"],
        "code" => $row["station_code"],
        "lat" => $row["latitude"],
        "lng" => $row["longitude"],
    ];
}

echo json_encode(["status" => true, "stations" => $stations]);
$conn->close();
?>
