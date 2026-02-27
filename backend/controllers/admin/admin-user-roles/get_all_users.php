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
        "name" => $row["fullName"],
        "role" => $row["role"],
        "station" => $row["station"],
        "active" => $row["status"] == 1 ? true : false,
        "reason" => $row["deactivation_reason"]
    ];
}

echo json_encode([
    "success" => true,
    "users" => $users
]);
