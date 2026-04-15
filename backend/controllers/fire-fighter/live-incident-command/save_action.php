<?php
header("Content-Type: application/json");

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No data"]);
    exit;
}

// Extract values
$timestamp = $data['timestamp'] ?? '';
$ip = $data['ip'] ?? '';
$incident_id = $data['incident_id'] ?? 'None';
$action = $data['action'] ?? '';
$response = $data['response'] ?? '';

// Example: store in file (you can use DB later)
$log = "[$timestamp] IP:$ip | Incident:$incident_id | Action:$action | Response:$response\n";

file_put_contents("action_history.txt", $log, FILE_APPEND);

// ✅ Response
echo json_encode([
    "status" => "success",
    "message" => "Action stored"
]);