<?php

header('Content-Type: application/json');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

// 🔒 NEVER output HTML errors
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once realpath(__DIR__ . "/../../../config/db.php");

try {

    $drone_code = $_GET['drone_code'] ?? null;

    if (!$drone_code) {
        echo json_encode(["status" => "no_fire"]);
        exit;
    }

    $stmt = $conn->prepare("
        SELECT *
        FROM fire_detections
        WHERE drone_id = ?
        AND created_at >= NOW() - INTERVAL 10 SECOND
        ORDER BY id DESC
        LIMIT 1
    ");

    if (!$stmt) {
        throw new Exception($conn->error);
    }

    $stmt->bind_param("s", $drone_code);

    if (!$stmt->execute()) {
        throw new Exception($stmt->error);
    }

    $result = $stmt->get_result();

    if (!$result) {
        throw new Exception("Result fetch failed");
    }

    $row = $result->fetch_assoc();

    if (!$row) {
        echo json_encode(["status" => "no_fire"]);
        exit;
    }

    $diff = time() - strtotime($row['created_at']);

    if ($diff <= 10) {
        echo json_encode([
            "status" => "fire",
            "data" => $row
        ]);
    } else {
        echo json_encode(["status" => "no_fire"]);
    }

} catch (Exception $e) {

    // ✅ ALWAYS return JSON, never empty
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}