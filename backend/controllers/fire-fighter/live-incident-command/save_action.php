<?php
header("Content-Type: application/json");

// DB connection
require_once realpath(__DIR__ . "/../../../config/db.php");

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid JSON"
    ]);
    exit;
}

// Extract values
$timestamp = $data['timestamp'] ?? '';
$ip = $data['ip'] ?? '';
$incident_id = $data['incident_id'] ?? 'None';
$action = $data['action'] ?? '';
$response = $data['response'] ?? '';

// Prepare query (SAFE 🔐)
$stmt = $conn->prepare("INSERT INTO action_logs (timestamp, ip, incident_id, action, response) VALUES (?, ?, ?, ?, ?)");

$stmt->bind_param("sssss", $timestamp, $ip, $incident_id, $action, $response);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Saved to DB"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "DB insert failed"
    ]);
}

$stmt->close();
$conn->close();