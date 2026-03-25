<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false]);
    exit;
}

require_once realpath(__DIR__ . "/../../../config/db.php");
require_once realpath(__DIR__ . "/../../../helpers/logActivity.php");

function fail(int $code = 400): void {
    http_response_code($code);
    echo json_encode(["success" => false]);
    exit;
}

$data = $_POST;

$required = [
    'drone_code',
    'drone_name',
    'status',
    'station',
    'flight_hours',
    'health_status',
    'firmware_version',
    'is_ready'
];

foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === '') {
        fail(422);
    }
}

$flightHours = (float) $data['flight_hours'];
if ($flightHours < 0) {
    fail(422);
}

$isReady = ((string)$data['is_ready'] === "1") ? 1 : 0;

$logUser = $_SESSION["user"] ?? [
    "id" => null,
    "fullName" => "SYSTEM",
    "role" => "SYSTEM"
];

try {
    $conn->begin_transaction();

    $check = $conn->prepare(
        "SELECT id FROM drones WHERE drone_code = ? LIMIT 1"
    );
    $check->bind_param("s", $data['drone_code']);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        fail(409);
    }
    $check->close();

    $stmt = $conn->prepare(
        "INSERT INTO drones
        (drone_code, drone_name, status, flight_hours, health_status, firmware_version, is_ready, station)
        VALUES (?,?,?,?,?,?,?,?)"
    );

    $stmt->bind_param(
        "sssdssis",
        $data['drone_code'],
        $data['drone_name'],
        $data['status'],
        $flightHours,
        $data['health_status'],
        $data['firmware_version'],
        $isReady,
        $data['station']
    );

    if (!$stmt->execute()) {
        throw new Exception("Insert failed");
    }

    $stmt->close();

    logActivity(
        $conn,
        $logUser,
        "ADD_DRONE",
        "DRONE",
        "Added new drone {$data['drone_name']} ({$data['drone_code']}) at station {$data['station']}",
        null
    );


    $conn->commit();

    echo json_encode(["success" => true]);

} catch (Throwable $e) {
    $conn->rollback();

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine()
    ]);
}
