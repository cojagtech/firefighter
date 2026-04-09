<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include database connection
require_once realpath(__DIR__ . "/../../../config/db.php"); // expects $conn (MySQLi)

if (!isset($conn)) {
    echo json_encode(['success' => false, 'message' => 'Database connection not initialized']);
    exit;
}

// Get incident_id from query
$incident_id = isset($_GET['incident_id']) ? trim($_GET['incident_id']) : '';
if ($incident_id === '') {
    echo json_encode(['success' => false, 'message' => 'Invalid incident ID']);
    exit;
}

// SQL query using correct column names
$sql = "
    SELECT 
        g.latitude, 
        g.longitude, 
        g.timestamp,
        i.name AS incident_name, 
        i.location AS incident_location
    FROM drone_gps_logs g
    LEFT JOIN incidents i ON g.incident_id = i.id
    WHERE g.incident_id = ?
    ORDER BY g.timestamp ASC
";

// Prepare statement
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Prepare failed: ' . $conn->error,
        'sql' => $sql
    ]);
    exit;
}

// Bind string parameter (incident_id is VARCHAR)
$stmt->bind_param("s", $incident_id);

if (!$stmt->execute()) {
    echo json_encode([
        'success' => false,
        'message' => 'Execute failed: ' . $stmt->error
    ]);
    exit;
}

// Fetch results
$result = $stmt->get_result();

$gps_logs = [];
$incidentInfo = [];

while ($row = $result->fetch_assoc()) {
    $gps_logs[] = [
        'lat' => floatval($row['latitude']),
        'lng' => floatval($row['longitude']),
        'timestamp' => $row['timestamp']
    ];

    if (empty($incidentInfo)) {
        $incidentInfo = [
            'incident_name' => $row['incident_name'],
            'incident_location' => $row['incident_location']
        ];
    }
}

$stmt->close();

// Handle no logs found
if (empty($gps_logs)) {
    echo json_encode(['success' => false, 'message' => 'No GPS logs found for this incident']);
    exit;
}

// Return success
echo json_encode([
    'success' => true,
    'incident' => $incidentInfo,
    'gps_logs' => $gps_logs
]);