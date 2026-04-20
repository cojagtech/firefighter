<?php
require_once realpath(__DIR__ . "/../../../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

$userId = $data["user_id"];
$userName = $data["user_name"];
$role = $data["role"];
$incidentId = $data["incident_id"];
$ip = $_SERVER['REMOTE_ADDR'];

// 🔥 ACTIVITY LOG
$stmt = $conn->prepare("INSERT INTO activity_logs 
(user_id, user_name, role, action, module, description, ip_address, created_at)
VALUES (?, ?, ?, 'VIEW', 'INCIDENT', ?, ?, NOW())");

$description = "Viewed Incident ID: $incidentId";

$stmt->bind_param("issss", $userId, $userName, $role, $description, $ip);
$stmt->execute();

echo json_encode(["success" => true]);