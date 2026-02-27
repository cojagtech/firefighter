<?php
error_reporting(0);
ini_set('display_errors', 0);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

require_once realpath(__DIR__ . "/../../../config/db.php");

$stations = [];

$sqlV = "SELECT DISTINCT station FROM vehicles WHERE station IS NOT NULL AND station <> ''";
$resV = mysqli_query($conn, $sqlV);
if ($resV) {
    while ($r = mysqli_fetch_assoc($resV)) {
        $stations[] = $r["station"];
    }
}

$sqlD = "SELECT DISTINCT station FROM drones WHERE station IS NOT NULL AND station <> ''";
$resD = mysqli_query($conn, $sqlD);
if ($resD) {
    while ($r = mysqli_fetch_assoc($resD)) {
        if (!in_array($r["station"], $stations, true)) {
            $stations[] = $r["station"];
        }
    }
}

$stationObjs = array_map(function($s, $i) {
    return [
        "id" => $i + 1,
        "name" => $s
    ];
}, $stations, array_keys($stations));

echo json_encode(["success" => true, "stations" => $stationObjs], JSON_UNESCAPED_UNICODE);
