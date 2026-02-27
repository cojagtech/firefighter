<?php
ini_set('display_errors', 0);
error_reporting(0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

if (!isset($_GET["station"])) {
    echo json_encode(["status" => false, "error" => "station not provided"]);
    exit;
}

$station = $_GET["station"];

$sql = "SELECT * FROM drones WHERE station = '$station'";
$result = mysqli_query($conn, $sql);

$drones = [];
while ($row = mysqli_fetch_assoc($result)) {
    $drones[] = $row;
}

echo json_encode($drones);

mysqli_close($conn);
?>
