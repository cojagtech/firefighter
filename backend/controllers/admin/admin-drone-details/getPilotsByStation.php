<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

if (!isset($_GET["station"])) {
    echo json_encode(["success" => false, "error" => "Station not provided"]);
    exit;
}

$station = $_GET["station"];

$sql = "
    SELECT 
    u.id,
    u.fullName,
    u.email,
    u.phone,
    u.designation,
    CASE 
        WHEN d.pilot_id IS NOT NULL AND d.pilot_status = 'assigned'
        THEN 'assigned'
        ELSE 'available'
    END AS pilot_status
    FROM users u
    LEFT JOIN drones d ON d.pilot_id = u.id
    WHERE u.role = 'pilot'
    AND u.station = ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $station);
$stmt->execute();
$result = $stmt->get_result();

$pilots = [];
while ($row = $result->fetch_assoc()) {
    $pilots[] = $row;
}

echo json_encode($pilots);
$stmt->close();
$conn->close();
