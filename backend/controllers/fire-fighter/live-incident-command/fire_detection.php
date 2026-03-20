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

// ✅ 2. Safely extract values (no crash if missing)
$timestamp        = $data["timestamp"] ?? null;
$alert_type       = $data["alert_type"] ?? "";
$confidence       = $data["confidence"] ?? 0;
$fire_count       = $data["fire_count"] ?? 0;
$intensity_level  = $data["intensity_level"] ?? "";
$location         = $data["location"] ?? "";

// ✅ 3. Validate required fields
if ($timestamp === null) {
    http_response_code(422);
    echo json_encode([
        "status" => "error",
        "message" => "Missing required field: timestamp"
    ]);
    exit;
}

// ✅ 4. Prepare statement safely
$stmt = $conn->prepare("
    INSERT INTO fire_detections 
    (event_timestamp, alert_type, confidence, fire_count, intensity_level, location)
    VALUES (?, ?, ?, ?, ?, ?)
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
    "isdiss",
    $timestamp,
    $alert_type,
    $confidence,
    $fire_count,
    $intensity_level,
    $location
);

// ✅ 6. Execute and verify
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