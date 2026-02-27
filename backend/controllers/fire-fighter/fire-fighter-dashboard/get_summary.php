<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

$station = isset($_GET['station']) ? mysqli_real_escape_string($conn, $_GET['station']) : null;

if(!$station){
  echo json_encode(["status"=>false, "message"=>"Station name required"]);
  exit;
}

$sql_today = "SELECT COUNT(*) AS total FROM incidents 
              WHERE DATE(timeReported) = CURDATE() 
              AND stationName = '$station'";
$today_count = mysqli_fetch_assoc(mysqli_query($conn, $sql_today))['total'] ?? 0;

$sql_month = "SELECT COUNT(*) AS total FROM incidents 
              WHERE MONTH(timeReported)=MONTH(CURDATE()) 
              AND YEAR(timeReported)=YEAR(CURDATE())
              AND stationName = '$station'";
$month_count = mysqli_fetch_assoc(mysqli_query($conn, $sql_month))['total'] ?? 0;

// -------- Active Incidents --------
$sql_active = "SELECT COUNT(*) AS total FROM incidents 
               WHERE status='Active'
               AND stationName = '$station'";
$inprogress_count = mysqli_fetch_assoc(mysqli_query($conn, $sql_active))['total'] ?? 0;

// -------- Critical Alerts --------
$sql_critical = "SELECT COUNT(*) AS total FROM incidents 
                 WHERE status='New'
                 AND stationName = '$station'";
$critical_count = mysqli_fetch_assoc(mysqli_query($conn, $sql_critical))['total'] ?? 0;

echo json_encode([
  "status" => true,
  "station" => $station,
  "summary" => [
    "today_count" => $today_count,
    "month_count" => $month_count,
    "inprogress_count" => $inprogress_count,
    "critical_count" => $critical_count
  ]
]);
?>
