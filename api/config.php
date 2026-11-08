<?php
/**
 * Database configuration for BaliGuide Adat API
 * Connects to Laragon MySQL db_adatnusa
 */

// CORS headers untuk allow request dari Vite dev server
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database configuration
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'db_adatnusa');

/**
 * Get database connection
 * @return mysqli
 */
function getDBConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Database connection failed',
            'message' => $conn->connect_error
        ]);
        exit;
    }

    // Set charset to utf8mb4 untuk support Balinese characters
    $conn->set_charset('utf8mb4');

    return $conn;
}

/**
 * Send JSON response
 */
function sendJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Send error response
 */
function sendError($message, $statusCode = 400) {
    sendJSON(['error' => $message], $statusCode);
}
