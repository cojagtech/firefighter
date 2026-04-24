<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

require_once realpath(__DIR__ . "/../../../config/db.php");
require_once realpath(__DIR__ . "/../../../helpers/logActivity.php");

$data = json_decode(file_get_contents("php://input"), true);

/* ---------- INPUT ---------- */
$id          = intval($data["id"] ?? 0);
$name        = trim($data["name"] ?? "");
$type        = trim($data["type"] ?? "");
$registration= strtoupper(trim($data["registration"] ?? ""));
$device_id   = strtoupper(trim($data["device_id"] ?? ""));
$station     = trim($data["station"] ?? "");
$status      = trim($data["status"] ?? "");

/* ---------- REQUIRED ---------- */
if (!$id || !$name || !$type || !$registration || !$device_id || !$station || !$status) {
    echo json_encode(["success"=>false,"message"=>"Required fields missing"]);
    exit;
}

/* ---------- VALIDATION ---------- */
if (!preg_match("/^[A-Za-z\s]+$/", $name) || !preg_match("/^[A-Za-z\s]+$/", $type)) {
    echo json_encode(["success"=>false,"message"=>"Invalid name or type (must be letters only)"]);
    exit;
}

if (!preg_match("/^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9\-]+$/", $registration)) {
    echo json_encode(["success"=>false,"message"=>"Registration must contain letters and numbers"]);
    exit;
}

/* ---------- DEVICE ID ---------- */
if (!str_starts_with($device_id, "VTS-")) {
    echo json_encode(["success"=>false,"message"=>"Device ID must start with VTS-"]);
    exit;
}

$suffix = substr($device_id, 4);

if (!$suffix || !preg_match("/^(?=.*[0-9])[A-Z0-9\-]+$/", $suffix)) {
    echo json_encode(["success"=>false,"message"=>"Device ID must contain at least one number"]);
    exit;
}

/* ---------- FETCH OLD DATA ---------- */
$oldStmt = $conn->prepare("
    SELECT name, type, registration, device_id, station, status
    FROM vehicles
    WHERE id = ?
");
$oldStmt->bind_param("i", $id);
$oldStmt->execute();
$oldData = $oldStmt->get_result()->fetch_assoc();
$oldStmt->close();

if (!$oldData) {
    echo json_encode(["success"=>false,"message"=>"Vehicle not found"]);
    exit;
}

/* ---------- NO CHANGE ---------- */
if (
    $oldData['name'] === $name &&
    $oldData['type'] === $type &&
    $oldData['registration'] === $registration &&
    $oldData['device_id'] === $device_id &&
    $oldData['station'] === $station &&
    $oldData['status'] === $status
) {
    echo json_encode(["success"=>false,"message"=>"No changes detected"]);
    exit;
}

/* ---------- DUPLICATE ---------- */
$dup = $conn->prepare("
    SELECT id FROM vehicles 
    WHERE (registration=? OR device_id=?) AND id!=?
");
$dup->bind_param("ssi",$registration,$device_id,$id);
$dup->execute();
$dup->store_result();

if ($dup->num_rows > 0) {
    echo json_encode(["success"=>false,"message"=>"Vehicle already exists"]);
    exit;
}
$dup->close();

/* ---------- UPDATE ---------- */
$stmt = $conn->prepare("
UPDATE vehicles SET
  name=?,
  type=?,
  registration=?,
  station=?,
  status=?
WHERE id=?
");

$stmt->bind_param(
  "sssssi",
  $name,
  $type,
  $registration,
  $station,
  $status,
  $id
);

if (!$stmt->execute()) {
    echo json_encode(["success"=>false,"message"=>"Update failed"]);
    exit;
}

/* ---------- BUILD CHANGE LOG ---------- */
$changes = [];

if ($oldData['name'] !== $name)
    $changes[] = "name: {$oldData['name']} → {$name}";

if ($oldData['type'] !== $type)
    $changes[] = "type: {$oldData['type']} → {$type}";

if ($oldData['station'] !== $station)
    $changes[] = "station: {$oldData['station']} → {$station}";

if ($oldData['status'] !== $status)
    $changes[] = "status: {$oldData['status']} → {$status}";

/* ---------- LOG ---------- */
if (!empty($changes)) {

    $logUser = $_SESSION["user"] ?? [
        "id" => null,
        "fullName" => "SYSTEM",
        "role" => "SYSTEM"
    ];

    $description =
        "Updated vehicle {$name} ({$registration}): \n"
        . implode("\n", $changes);

    logActivity(
        $conn,
        $logUser,
        "UPDATE_VEHICLE",
        "VEHICLE",
        $description,
        $id
    );
}

/* ---------- RESPONSE ---------- */
echo json_encode([
    "success"=>true,
    "message"=>"Vehicle updated successfully"
]);

$stmt->close();
$conn->close();