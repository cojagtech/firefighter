<?php

require_once realpath(__DIR__ . "/../../../config/db.php");

$result = $conn->query("
SELECT * 
FROM fire_detections
WHERE created_at >= NOW() - INTERVAL 10 SECOND
ORDER BY id DESC
LIMIT 1
");

$row = $result->fetch_assoc();

if(!$row){
    echo json_encode(["status"=>"no_fire"]);
    exit;
}

$current_time = time();
$created_time = strtotime($row['created_at']);

if(($current_time - $created_time) > 3){
    echo json_encode(["status"=>"no_fire"]);
} else {
    echo json_encode([
        "status" => "fire",
        "data" => $row
    ]);
}

?>