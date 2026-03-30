<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0); // hide from output

require_once realpath(__DIR__ . "/../../config/db.php");

$incidentId = $_GET['incident_id'] ?? null;
if (!$incidentId) {
    echo json_encode(["error" => "incident_id is required"]);
    exit;
}

// Helper functions
function safePrepare($conn, $sql) {
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(["error" => "SQL prepare failed: " . $conn->error]);
        exit;
    }
    return $stmt;
}

function bindParamsDynamic($stmt, $types, $params) {
    $refs = [];
    foreach ($params as $key => $value) {
        $refs[$key] = &$params[$key];
    }
    array_unshift($refs, $types);
    call_user_func_array([$stmt, 'bind_param'], $refs);
}

// Step 1: Get incident coordinates
$incidentQuery = safePrepare($conn, "SELECT latitude, longitude FROM incidents WHERE id = ?");
$incidentQuery->bind_param("s", $incidentId);
$incidentQuery->execute();
$incidentResult = $incidentQuery->get_result()->fetch_assoc();

if (!$incidentResult || !is_numeric($incidentResult['latitude']) || !is_numeric($incidentResult['longitude'])) {
    echo json_encode(["error" => "Incident not found or invalid coordinates"]);
    exit;
}

$lat = floatval($incidentResult['latitude']);
$lng = floatval($incidentResult['longitude']);

// Step 2: Get nearest 3 stations
$stationSql = "
SELECT 
    station_name,
    latitude,
    longitude,
    (6371 * ACOS(
        COS(RADIANS(?)) *
        COS(RADIANS(latitude)) *
        COS(RADIANS(longitude) - RADIANS(?)) +
        SIN(RADIANS(?)) *
        SIN(RADIANS(latitude))
    )) AS distance_km
FROM fire_station
ORDER BY distance_km ASC
LIMIT 3
";

$stationStmt = safePrepare($conn, $stationSql);
$stationStmt->bind_param("ddd", $lat, $lng, $lat);
$stationStmt->execute();
$stationsResult = $stationStmt->get_result();

$stations = [];
while ($row = $stationsResult->fetch_assoc()) {
    $stations[] = $row;
}

if (count($stations) === 0) {
    echo json_encode(["assets" => []]);
    exit;
}

$stationNames = array_column($stations, 'station_name');
$placeholders = implode(',', array_fill(0, count($stationNames), '?'));
$types = str_repeat('s', count($stationNames));

// Helper: get station distance
function getStationDistance($stations, $stationName) {
    foreach ($stations as $s) {
        if ($s['station_name'] === $stationName) return floatval($s['distance_km']);
    }
    return null;
}

// Step 3: Get vehicles
$vehicleSql = "SELECT id, name, station, status FROM vehicles WHERE station IN ($placeholders) AND status = 'available'";
$vehicleStmt = safePrepare($conn, $vehicleSql);
bindParamsDynamic($vehicleStmt, $types, $stationNames);
$vehicleStmt->execute();
$vehiclesResult = $vehicleStmt->get_result();

$vehicles = [];
while ($v = $vehiclesResult->fetch_assoc()) {
    $v['distance'] = getStationDistance($stations, $v['station']);
    $vehicles[] = $v;
}

// Step 4: Get drones
$droneSql = "SELECT id, drone_name AS name, station, battery, status FROM drones WHERE station IN ($placeholders) AND status IN ('Active','StandBy')";
$droneStmt = safePrepare($conn, $droneSql);
bindParamsDynamic($droneStmt, $types, $stationNames);
$droneStmt->execute();
$dronesResult = $droneStmt->get_result();

$drones = [];
while ($d = $dronesResult->fetch_assoc()) {
    $d['distance'] = getStationDistance($stations, $d['station']);
    $drones[] = $d;
}

// Step 5: Sort and take top 2 of each
usort($vehicles, fn($a,$b) => $a['distance'] <=> $b['distance']);
usort($drones, fn($a,$b) => $a['distance'] <=> $b['distance']);

$vehicles = array_slice($vehicles, 0, 2);
$drones = array_slice($drones, 0, 2);

// Step 6: Format assets
$assets = [];

foreach ($vehicles as $v) {
    $assets[] = [
        "id" => "v-" . $v['id'],
        "name" => $v['name'],
        "type" => "fire-truck",
        "status" => $v['status'],
        "distance" => round($v['distance'], 2)
    ];
}

foreach ($drones as $d) {
    $assets[] = [
        "id" => "d-" . $d['id'],
        "name" => $d['name'],
        "type" => "drone",
        "status" => "available",
        "battery" => $d['battery'],
        "distance" => round($d['distance'], 2),
        "eta" => round(($d['distance'] / 40) * 60) // 40 km/h drone speed
    ];
}

// Step 7: Sort final list by distance
usort($assets, fn($a,$b) => $a['distance'] <=> $b['distance']);

// Output
echo json_encode([
    "incident_id" => $incidentId,
    "assets" => $assets
], JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK);