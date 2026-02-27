<?php
session_start();

/* ---------- CORS ---------- */
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
require "../../../helpers/logActivity.php";

/* ---------- INPUT ---------- */
$data = json_decode(file_get_contents("php://input"), true);

$name     = trim($data["name"] ?? "");
$type     = trim($data["type"] ?? "");
$reg      = trim($data["registrationNumber"] ?? "");
$deviceId = trim($data["deviceId"] ?? "");
$location = trim($data["location"] ?? "");
$station  = trim($data["station"] ?? "");
$status   = $data["status"] ?? "available";

/* ---------- BASIC VALIDATION ---------- */
if (!$name || !$type || !$reg || !$deviceId || !$station) {
    echo json_encode(["success"=>false,"message"=>"Required fields missing"]);
    exit;
}

if (!preg_match("/^[A-Za-z\s]+$/", $name)) {
    echo json_encode(["success"=>false,"message"=>"Invalid vehicle name"]);
    exit;
}

if (!preg_match("/^[A-Za-z\s]+$/", $type)) {
    echo json_encode(["success"=>false,"message"=>"Invalid vehicle type"]);
    exit;
}

if (!preg_match("/^[A-Za-z0-9\-]+$/", $reg)) {
    echo json_encode(["success"=>false,"message"=>"Invalid registration number"]);
    exit;
}

if (!preg_match("/^[A-Za-z0-9\-]+$/", $deviceId)) {
    echo json_encode(["success"=>false,"message"=>"Invalid device ID"]);
    exit;
}

/* ---------- DUPLICATE CHECK ---------- */
$check = $conn->prepare(
    "SELECT id FROM vehicles WHERE registration = ? OR device_id = ? LIMIT 1"
);
$check->bind_param("ss", $reg, $deviceId);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "Vehicle with same Registration or Device ID already exists"
    ]);
    exit;
}
$check->close();

/* ---------- INSERT ---------- */
$stmt = $conn->prepare(
    "INSERT INTO vehicles
     (name, type, registration, device_id, location, station, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)"
);

$stmt->bind_param(
    "sssssss",
    $name,
    $type,
    $reg,
    $deviceId,
    $location,
    $station,
    $status
);

if ($stmt->execute()) {

    $vehicleId = $stmt->insert_id;

    $logUser = $_SESSION['user'] ?? [
        "id" => null,
        "name" => "SYSTEM",
        "role" => "SYSTEM"
    ];

    if (function_exists('logActivity')) {
        logActivity(
            $conn,
            $logUser,
            "ADD_VEHICLE",
            "VEHICLE",
            "Added vehicle ($reg) at station $station",
            $vehicleId
        );
    }

    echo json_encode([
        "success" => true,
        "message" => "Vehicle Added Successfully"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Vehicle insert failed"
    ]);
}

$stmt->close();
mysqli_close($conn);
