<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

require_once realpath(__DIR__ . "/../../../config/db.php");

if (!$conn) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit;
}

if (!isset($_GET['name'])) {
    echo json_encode(["success" => false, "message" => "Station name required"]);
    exit;
}

// Use the GET param
$station = mysqli_real_escape_string($conn, $_GET['name']);

// Correct column names
$sql = "SELECT id, station_name, latitude, longitude 
        FROM fire_station 
        WHERE TRIM(LOWER(station_name)) = TRIM(LOWER('$station'))
        LIMIT 1";

$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode(["success" => false, "message" => mysqli_error($conn)]);
    exit;
}

if ($row = mysqli_fetch_assoc($result)) {
    echo json_encode([
        "success" => true,
        "station" => [
            "id" => $row['id'],
            "name" => $row['station_name'],
            "latitude" => $row['latitude'],
            "longitude" => $row['longitude']
        ]
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Station not found"
    ]);
}
