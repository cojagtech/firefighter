<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

$conn = new mysqli("localhost","root","","fire-fighter");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed", "details" => $conn->connect_error]);
    exit;
}

$sql = "SELECT * FROM vehicles WHERE status='available'";
$result = $conn->query($sql);

$data = [];

while($row = $result->fetch_assoc()){
    $data[] = $row;
}

echo json_encode($data);

?>