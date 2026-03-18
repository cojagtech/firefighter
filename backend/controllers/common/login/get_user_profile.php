<?php
header("Content-Type: application/json");

require_once realpath(__DIR__ . "/../../../config/db.php");

$id = $_GET['id'];

$stmt = $conn->prepare("SELECT * FROM users WHERE id=?");
$stmt->bind_param("i",$id);
$stmt->execute();

$result = $stmt->get_result();
$user = $result->fetch_assoc();

echo json_encode($user);

?>