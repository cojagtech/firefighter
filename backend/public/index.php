<?php
// CORS (React frontend)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Define base path
define('BASE_PATH', dirname(__DIR__)); // backend/
$controllerPath = realpath(BASE_PATH . "/controllers");

// Get requested route from URL
$request = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove project + public folder prefix
$baseUrl = "/fire-fighter/backend/public/";
$route = str_replace($baseUrl, "", $request);

// Remove /api/ prefix if used
$route = str_replace("api/", "", $route);

// Remove trailing slash
$route = trim($route, "/");

// Security: prevent directory traversal
if (strpos($route, "..") !== false) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid request"]);
    exit();
}

// If empty route
if ($route === "") {
    echo json_encode(["message" => "API Running"]);
    exit;
}

// Map route to controller file (allow nested folders)
$controllerFile = realpath($controllerPath . "/" . $route);

// Final security check
if ($controllerFile && str_starts_with($controllerFile, $controllerPath) && file_exists($controllerFile)) {
    require_once $controllerFile;
} else {
    http_response_code(404);
    echo json_encode(["error" => "Route not found"]);
    exit();
}