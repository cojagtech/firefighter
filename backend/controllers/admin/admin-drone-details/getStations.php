<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

$sql = "SELECT id, station_name, station_code, latitude, longitude 
        FROM fire_station
        ORDER BY station_name ASC";

$result = mysqli_query($conn, $sql);

$stations = [];

while ($row = mysqli_fetch_assoc($result)) {
    $stations[] = [
        "id"   => (int)$row["id"],
        "name" => $row["station_name"],
        "code" => $row["station_code"],
        "lat"  => (float)$row["latitude"],
        "lng"  => (float)$row["longitude"]
    ];
}

echo json_encode($stations);
mysqli_close($conn);
?>
