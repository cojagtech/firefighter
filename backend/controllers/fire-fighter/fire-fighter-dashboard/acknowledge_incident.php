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
VALUES (?, ?, ?, 'ACKNOWLEDGE', 'INCIDENT', ?, ?, NOW())");

$description = "Incident ID: $incidentId acknowledged";

$stmt->bind_param("issss", $userId, $userName, $role, $description, $ip);
$stmt->execute();

// optional: update incident
$update = $conn->prepare("UPDATE incidents SET status='assigned' WHERE id=?");
$update->bind_param("s", $incidentId);
$update->execute();

echo json_encode(["success" => true]);