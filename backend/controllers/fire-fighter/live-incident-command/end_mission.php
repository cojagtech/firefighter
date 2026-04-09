<?php
header('Content-Type: application/json');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

require_once realpath(__DIR__ . "/../../../config/db.php");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "DB Connection Failed"]));
}

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

$incidentId = $data['incidentId'] ?? null;

if (!$incidentId) {
    echo json_encode(["success" => false, "error" => "incidentId required"]);
    exit;
}

// Start transaction
$conn->begin_transaction();

try {

    // 1️⃣ Update drone_missions
    $stmt1 = $conn->prepare("
        UPDATE drone_missions 
        SET end_time = NOW(),
            status = 'completed'
        WHERE incident_id = ? AND status = 'started'
    ");
    $stmt1->bind_param("s", $incidentId);
    $stmt1->execute();

    // 2️⃣ Update incidents table
    $stmt2 = $conn->prepare("
        UPDATE incidents 
        SET status = 'completed'
        WHERE id = ?
    ");
    $stmt2->bind_param("s", $incidentId);
    $stmt2->execute();

    // Commit
    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Mission ended successfully"
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}

$conn->close();
?>