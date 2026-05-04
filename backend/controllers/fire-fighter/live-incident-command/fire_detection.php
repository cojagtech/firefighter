<?php

require_once realpath(__DIR__ . "/../../../config/db.php");

// Set response type
header("Content-Type: application/json");

// Read raw input
$raw_input = file_get_contents("php://input");

// Decode JSON
$data = json_decode($raw_input, true);

// ✅ 1. Validate JSON
if (!$data) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Invalid JSON input"
    ]);
    exit;
}

// ✅ 2. Safely extract values
$drone_id         = $data["drone_id"] ?? "";
$timestamp        = $data["event_timestamp"] ?? null;
$alert_type       = $data["alert_type"] ?? "";
$confidence       = $data["confidence"] ?? 0;
$fire_count       = $data["fire_count"] ?? 0;
$intensity_score  = $data["intensity_score"] ?? 0;   // ✅ NEW
$intensity_level  = $data["intensity_level"] ?? "";
$location         = $data["location"] ?? "";

// ✅ 3. Validate required fields
if ($timestamp === null) {
    http_response_code(422);
    echo json_encode([
        "status" => "error",
        "message" => "Missing required field: event_timestamp"
    ]);
    exit;
}

// ✅ 4. Prepare statement
$stmt = $conn->prepare("
    INSERT INTO fire_detections (drone_id, event_timestamp, alert_type, confidence, fire_count, intensity_score, intensity_level, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
");

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Prepare failed",
        "error" => $conn->error
    ]);
    exit;
}

// ✅ 5. Bind parameters
$stmt->bind_param(
    "isddiss",
    $drone_id,      
    $timestamp,
    $alert_type,
    $confidence,
    $fire_count,
    $intensity_score,
    $intensity_level,
    $location
);

// ✅ 6. Execute
if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Fire detection saved",
        "id" => $stmt->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database insert failed",
        "error" => $stmt->error
    ]);
}

// ✅ 7. Cleanup
$stmt->close();
$conn->close();
