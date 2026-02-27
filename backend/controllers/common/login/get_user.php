<?php
session_start();
// get_user.php (and check_mobile.php)
require_once realpath(__DIR__ . "/../../../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);
$phone = $data["phone"] ?? "";

$stmt = $conn->prepare("SELECT * FROM users WHERE phone = ?");
$stmt->bind_param("s", $phone);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    echo json_encode(["success" => false]);
    exit;
}

if ($user["status"] == 0) {
    echo json_encode([
        "success" => false,
        "deactivated" => true,
        "reason" => $user["deactivation_reason"] ?? "Account deactivated"
    ]);
    exit;
}

$_SESSION["user"] = [
    "id" => $user["id"],
    "fullName" => $user["fullName"],
    "role" => $user["role"],
    "station" => $user["station"],
    "designation" => $user["designation"]
];

echo json_encode([
    "success" => true,
    "user" => $user
]);