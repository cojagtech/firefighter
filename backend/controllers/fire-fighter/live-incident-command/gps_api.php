<?php
header("Content-Type: application/json");

// Show errors for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Allow only POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Only POST requests allowed"
    ]);
    exit;
}

// Check required parameters
if (!isset($_POST['gps_id'], $_POST['latitude'], $_POST['longitude'], $_POST['speed'], $_POST['altitude'])) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Missing GPS data"
    ]);
    exit;
}

// Get POST values
$gps_id = $_POST['gps_id'];
$latitude = floatval($_POST['latitude']);
$longitude = floatval($_POST['longitude']);
$speed = floatval($_POST['speed']);
$altitude = floatval($_POST['altitude']);


require_once realpath(__DIR__ . "/../../../config/db.php");

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed"
    ]);
    exit;
}

// Prepare SQL statement
$stmt = $conn->prepare("INSERT INTO gps_drone_records (drone_id, latitude, longitude, altitude, speed) VALUES (?, ?, ?, ?, ?)");

$stmt->bind_param("sdddd", $gps_id, $latitude, $longitude, $altitude, $speed);

// Execute query
if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "GPS data stored successfully"
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Failed to insert data"
    ]);
}

// Close connection
$stmt->close();
$conn->close();
?>