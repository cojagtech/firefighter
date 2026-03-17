<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); // frontend origin
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once realpath(__DIR__ . "/../../config/db.php");

// get drone_code from request
$drone_code = isset($_GET['drone_code']) ? $_GET['drone_code'] : "";

if (empty($drone_code)) {
    echo json_encode([
        "success" => false,
        "message" => "Drone code is required"
    ]);
    exit;
}

try {
    // fetch latest GPS log
    $stmt = $conn->prepare("
        SELECT drone_code, latitude, longitude, speed, timestamp
        FROM drone_gps_logs
        WHERE drone_code = ?
        ORDER BY timestamp DESC
        LIMIT 1
    ");

    $stmt->bind_param("s", $drone_code);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $data = $result->fetch_assoc();

        echo json_encode([
            "success" => true,
            "data" => $data
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "No GPS data found"
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}