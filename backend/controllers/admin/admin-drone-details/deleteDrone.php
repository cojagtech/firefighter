<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once realpath(__DIR__ . "/../../../config/db.php");
require_once realpath(__DIR__ . "/../../../helpers/logActivity.php");

$drone_code = $_POST['drone_code'] ?? null;

if (!$drone_code) {
    echo json_encode(["success" => false, "error" => "drone_code is required"]);
    exit();
}

$logUser = $_SESSION["user"] ?? [
    "id"       => null,
    "fullName" => "SYSTEM",
    "role"     => "SYSTEM"
];

$conn->begin_transaction();

try {
    // Check karo drone exist karta hai
    $check = $conn->prepare("SELECT id, drone_name FROM drones WHERE drone_code = ? LIMIT 1");
    $check->bind_param("s", $drone_code);
    $check->execute();
    $result = $check->get_result()->fetch_assoc();

    if (!$result) {
        echo json_encode(["success" => false, "error" => "Drone not found: " . $drone_code]);
        exit();
    }

    $drone_name = $result['drone_name'];

    // Delete karo
    $stmt = $conn->prepare("DELETE FROM drones WHERE drone_code = ?");
    $stmt->bind_param("s", $drone_code);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        throw new Exception("Failed to delete drone");
    }

    logActivity(
        $conn,
        $logUser,
        "DELETE_DRONE",
        "DRONE",
        "Deleted drone ($drone_name) with code $drone_code",
        null
    );

    $conn->commit();

    echo json_encode(["success" => true, "message" => "Drone deleted successfully"]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>