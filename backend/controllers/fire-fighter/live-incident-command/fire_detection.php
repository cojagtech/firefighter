<?php

require_once realpath(__DIR__ . "/../../../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

$stmt = $conn->prepare("INSERT INTO fire_detections 
(timestamp,alert_type,confidence,fire_count,intensity_level,location)
VALUES (?,?,?,?,?,?)");

$stmt->bind_param(
"isdiss",
$data["timestamp"],
$data["alert_type"],
$data["confidence"],
$data["fire_count"],
$data["intensity_level"],
$data["location"]
);

$stmt->execute();

echo json_encode(["status"=>"saved"]);

?>