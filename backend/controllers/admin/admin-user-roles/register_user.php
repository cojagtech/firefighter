<?php
session_start();

/* ================= CORS ================= */
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
require_once("../../../helpers/logActivity.php");

/* ================= READ INPUT ================= */
$data = json_decode(file_get_contents("php://input"), true);

$fullName    = $data["fullName"] ?? "";
$address     = $data["address"] ?? "";
$email       = $data["email"] ?? "";
$phone       = $data["phone"] ?? "";
$designation = $data["designation"] ?? "";
$role        = $data["role"] ?? "";
$station     = $data["station"] ?? "";

/* ================= VALIDATION ================= */
if (!$fullName || !$phone || !$role || !$station) {
    echo json_encode([
        "success" => false,
        "message" => "Required fields missing"
    ]);
    exit;
}

/* ================= INSERT USER ================= */
$sql = "
    INSERT INTO users
    (fullName, address, email, phone, designation, role, station)
    VALUES (?, ?, ?, ?, ?, ?, ?)
";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "sssssss",
    $fullName,
    $address,
    $email,
    $phone,
    $designation,
    $role,
    $station
);

if ($stmt->execute()) {

    $newUserId = $stmt->insert_id;

    /* ================= AUDIT LOG ================= */
    $logUser = $_SESSION["user"] ?? [
        "id"   => null,
        "name" => "SYSTEM",
        "role" => "SYSTEM"
    ];

    if (function_exists("logActivity")) {
        logActivity(
            $conn,
            $logUser,
            "ADD_USER",
            "USER",
            "Created new user ($fullName) with role $role at station $station",
            $newUserId
        );
    }

    echo json_encode([
        "success" => true,
        "message" => "User Registered Successfully"
    ]);

} else {
    echo json_encode([
        "success" => false,
        "message" => $conn->error
    ]);
}

$stmt->close();
$conn->close();
