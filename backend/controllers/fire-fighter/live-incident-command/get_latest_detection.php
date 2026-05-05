<?php

header('Content-Type: application/json');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

// ❗ disable HTML errors in production response
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once realpath(__DIR__ . "/../../../config/db.php");

$drone_code = $_GET['drone_code'] ?? null;

if (!$drone_code) {
    echo json_encode(["status" => "no_fire"]);
    exit;
}

// ✅ prepare safely
$stmt = $conn->prepare("
    SELECT *
    FROM fire_detections
    WHERE drone_code = ?
    AND created_at >= NOW() - INTERVAL 10 SECOND
    ORDER BY id DESC
    LIMIT 1
");

if (!$stmt) {
    echo json_encode([
        "status" => "error",
        "message" => $conn->error
    ]);
    exit;
}

$stmt->bind_param("s", $drone_code);
$stmt->execute();

$result = $stmt->get_result();

if (!$result) {
    echo json_encode([
        "status" => "error",
        "message" => "Query failed"
    ]);
    exit;
}

$row = $result->fetch_assoc();

if (!$row) {
    echo json_encode(["status" => "no_fire"]);
    exit;
}

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