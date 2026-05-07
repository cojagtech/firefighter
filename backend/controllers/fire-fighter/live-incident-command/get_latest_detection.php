<?php

header('Content-Type: application/json');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

require_once realpath(__DIR__ . "/../../../config/db.php");

// ==============================
// GET DRONE ID
// ==============================
$droneId = $_GET['droneId'] ?? '';

// ❌ droneId missing
if (empty($droneId)) {
    echo json_encode([
        "status" => "error",
        "message" => "droneId is required"
    ]);
    exit;
}

// ==============================
// FETCH LATEST DETECTION
// ONLY FOR SELECTED DRONE
// ==============================
$query = "
    SELECT *
    FROM fire_detections
    WHERE drone_id = ?
    AND created_at >= NOW() - INTERVAL 10 SECOND
    ORDER BY id DESC
    LIMIT 1
";

$stmt = $conn->prepare($query);

if (!$stmt) {
    echo json_encode([
        "status" => "error",
        "message" => "Prepare failed",
        "error" => $conn->error
    ]);
    exit;
}

$stmt->bind_param("s", $droneId);

if (!$stmt->execute()) {
    echo json_encode([
        "status" => "error",
        "message" => "Execute failed",
        "error" => $stmt->error
    ]);
    exit;
}

$result = $stmt->get_result();

$row = $result->fetch_assoc();

// ==============================
// NO FIRE FOUND
// ==============================
if (!$row) {
    echo json_encode([
        "status" => "no_fire"
    ]);
    exit;
}

// ==============================
// FINAL SAFETY CHECK
// ==============================
$currentTime = time();
$createdTime = strtotime($row['created_at']);

$diff = $currentTime - $createdTime;

// ==============================
// RETURN RESPONSE
// ==============================
if ($diff <= 10) {

    echo json_encode([
        "status" => "fire",
        "data" => $row
    ]);

} else {

    echo json_encode([
        "status" => "no_fire"
    ]);
}

// ==============================
// CLEANUP
// ==============================
$stmt->close();
$conn->close();
?>