<?php
// ✅ CORS HEADERS (must be first, before ANY output)
header("Access-Control-Allow-Origin: http://localhost:5173"); // exact origin (NO *)
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// ✅ HANDLE PREFLIGHT REQUEST
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ✅ DB CONNECTION
require_once realpath(__DIR__ . "/../../../config/db.php");

// ✅ QUERY
$result = $conn->query("
    SELECT * FROM notifications
    ORDER BY created_at DESC
");

$data = [];

// ✅ FETCH DATA
while ($row = $result->fetch_assoc()) {
    $row['is_read'] = (int)$row['is_read']; // force integer
    $data[] = $row;
}

// ✅ RESPONSE
echo json_encode([
    "success" => true,
    "notifications" => $data
]);