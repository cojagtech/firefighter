<?php
require_once realpath(__DIR__ . "/../../config/db.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/errors.log');
error_reporting(E_ALL);

$incidentId = $_GET['incident_id'] ?? '';

if (!$incidentId) {
    echo json_encode(["error" => "Invalid incident ID"]);
    exit;
}

if (!$conn) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// ✅ Fetch incident by ID (bind as string)
$sqlIncident = "SELECT latitude, longitude, stationName FROM incidents WHERE id = ?";
$stmt = $conn->prepare($sqlIncident);
if (!$stmt) {
    echo json_encode(["error" => "Failed to prepare incident query", "sql_error" => $conn->error]);
    exit;
}

$stmt->bind_param("s", $incidentId); // ✅ String bind for alphanumeric IDs
$stmt->execute();
$result = $stmt->get_result();
$incident = $result->fetch_assoc();

if (!$incident) {
    echo json_encode(["error" => "Incident not found"]);
    exit;
}

$incidentLat = $incident['latitude'];
$incidentLng = $incident['longitude'];
$incidentStationName = $incident['stationName'];

// ✅ Fetch nearest fire stations excluding the incident’s own station
$sqlStations = "
SELECT 
    fs.id,
    fs.station_name,
    fs.latitude,
    fs.longitude,
    (6371 * ACOS(
        COS(RADIANS(?)) *
        COS(RADIANS(fs.latitude)) *
        COS(RADIANS(fs.longitude) - RADIANS(?)) +
        SIN(RADIANS(?)) *
        SIN(RADIANS(fs.latitude))
    )) AS distance_km,
    COUNT(DISTINCT v.id) AS vehicle_count,
    COUNT(DISTINCT d.id) AS drone_count
FROM fire_station fs
LEFT JOIN vehicles v
    ON v.station = fs.station_name AND v.status = 'available'
LEFT JOIN drones d
    ON d.station = fs.station_name AND d.status = 'Active'
WHERE fs.station_name != ?
GROUP BY fs.id
ORDER BY distance_km ASC
LIMIT 3
";

$stmt = $conn->prepare($sqlStations);
if (!$stmt) {
    echo json_encode(["error" => "Failed to prepare stations query", "sql_error" => $conn->error]);
    exit;
}

$stmt->bind_param("ddds", $incidentLat, $incidentLng, $incidentLat, $incidentStationName);
$stmt->execute();
$result = $stmt->get_result();

$stations = [];
while ($row = $result->fetch_assoc()) {
    // Round distance to 3 decimal places for consistency
    $row['distance_km'] = round($row['distance_km'], 3);
    $stations[] = $row;
}

// ✅ Final JSON response
echo json_encode([
    "incident_id" => $incidentId,
    "incident" => $incident,
    "nearest_stations" => $stations
]);