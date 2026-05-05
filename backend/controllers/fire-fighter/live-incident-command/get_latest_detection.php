<?php

header('Content-Type: application/json');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

require_once realpath(__DIR__ . "/../../../config/db.php");

// ✅ GET DRONE CODE
$drone_code = isset($_GET['drone_code']) ? $_GET['drone_code'] : null;

if (!$drone_code) {
    echo json_encode(["status" => "no_fire"]);
    exit;
}

// 🔥 FETCH ONLY THIS DRONE'S DATA
$stmt = $conn->prepare("
    SELECT *
    FROM fire_detections
    WHERE drone_code = ?
    AND created_at >= NOW() - INTERVAL 10 SECOND
    ORDER BY id DESC
    LIMIT 1
");

$stmt->bind_param("s", $drone_code);
$stmt->execute();

$result = $stmt->get_result();
$row = $result->fetch_assoc();

// ❌ No data
if (!$row) {
    echo json_encode(["status" => "no_fire"]);
    exit;
}

// 🔥 FINAL SAFETY CHECK
$current_time = time();
$created_time = strtotime($row['created_at']);
$diff = $current_time - $created_time;

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