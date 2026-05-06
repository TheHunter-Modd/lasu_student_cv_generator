<?php
require_once __DIR__ . '/config_env.php';

// Load .env file from project root
loadEnv(__DIR__ . '/../.env');

 $host   = $_ENV['DB_HOST'] ?? '127.0.0.1';
 $port   = $_ENV['DB_PORT'] ?? '5432';       // Changed: 3307 (MySQL) -> 5432 (Postgres)
 $dbname = $_ENV['DB_NAME'] ?? '';
 $dbuser = $_ENV['DB_USER'] ?? 'postgres';    // Changed: root (MySQL) -> postgres (Postgres)
 $dbpass = $_ENV['DB_PASS'] ?? '';

// Postgres requires charset to be passed inside the 'options' parameter
 $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;options='--client_encoding=UTF8'";

 $options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $dbuser, $dbpass, $options);
} catch (PDOException $e) {
    die("❌ Connection failed: " . $e->getMessage());
}