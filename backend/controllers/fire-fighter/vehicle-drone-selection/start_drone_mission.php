<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

require_once realpath(__DIR__ . "/../../../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

$incident_id = $data['incident_id'] ?? null;
$drone_id = $data['drone_id'] ?? null;

if (!$incident_id || !$drone_id) {
    echo json_encode(["success" => false, "message" => "Missing data"]);
    exit;
}

// Insert mission
$sql = "INSERT INTO drone_missions (incident_id, drone_id, start_time, status)
        VALUES (?, ?, NOW(), 'started')";

$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $incident_id, $drone_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "mission_id" => $stmt->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}