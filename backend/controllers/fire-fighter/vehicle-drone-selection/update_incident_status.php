<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

require_once realpath(__DIR__ . "/../../../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

$incidentId = $data['incidentId'] ?? '';

if (empty($incidentId)) {
    echo json_encode(["success" => false, "message" => "Invalid incidentId"]);
    exit;
}

$sql = "UPDATE incidents 
        SET status = 'in_progress', isNewAlert = 0 
        WHERE id = ? 
        LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $incidentId);
if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "affectedRows" => $stmt->affected_rows
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "DB update failed"
    ]);
}
?>
