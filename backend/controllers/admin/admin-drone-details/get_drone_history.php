<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

$drone_id = $_GET['drone_id'] ?? null;

if (!$drone_id) {
    echo json_encode([
        'success' => false,
        'message' => 'Drone ID missing'
    ]);
    exit;
}

$sql = "SELECT 
            dm.id, 
            dm.drone_id, 
            dm.incident_id, 
            dm.start_time, 
            dm.end_time, 
            dm.status, 
            d.pilot_name,
            i.name AS incident_name,
            i.location AS incident_location
        FROM drone_missions dm
        LEFT JOIN drones d ON dm.drone_id = d.id
        LEFT JOIN incidents i ON dm.incident_id = i.id
        WHERE dm.drone_id = ? 
        ORDER BY dm.start_time DESC";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'SQL prepare failed: ' . $conn->error
    ]);
    exit;
}

$stmt->bind_param("i", $drone_id);
$stmt->execute();

$result = $stmt->get_result();

$history = [];

while ($row = $result->fetch_assoc()) {
    $history[] = [
        'id' => $row['id'],
        'drone_id' => $row['drone_id'],
        'incident_id' => $row['incident_id'],
        'incident_name' => $row['incident_name'],
        'incident_location' => $row['incident_location'],
        'start_time' => $row['start_time'],
        'end_time' => $row['end_time'],
        'status' => $row['status'],
        'pilot_name' => $row['pilot_name']
    ];
}

echo json_encode([
    'success' => true,
    'history' => $history
]);