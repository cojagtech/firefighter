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

$data = json_decode(file_get_contents("php://input"), true);

$name     = trim($data["name"] ?? "");
$type     = trim($data["type"] ?? "");
$reg      = strtoupper(trim($data["registrationNumber"] ?? ""));
$deviceId = strtoupper(trim($data["deviceId"] ?? ""));
$location = trim($data["location"] ?? "");
$station  = trim($data["station"] ?? "");
$status   = trim($data["status"] ?? "");

/* ---------- REQUIRED ---------- */
if (!$name || !$type || !$reg || !$deviceId || !$station || !$status) {
    echo json_encode([
        "success"=>false,
        "message"=>"Please fill all required fields"
    ]);
    exit;
}

/* ---------- NAME VALIDATION ---------- */
if (!preg_match("/^[A-Za-z\s]+$/", $name) || !preg_match("/^[A-Za-z\s]+$/", $type)) {
    echo json_encode(["success"=>false,"message"=>"Invalid name or type (must be letters only)"]);
    exit;
}

/* ---------- REGISTRATION ---------- */
if (!preg_match("/^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9\-]+$/", $reg)) {
    echo json_encode(["success"=>false,"message"=>"Registration No. must contain letters and numbers"]);
    exit;
}

/* ---------- DEVICE ID VALIDATION ---------- */
if (!str_starts_with($deviceId, "VTS-")) {
    echo json_encode([
        "success"=>false,
        "message"=>"Device ID must start with VTS-"
    ]);
    exit;
}

$suffix = substr($deviceId, 4);

if (!$suffix || !preg_match("/^(?=.*[0-9])[A-Z0-9\-]+$/", $suffix)) {
    echo json_encode([
        "success"=>false,
        "message"=>"Device ID must contain at least one number"
    ]);
    exit;
}

/* ---------- DUPLICATE ---------- */
$check = $conn->prepare("SELECT id FROM vehicles WHERE registration=? OR device_id=? LIMIT 1");
$check->bind_param("ss",$reg,$deviceId);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode([
        "success"=>false,
        "message"=>"Vehicle Registration or Device ID already exists"
    ]);
    exit;
}
$check->close();

/* ---------- INSERT ---------- */
$stmt = $conn->prepare("
INSERT INTO vehicles (name,type,registration,device_id,location,station,status)
VALUES (?,?,?,?,?,?,?)
");

$stmt->bind_param("sssssss",$name,$type,$reg,$deviceId,$location,$station,$status);

if ($stmt->execute()) {

    $vehicleId = $stmt->insert_id;

    $logUser = $_SESSION["user"] ?? [
        "id"=>null,
        "fullName"=>"SYSTEM",
        "role"=>"SYSTEM"
    ];

    logActivity(
        $conn,
        $logUser,
        "ADD_VEHICLE",
        "VEHICLE",
        "Added vehicle {$name} ({$reg}) at {$station}",
        $vehicleId
    );

    echo json_encode([
        "success"=>true,
        "message"=>"Vehicle Added Successfully"
    ]);

} else {
    echo json_encode([
        "success"=>false,
        "message"=>"Insert failed"
    ]);
}

$stmt->close();
mysqli_close($conn);