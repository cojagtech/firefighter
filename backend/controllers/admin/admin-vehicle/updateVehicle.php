<?php
session_start();

/* ---------- CORS ---------- */
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once realpath(__DIR__ . "/../../../config/db.php");
require "../../../helpers/logActivity.php";

/* ---------- INPUT ---------- */
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Vehicle ID required"
    ]);
    exit;
}

$id           = (int)$data['id'];
$name         = trim($data['name'] ?? "");
$type         = trim($data['type'] ?? "");
$registration = trim($data['registration'] ?? "");
$device_id    = trim($data['device_id'] ?? "");
$location     = trim($data['location'] ?? "");
$station      = trim($data['station'] ?? "");
$status       = trim($data['status'] ?? "");

/* ---------- BASIC VALIDATION ---------- */
if (!$name || !$type || !$registration || !$device_id || !$station) {
    echo json_encode([
        "success" => false,
        "message" => "Required fields missing"
    ]);
    exit;
}

/* ---------- DUPLICATE DEVICE ID CHECK (IGNORE SELF) ---------- */
$dup = $conn->prepare(
    "SELECT id FROM vehicles WHERE device_id = ? AND id != ? LIMIT 1"
);
$dup->bind_param("si", $device_id, $id);
$dup->execute();
$dup->store_result();

if ($dup->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "Another vehicle already uses this Device ID"
    ]);
    exit;
}
$dup->close();

/* ---------- FETCH OLD DATA (FOR CHANGE LOG) ---------- */
$oldQuery = $conn->prepare(
    "SELECT name, type, registration, device_id, location, station, status
     FROM vehicles WHERE id = ? LIMIT 1"
);
$oldQuery->bind_param("i", $id);
$oldQuery->execute();
$oldResult = $oldQuery->get_result();

if ($oldResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Vehicle not found"
    ]);
    exit;
}

$old = $oldResult->fetch_assoc();
$oldQuery->close();

/* ---------- DETECT CHANGES ---------- */
$changes = [];

if ($old['name'] !== $name)
    $changes[] = "name: '{$old['name']}' → '$name'";

if ($old['type'] !== $type)
    $changes[] = "type: '{$old['type']}' → '$type'";

if ($old['device_id'] !== $device_id)
    $changes[] = "device_id: '{$old['device_id']}' → '$device_id'";

if ($old['location'] !== $location)
    $changes[] = "location: '{$old['location']}' → '$location'";

if ($old['station'] !== $station)
    $changes[] = "station: '{$old['station']}' → '$station'";

if ($old['status'] !== $status)
    $changes[] = "status: '{$old['status']}' → '$status'";

/* ---------- UPDATE ---------- */
$sql = "
    UPDATE vehicles SET
        name        = ?,
        type        = ?,
        registration= ?,
        device_id   = ?,
        location    = ?,
        station     = ?,
        status      = ?
    WHERE id = ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "sssssssi",
    $name,
    $type,
    $registration,
    $device_id,
    $location,
    $station,
    $status,
    $id
);

if ($stmt->execute()) {

    /* ---------- AUDIT LOG (ONLY IF CHANGED) ---------- */
    if (!empty($changes) && function_exists('logActivity')) {

        $logUser = $_SESSION['user'] ?? [
            "id"   => null,
            "name" => "SYSTEM",
            "role" => "SYSTEM"
        ];

        $description =
            "Updated vehicle ($registration): " . implode(", ", $changes);

        logActivity(
            $conn,
            $logUser,
            "UPDATE_VEHICLE",
            "VEHICLE",
            $description,
            $id
        );
    }

    echo json_encode([
        "success" => true,
        "message" => "Vehicle updated successfully"
    ]);

} else {
    echo json_encode([
        "success" => false,
        "message" => "Vehicle update failed"
    ]);
}

$stmt->close();
mysqli_close($conn);
