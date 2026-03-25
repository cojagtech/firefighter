<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

$sql = "SELECT id, fullName, role, station, status, deactivation_reason FROM users ORDER BY id DESC";
$result = $conn->query($sql);

$users = [];

while ($row = $result->fetch_assoc()) {
    $users[] = [
        "id" => $row["id"],
        "fullName" => trim($row["fullName"]), // ✅ FIX
        "role" => trim($row["role"]),         // ✅ FIX
        "station" => trim($row["station"]),   // ✅ FIX
        "active" => (int)$row["status"] === 1,
        "reason" => $row["deactivation_reason"]
    ];
}

echo json_encode([
    "success" => true,
    "users" => $users
]);