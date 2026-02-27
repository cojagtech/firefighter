<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

session_start();
require_once "../../config/db.php";

if (
    !isset($_SESSION['user']) ||
    $_SESSION['user']['role'] !== 'Pilot'
) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$station = $_SESSION['user']['station'];

$stmt = $conn->prepare("
    SELECT id, drone_name, status
    FROM drones
    WHERE station = ?
    ORDER BY drone_name ASC
");

$stmt->bind_param("s", $station);
$stmt->execute();

echo json_encode([
    "success" => true,
    "drones" => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)
]);