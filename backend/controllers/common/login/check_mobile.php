<?php
require_once realpath(__DIR__ . "/../../../config/db.php");

// Accept both JSON POST or query string
$data = json_decode(file_get_contents("php://input"), true);
$phone = $data['phone'] ?? $_GET['mobile'] ?? '';

if (!$phone) {
    echo json_encode(["error" => "No phone number provided"]);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM users WHERE phone = ?");
$stmt->bind_param("s", $phone);
$stmt->execute();
$result = $stmt->get_result();

echo json_encode([
    "exists" => $result->num_rows > 0
]);