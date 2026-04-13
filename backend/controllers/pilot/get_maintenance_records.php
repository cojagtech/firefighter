<?php
session_start();
require_once realpath(__DIR__ . "/../../config/db.php");

$station = $_SESSION['user']['station'];

$result = $conn->query("
  SELECT * FROM maintenance_requests
  WHERE station = '$station'
  ORDER BY created_at DESC
");

$data = [];

while ($row = $result->fetch_assoc()) {
  $data[] = $row;
}

echo json_encode([
  "success" => true,
  "records" => $data
]);