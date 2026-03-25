<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once realpath(__DIR__ . "/../../../config/db.php");

if (!isset($_SESSION['user'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$page   = max(1, intval($_GET['page'] ?? 1));
$limit  = max(10, intval($_GET['limit'] ?? 20));
$search = trim($_GET['search'] ?? "");
$module = trim($_GET['module'] ?? "");
$role   = trim($_GET['role'] ?? "");
$date   = trim($_GET['date'] ?? "");

$offset = ($page - 1) * $limit;

$where = "WHERE 1=1";

/* 🔍 SEARCH */
if ($search !== "") {
    $search = mysqli_real_escape_string($conn, $search);
    $where .= " AND (
        user_name LIKE '%$search%' OR
        description LIKE '%$search%' OR
        action LIKE '%$search%'
    )";
}

/* 📦 MODULE */
if ($module !== "" && $module !== "all") {
    $module = mysqli_real_escape_string($conn, $module);
    $where .= " AND module = '$module'";
}

/* 👤 ROLE (FIXED) */
if ($role !== "" && $role !== "all") {
    $role = mysqli_real_escape_string($conn, $role);
    $where .= " AND TRIM(role) = '$role'";
}

/* 📅 DATE */
if ($date !== "") {
    $date = mysqli_real_escape_string($conn, $date);
    $where .= " AND DATE(created_at) = '$date'";
}

/* 🔢 COUNT */
$countSql = "SELECT COUNT(*) AS total FROM activity_logs $where";
$countRes = mysqli_query($conn, $countSql);
$total    = mysqli_fetch_assoc($countRes)['total'] ?? 0;

/* 📄 DATA */
$sql = "
  SELECT id, user_name, role, module, action, description, ip_address, created_at
  FROM activity_logs
  $where
  ORDER BY created_at DESC
  LIMIT $limit OFFSET $offset
";

$result = mysqli_query($conn, $sql);
$logs = [];

while ($row = mysqli_fetch_assoc($result)) {
    $logs[] = $row;
}

echo json_encode([
    "success" => true,
    "page"    => $page,
    "limit"   => $limit,
    "total"   => intval($total),
    "pages"   => ceil($total / $limit),
    "logs"    => $logs
]);

mysqli_close($conn);