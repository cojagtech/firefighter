<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

// Logged-in user's station (from React request)
$station = $_GET['station'] ?? null;

if ($station) {
    // Clean and escape station name
    $stationSafe = mysqli_real_escape_string($conn, trim($station));

    // Fetch only vehicles from this station
    $sql = "
        SELECT id, name, type, registration, device_id, location, status, station, created_at
        FROM vehicles
        WHERE LOWER(TRIM(station)) = LOWER(TRIM('$stationSafe'))
        ORDER BY id DESC
    ";
} else {
    // If station not passed, return all vehicles
    $sql = "
        SELECT id, name, type, registration, device_id, location, status, station, created_at
        FROM vehicles
        ORDER BY id DESC
    ";
}

$result = mysqli_query($conn, $sql);

$vehicles = [];

while ($row = mysqli_fetch_assoc($result)) {
    $vehicles[] = [
        "id"           => $row["id"],
        "name"         => $row["name"],
        "type"         => $row["type"],
        "registration" => $row["registration"],
        "device_id"    => $row["device_id"],
        "location"     => $row["location"],
        "status"       => $row["status"],
        "station"      => $row["station"],
        "created_at"   => $row["created_at"]
        
    ];
}

echo json_encode($vehicles);
mysqli_close($conn);
