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

require_once realpath(__DIR__ . "/../../../config/db.php");
require_once realpath(__DIR__ . "/../../../helpers/logActivity.php");

$data = $_POST;

/* ---------- REQUIRED FIELDS ---------- */
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
        echo json_encode([
            "success" => false,
            "message" => "Please fill all required fields"
        ]);
        exit;
    }
}

/* ---------- VALIDATION ---------- */

// Drone code must be alphanumeric
if (!preg_match("/^DRN-?\d+$/", $data['drone_code'])) {
    echo json_encode([
        "success" => false,
        "message" => "Drone code must be alphanumeric"
    ]);
    exit;
}

// Flight hours
$flightHours = (float)$data['flight_hours'];
if ($flightHours < 0) {
    echo json_encode([
        "success" => false,
        "message" => "Flight hours cannot be negative"
    ]);
    exit;
}

$isReady = ((string)$data['is_ready'] === "1") ? 1 : 0;

/* ---------- USER ---------- */
$logUser = $_SESSION["user"] ?? [
    "id" => null,
    "fullName" => "SYSTEM",
    "role" => "SYSTEM"
];

try {
    $conn->begin_transaction();

    /* ---------- DUPLICATE CHECK ---------- */
    $check = $conn->prepare(
        "SELECT id FROM drones WHERE drone_code = ? LIMIT 1"
    );
    $check->bind_param("s", $data['drone_code']);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        echo json_encode([
            "success" => false,
            "message" => "Drone code already exists"
        ]);
        exit;
    }
    $check->close();

    /* ---------- INSERT ---------- */
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

    /* ---------- LOG ---------- */
    logActivity(
        $conn,
        $logUser,
        "ADD_DRONE",
        "DRONE",
        "Added drone {$data['drone_name']} ({$data['drone_code']}) at {$data['station']} .",
        null
    );

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Drone added successfully"
    ]);

} catch (Throwable $e) {
    $conn->rollback();

    echo json_encode([
        "success" => false,
        "message" => "Server error"
    ]);
}