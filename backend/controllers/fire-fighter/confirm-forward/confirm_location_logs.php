<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once realpath(__DIR__ . "/../../../config/db.php");


// 🔥 Enable error reporting (dev only)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 📥 Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

// 🧪 Debug (optional - remove in production)
file_put_contents("debug.txt", json_encode($data) . PHP_EOL, FILE_APPEND);

// 🧾 Extract values safely
$userId      = $data["user_id"] ?? 0;
$userName    = $data["user_name"] ?? "";
$role        = $data["role"] ?? "";
$action      = $data["action"] ?? "";
$module      = $data["module"] ?? "INCIDENT";
$description = $data["description"] ?? "";

$ip = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';

// ❗ Basic validation
if (!$userId || !$userName || !$action) {
    echo json_encode([
        "success" => false,
        "error" => "Missing required fields"
    ]);
    exit;
}

// 🧠 Prepare query (NO station_name, NO entity_id)
$stmt = $conn->prepare("
    INSERT INTO activity_logs 
    (user_id, user_name, role, action, module, description, ip_address, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
");

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "error" => "Prepare failed: " . $conn->error
    ]);
    exit;
}

// 🔗 Bind params (7 fields = 7 values)
$stmt->bind_param(
    "issssss",
    $userId,
    $userName,
    $role,
    $action,
    $module,
    $description,
    $ip
);

// 🚀 Execute
if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Log saved successfully"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "error" => "Execute failed: " . $stmt->error
    ]);
}

// 🔒 Cleanup
$stmt->close();
$conn->close();