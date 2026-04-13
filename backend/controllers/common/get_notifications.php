<?php
session_start();

header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../config/db.php");

// =====================
// FETCH ALL NOTIFICATIONS
// =====================
$query = "
    SELECT *
    FROM notifications
    ORDER BY created_at DESC
";

$result = $conn->query($query);

$data = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['is_read'] = (int)$row['is_read'];
        $data[] = $row;
    }
}

// =====================
// RESPONSE
// =====================
echo json_encode([
    "success" => true,
    "notifications" => $data
]);