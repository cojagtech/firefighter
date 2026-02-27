<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

/* 🔴 VERY IMPORTANT: Preflight handle */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}


require_once realpath(__DIR__ . "/../../../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"];

$sql = "UPDATE users SET
  fullName = ?,
  address = ?,
  email = ?,
  phone = ?,
  designation = ?,
  role = ?,
  station = ?
WHERE id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
  "sssssssi",
  $data["fullName"],
  $data["address"],
  $data["email"],
  $data["phone"],
  $data["designation"],
  $data["role"],
  $data["station"],
  $id
);

if ($stmt->execute()) {
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "message" => $conn->error]);
}
