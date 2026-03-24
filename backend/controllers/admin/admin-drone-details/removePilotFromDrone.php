<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");
require_once realpath(__DIR__ . "/../../../helpers/logActivity.php");

$drone_code = $_POST['drone_code'] ?? null;

if (!$drone_code) {
    echo json_encode(["success" => false, "error" => "Missing drone_code"]);
    exit;
}

$logUser = $_SESSION["user"] ?? [
    "id"       => null,
    "fullName" => "SYSTEM",
    "role"     => "SYSTEM"
];

try {
    $conn->begin_transaction();

    $getPilot = $conn->prepare("
        SELECT pilot_id, pilot_name
        FROM drones
        WHERE drone_code = ?
    ");
    $getPilot->bind_param("s", $drone_code);
    $getPilot->execute();
    $pilotData = $getPilot->get_result()->fetch_assoc();
    $getPilot->close();


    $stmt = $conn->prepare("
        UPDATE drones SET
            pilot_id = NULL,
            pilot_name = NULL,
            pilot_email = NULL,
            pilot_phone = NULL,
            pilot_role = NULL,
            pilot_status = 'available'
        WHERE drone_code = ?
    ");
    $stmt->bind_param("s", $drone_code);
    $stmt->execute();
    $stmt->close();

    if (!empty($pilotData['pilot_id'])) {
        logActivity(
            $conn,
            $logUser,
            "REMOVE_PILOT",
            "DRONE",
            "Removed pilot ({$pilotData['pilot_name']}) from drone $drone_code",
            $pilotData['pilot_id']
        );
    }

    $conn->commit();

    echo json_encode(["success" => true]);

} catch (Exception $e) {

    $conn->rollback();

    echo json_encode([
        "success" => false,
        "error" => "Failed to remove pilot"
    ]);
}
