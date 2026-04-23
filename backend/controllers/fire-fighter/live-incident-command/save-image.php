<?php
header("Content-Type: application/json");

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

$incident_id = $data['incident_id'];
$image_url = $data['image_url'];
$confidence = $data['confidence'];
$timestamp = $data['timestamp'];

// DB connection
$conn = new mysqli("localhost", "DB_USER", "DB_PASS", "DB_NAME");

if ($conn->connect_error) {
    echo json_encode(["status" => "db_error"]);
    exit;
}

// Insert query
$stmt = $conn->prepare("INSERT INTO fire_images (incident_id, image_url, confidence, timestamp) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssdi", $incident_id, $image_url, $confidence, $timestamp);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error"]);
}

$stmt->close();
$conn->close();
?>