<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

$sql = "SELECT station_name 
        FROM fire_station
        WHERE station_name IS NOT NULL AND station_name != ''
        ORDER BY station_name ASC";

$result = mysqli_query($conn, $sql);

$stations = [];

while ($row = mysqli_fetch_assoc($result)) {
    $stations[] = $row["station_name"];
}

echo json_encode($stations);
mysqli_close($conn);
?>
