<?php
session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (empty($input['id']) || !is_numeric($input['id'])) {
    echo json_encode(["success" => false, "message" => "Invalid or missing vehicle ID"]);
    exit();
}

$id = (int) $input['id'];

require_once realpath(__DIR__ . "/../../../config/db.php");
require_once realpath(__DIR__ . "/../../../helpers/logActivity.php");

$logUser = $_SESSION["user"] ?? [
    "id"       => null,
    "fullName" => "SYSTEM",
    "role"     => "SYSTEM"
];

try {
    $conn->begin_transaction();

    // Fetch vehicle details before deleting for the log message
    $fetch = $conn->prepare("SELECT name, registration, station FROM vehicles WHERE id = ? LIMIT 1");
    $fetch->bind_param("i", $id);
    $fetch->execute();
    $result = $fetch->get_result();
    $vehicle = $result->fetch_assoc();
    $fetch->close();

    if (!$vehicle) {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Vehicle not found"]);
        exit();
    }

    $stmt = $conn->prepare("DELETE FROM vehicles WHERE id = ?");
    $stmt->bind_param("i", $id);

    if (!$stmt->execute()) {
        throw new Exception("Delete failed: " . $conn->error);
    }

    $stmt->close();

    logActivity(
        $conn,
        $logUser,
        "DELETE_VEHICLE",
        "VEHICLE",
        "Deleted vehicle {$vehicle['name']} ({$vehicle['registration']}) from station {$vehicle['station']}",
        null
    );

    $conn->commit();

    echo json_encode(["success" => true, "message" => "Vehicle deleted successfully"]);

} catch (Throwable $e) {
    $conn->rollback();

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>