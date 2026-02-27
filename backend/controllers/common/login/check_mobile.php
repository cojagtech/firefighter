<?php
// get_user.php (and check_mobile.php)
require_once realpath(__DIR__ . "/../../../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);
$phone = $data["phone"] ?? "";

$stmt = $conn->prepare("SELECT id FROM users WHERE phone = ?");
$stmt->bind_param("s", $phone);
$stmt->execute();
$result = $stmt->get_result();

echo json_encode([
    "exists" => $result->num_rows > 0
]);