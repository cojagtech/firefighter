<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require "../../../config/db.php";

// Get JSON input
$input = json_decode(file_get_contents("php://input"), true);

$incidentId = $input['incidentId'] ?? null;
$newStation = $input['stationName'] ?? null;

if (!$incidentId || !$newStation) {
    echo json_encode([
        "success" => false,
        "message" => "incidentId and stationName required"
    ]);
    exit;
}

// Prepare update query
$stmt = $conn->prepare("
    UPDATE incidents 
    SET stationName = ?, 
        status = 'new', 
        isNewAlert = 1 
    WHERE id = ?
");

$stmt->bind_param("ss", $newStation, $incidentId);

if ($stmt->execute()) {

    if ($stmt->affected_rows > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Incident forwarded successfully",
            "incidentId" => $incidentId,
            "newStation" => $newStation
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Incident not found"
        ]);
    }

} else {
    echo json_encode([
        "success" => false,
        "message" => "Update failed"
    ]);
}

$stmt->close();
$conn->close();
?>