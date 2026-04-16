<?php
$host = getenv("DB_HOST") ?: "localhost";
$user = getenv("DB_USER") ?: "root";
$pass = getenv("DB_PASSWORD") ?: "";
$db   = getenv("DB_NAME") ?: "fire-fighter";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode([
        "error" => "Database connection failed",
        "details" => $conn->connect_error
    ]));
}
?>

