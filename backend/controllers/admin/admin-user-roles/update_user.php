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
$fullName    = trim($data["fullName"] ?? "");
$address     = trim($data["address"] ?? "");
$email       = trim($data["email"] ?? "");
$phone       = trim($data["phone"] ?? "");
$designation = trim($data["designation"] ?? "");
$role        = trim($data["role"] ?? "");
$station     = trim($data["station"] ?? "");

/* ---------- VALIDATION ---------- */
if (!$fullName  || !$address || !$phone || !$designation || !$role || !$station) {
    echo json_encode(["success"=>false,"message"=>"Required fields missing"]);
    exit;
}

if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success"=>false,"message"=>"Please enter valid Email"]);
    exit;
}

if (!preg_match("/^[0-9]{10}$/", $phone)) {
    echo json_encode(["success"=>false,"message"=>"Please enter valid number"]);
    exit;
}

/* ---------- FETCH OLD ---------- */
$oldStmt = $conn->prepare("
SELECT fullName,address,email,phone,designation,role,station 
FROM users WHERE id=?
");
$oldStmt->bind_param("i",$id);
$oldStmt->execute();
$oldData = $oldStmt->get_result()->fetch_assoc();
$oldStmt->close();

if (!$oldData) {
    echo json_encode(["success"=>false,"message"=>"User not found"]);
    exit;
}

/* ---------- NO CHANGE ---------- */
if (
    $oldData['fullName'] === $fullName &&
    $oldData['address'] === $address &&
    $oldData['email'] === $email &&
    $oldData['phone'] === $phone &&
    $oldData['designation'] === $designation &&
    $oldData['role'] === $role &&
    $oldData['station'] === $station
) {
    echo json_encode(["success"=>false,"message"=>"No changes detected"]);
    exit;
}

/* ---------- DUPLICATE ---------- */
$dup = $conn->prepare("
SELECT id FROM users 
WHERE (email=? OR phone=?) AND id!=?
");
$dup->bind_param("ssi",$email,$phone,$id);
$dup->execute();
$dup->store_result();

if ($dup->num_rows > 0) {
    echo json_encode([
        "success"=>false,
        "message"=>"Email or Mobile number is already registered"
    ]);
    exit;
}
$dup->close();

/* ---------- UPDATE ---------- */
$stmt = $conn->prepare("
UPDATE users SET
fullName=?, address=?, email=?, phone=?, designation=?, role=?, station=?
WHERE id=?
");

$stmt->bind_param(
  "sssssssi",
  $fullName,
  $address,
  $email,
  $phone,
  $designation,
  $role,
  $station,
  $id
);

if ($stmt->execute()) {

    /* ---------- CHANGE LOG ---------- */
    $changes = [];

    if ($oldData['fullName'] !== $fullName)
        $changes[] = "name: {$oldData['fullName']} → {$fullName}";

    if ($oldData['address'] !== $address)
        $changes[] = "address: {$oldData['address']} → {$address}";

    if ($oldData['email'] !== $email)
        $changes[] = "email: {$oldData['email']} → {$email}";

    if ($oldData['phone'] !== $phone)
        $changes[] = "phone: {$oldData['phone']} → {$phone}";

    if ($oldData['designation'] !== $designation)
        $changes[] = "designation: {$oldData['designation']} → {$designation}";

    if ($oldData['role'] !== $role)
        $changes[] = "role: {$oldData['role']} → {$role}";

    if ($oldData['station'] !== $station)
        $changes[] = "station: {$oldData['station']} → {$station}";

    /* ---------- LOG ---------- */
    if (!empty($changes)) {

        $logUser = $_SESSION["user"] ?? [
            "id"=>null,
            "fullName"=>"SYSTEM",
            "role"=>"SYSTEM"
        ];

        $description =
            "Updated user {$fullName} ({$phone}):\n"
            . implode("\n", $changes);

        logActivity(
            $conn,
            $logUser,
            "UPDATE_USER",
            "USER",
            $description,
            $id
        );
    }

    echo json_encode([
        "success"=>true,
        "message"=>"User Updated Successfully"
    ]);

} else {
    echo json_encode([
        "success"=>false,
        "message"=>"Server error"
    ]);
}

$stmt->close();
$conn->close();