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
$new_pilot_id    = $_POST['pilot_id'] ?? null;
$new_pilot_name  = $_POST['pilot_name'] ?? null;
$new_pilot_email = $_POST['pilot_email'] ?? null;
$new_pilot_phone = $_POST['pilot_phone'] ?? null;
$new_pilot_role  = $_POST['pilot_role'] ?? null;
$old_pilot_id    = $_POST['old_pilot_id'] ?? null;

if (!$drone_code || !$new_pilot_id || !$old_pilot_id) {
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
    $check->bind_param("i", $new_pilot_id);
    $check->execute();
    $res = $check->get_result()->fetch_assoc();

    if ($res['cnt'] > 0) {
        echo json_encode([
            "success" => false,
            "error" => "Pilot already assigned to another drone"
        ]);
        exit;
    }

$free = $conn->prepare("
    UPDATE drones
    SET pilot_status = 'available'
    WHERE pilot_id = ?
");
$free->bind_param("i", $old_pilot_id);
$free->execute();

$assign = $conn->prepare("
    UPDATE drones SET
        pilot_id = ?,
        pilot_name = ?,
        pilot_email = ?,
        pilot_phone = ?,
        pilot_role = ?,
        pilot_status = 'assigned'
    WHERE drone_code = ?
");

$assign->bind_param(
    "isssss",
    $new_pilot_id,
    $new_pilot_name,
    $new_pilot_email,
    $new_pilot_phone,
    $new_pilot_role,
    $drone_code
);

$assign->execute();

logActivity(
    $conn,
    $logUser,
    "REASSIGN_PILOT",
    "DRONE",
    "Reassigned pilot ($new_pilot_name) to drone $drone_code",
    $new_pilot_id
);


    $conn->commit();

    echo json_encode(["success" => true]);

} catch (Exception $e) {

    $conn->rollback();

    echo json_encode([
        "success" => false,
        "error" => "Failed to reassign pilot"
    ]);
}
