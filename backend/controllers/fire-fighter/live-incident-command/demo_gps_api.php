<?php
header("Content-Type: application/json");
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status"=>"error","message"=>"Only POST requests allowed"]);
    exit;
}

// Accept JSON input
$contentType = $_SERVER["CONTENT_TYPE"] ?? '';
if (strpos($contentType, 'application/json') !== false) {
    $input = json_decode(file_get_contents("php://input"), true);
    if ($input) {
        $_POST = $input;
    }
}

// Required fields
$required_fields = ['gps_id', 'latitude', 'longitude', 'speed'];

foreach ($required_fields as $field) {
    if (!isset($_POST[$field]) || $_POST[$field] === '') {
        http_response_code(400);
        echo json_encode(["status"=>"error","message"=>"Missing or empty field: $field"]);
        exit;
    }
}

// Validate numeric values
if (!is_numeric($_POST['latitude']) || !is_numeric($_POST['longitude']) || !is_numeric($_POST['speed'])) {
    http_response_code(400);
    echo json_encode(["status"=>"error","message"=>"Latitude, longitude, and speed must be numeric"]);
    exit;
}

// Assign values
$drone_code = $_POST['gps_id']; // renamed for clarity
$latitude   = floatval($_POST['latitude']);
$longitude  = floatval($_POST['longitude']);
$speed      = floatval($_POST['speed']);

// GPS range validation
if ($latitude < -90 || $latitude > 90 || $longitude < -180 || $longitude > 180) {
    http_response_code(400);
    echo json_encode(["status"=>"error","message"=>"Invalid GPS coordinates"]);
    exit;
}

// DB connection
require_once realpath(__DIR__ . "/../../../config/db.php");

if (!$conn || $conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"DB connection failed"]);
    exit;
}

// 🔹 1. Map drone_code → drone_id
$mapStmt = $conn->prepare("SELECT id FROM drones WHERE drone_code = ?");
if (!$mapStmt) {
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"Prepare failed: ".$conn->error]);
    exit;
}

$mapStmt->bind_param("s", $drone_code);

if (!$mapStmt->execute()) {
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"Execute failed: ".$mapStmt->error]);
    exit;
}

$mapRes = $mapStmt->get_result();
if (!$mapRes) {
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"Query failed: ".$mapStmt->error]);
    exit;
}

$droneRow = $mapRes->fetch_assoc();

if (!$droneRow) {
    http_response_code(404);
    echo json_encode(["status"=>"error","message"=>"Unknown drone code: $drone_code"]);
    exit;
}

$drone_id = $droneRow['id'];

// 🔹 2. Get active mission
$query = $conn->prepare("
    SELECT incident_id 
    FROM drone_missions 
    WHERE drone_id = ? AND status = 'started'
    ORDER BY start_time DESC 
    LIMIT 1
");

if (!$query) {
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"Prepare failed: ".$conn->error]);
    exit;
}

$query->bind_param("i", $drone_id);

if (!$query->execute()) {
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"Execute failed: ".$query->error]);
    exit;
}

$result = $query->get_result();
if (!$result) {
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"Query failed: ".$query->error]);
    exit;
}

$row = $result->fetch_assoc();

if (!$row) {
    http_response_code(404);
    echo json_encode(["status"=>"error","message"=>"No active mission found for drone code: $drone_code"]);
    exit;
}

$incident_id = $row['incident_id'];

// 🔹 3. Insert GPS log
$stmt = $conn->prepare("
    INSERT INTO drone_gps_logs
    (drone_code, incident_id, latitude, longitude, speed, timestamp)
    VALUES (?, ?, ?, ?, ?, NOW())
");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"Prepare failed: ".$conn->error]);
    exit;
}

$stmt->bind_param("ssddd", $drone_code, $incident_id, $latitude, $longitude, $speed);

if ($stmt->execute()) {
    echo json_encode([
        "status"=>"success",
        "message"=>"GPS data stored successfully",
        "incident_id"=>$incident_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"Failed to insert GPS data: ".$stmt->error]);
}

// Close connections
$stmt->close();
$query->close();
$mapStmt->close();
$conn->close();
?>