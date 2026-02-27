<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"];

$sql = "SELECT id, fullName, address, email, phone, designation, role, station, status 
        FROM users WHERE id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode([
        "success" => true,
        "user" => $result->fetch_assoc()
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "User not found"
    ]);
}
