<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

// Fetch all stations from fire_stations table
$sql = "SELECT station_name FROM fire_station ORDER BY station_name ASC";
$result = mysqli_query($conn, $sql);

$stations = [];

while ($row = mysqli_fetch_assoc($result)) {
    $stations[] = $row['station_name'];
}

echo json_encode($stations);

mysqli_close($conn);
?>
