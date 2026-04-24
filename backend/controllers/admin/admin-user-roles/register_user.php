<?php
session_start();

/* ---------- CORS ---------- */
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once realpath(__DIR__ . "/../../../config/db.php");
require_once realpath(__DIR__ . "/../../../helpers/logActivity.php");

/* ---------- INPUT ---------- */
$data = json_decode(file_get_contents("php://input"), true);

$fullName    = trim($data["fullName"] ?? "");
$address     = trim($data["address"] ?? "");
$email       = trim($data["email"] ?? "");
$phone       = trim($data["phone"] ?? "");
$designation = trim($data["designation"] ?? "");
$role        = trim($data["role"] ?? "");
$station     = trim($data["station"] ?? "");

/* ---------- VALIDATION ---------- */
if (!$fullName  || !$address || !$phone || !$designation || !$role || !$station) {
    echo json_encode(["success"=>false,"message"=>"Required fields missing"]);
    exit;
}

if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success"=>false,"message"=>"Please enter valid Email"]);
    exit;
}

if (!preg_match("/^[0-9]{10}$/", $phone)) {
    echo json_encode(["success"=>false,"message"=>"Please enter valid number"]);
    exit;
}

/* ---------- DUPLICATE ---------- */
$dup = $conn->prepare("SELECT id FROM users WHERE email=? OR phone=? LIMIT 1");
$dup->bind_param("ss",$email,$phone);
$dup->execute();
$dup->store_result();

if ($dup->num_rows > 0) {
    echo json_encode([
        "success"=>false,
        "message"=>"Email or Mobile number is already registered"
    ]);
    exit;
}
$dup->close();

/* ---------- INSERT ---------- */
$stmt = $conn->prepare("
INSERT INTO users (fullName,address,email,phone,designation,role,station)
VALUES (?,?,?,?,?,?,?)
");

$stmt->bind_param("sssssss",$fullName,$address,$email,$phone,$designation,$role,$station);

if ($stmt->execute()) {

    $newUserId = $stmt->insert_id;

    /* ---------- LOG ---------- */
    $logUser = $_SESSION["user"] ?? [
        "id"=>null,
        "fullName"=>"SYSTEM",
        "role"=>"SYSTEM"
    ];

    $description =
        "Added user {$fullName} ({$phone}):\n"
        . "role: {$role}\n"
        . "station: {$station}";

    logActivity(
        $conn,
        $logUser,
        "ADD_USER",
        "USER",
        $description,
        $newUserId
    );

    echo json_encode([
        "success"=>true,
        "message"=>"User Registered Successfully"
    ]);

} else {
    echo json_encode([
        "success"=>false,
        "message"=>"Insert failed"
    ]);
}

$stmt->close();
$conn->close();