<?php
session_start();
require_once realpath(__DIR__ . "/../../../config/db.php");

// Agar user logged in hai
if (isset($_SESSION["user"])) {

    $user = $_SESSION["user"];

    $userId = $user["id"];
    $userName = $user["fullName"];
    $role = $user["role"];
    $ip = $_SERVER['REMOTE_ADDR'];

    // 🔥 LOGOUT ACTIVITY LOG
    $stmtLog = $conn->prepare("INSERT INTO activity_logs 
    (user_id, user_name, role, action, module, description, ip_address, created_at)
    VALUES (?, ?, ?, 'LOGOUT', 'AUTH', 'User logged out successfully', ?, NOW())");

    $stmtLog->bind_param("isss", $userId, $userName, $role, $ip);
    $stmtLog->execute();
}

// session destroy
session_destroy();

echo json_encode([
    "success" => true,
    "message" => "Logged out successfully"
]);