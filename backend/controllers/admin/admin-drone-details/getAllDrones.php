<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

$sql = "SELECT * FROM drones";
$result = mysqli_query($conn, $sql);

$drones = [];

while ($row = mysqli_fetch_assoc($result)) {
    $drones[] = $row;
}

echo json_encode($drones);

mysqli_close($conn);

?>