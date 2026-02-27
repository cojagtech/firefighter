<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

if(!isset($_GET["drone_code"])) {
    echo json_encode(["status" => false, "error" => "Drone code required"]);
    exit;
}

$code = mysqli_real_escape_string($conn, $_GET["drone_code"]);

$sql = "SELECT * FROM drones WHERE drone_code='$code'";
$result = mysqli_query($conn, $sql);

if(!$result){
    echo json_encode(["status" => false, "error" => mysqli_error($conn)]);
    exit;
}

if(mysqli_num_rows($result) == 0) {
    echo json_encode(["status" => false, "error" => "Drone not found"]);
    exit;
}

echo json_encode(mysqli_fetch_assoc($result), JSON_NUMERIC_CHECK);
mysqli_close($conn);
?>
