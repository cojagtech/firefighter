<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"];
$status = $data["status"];
$reason = $data["reason"] ?? null;

// If deactivating → save reason
if ($status == 0) {
    $sql = "UPDATE users SET status = 0, deactivation_reason = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $reason, $id);
} 
// If activating → clear reason
else {
    $sql = "UPDATE users SET status = 1, deactivation_reason = NULL WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error updating user"
    ]);
}
