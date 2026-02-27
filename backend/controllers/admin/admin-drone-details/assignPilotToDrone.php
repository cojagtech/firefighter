<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");
require "../../../helpers/logActivity.php";

$drone_code      = $_POST['drone_code'] ?? null;
$pilot_id        = $_POST['pilot_id'] ?? null;
$pilot_name      = $_POST['pilot_name'] ?? null;
$pilot_email     = $_POST['pilot_email'] ?? null;
$pilot_phone     = $_POST['pilot_phone'] ?? null;
$pilot_role      = $_POST['pilot_role'] ?? null;

if (!$drone_code || !$pilot_id) {
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

$logUser = $_SESSION["user"] ?? [
    "id"       => null,
    "fullName" => "SYSTEM",
    "role"     => "SYSTEM"
];

$conn->begin_transaction();

try {
    $check = $conn->prepare("
        SELECT COUNT(*) AS cnt
        FROM drones
        WHERE pilot_id = ?
          AND pilot_status = 'assigned'
    ");
    $check->bind_param("i", $pilot_id);
    $check->execute();
    $res = $check->get_result()->fetch_assoc();

    if ($res['cnt'] > 0) {
        echo json_encode([
            "success" => false,
            "error" => "Pilot already assigned to another drone"
        ]);
        exit;
    }

    $stmt = $conn->prepare("
        UPDATE drones SET
            pilot_id = ?,
            pilot_name = ?,
            pilot_email = ?,
            pilot_phone = ?,
            pilot_role = ?,
            pilot_status = 'assigned'
        WHERE drone_code = ?
          AND pilot_id IS NULL
    ");

    $stmt->bind_param(
        "isssss",
        $pilot_id,
        $pilot_name,
        $pilot_email,
        $pilot_phone,
        $pilot_role,
        $drone_code
    );

    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        throw new Exception("Drone already has a pilot");
    }

    logActivity(
        $conn,
        $logUser,
        "ASSIGN_PILOT",
        "DRONE",
        "Assigned pilot ($pilot_name) to drone $drone_code",
        $pilot_id
    );

    $conn->commit();

    echo json_encode(["success" => true]);

} catch (Exception $e) {

    $conn->rollback();

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
