<?php
require_once __DIR__ . '/config_env.php';

// Load .env file from project root
loadEnv(__DIR__ . '/../.env');

 $host    = $_ENV['DB_HOST'] ?? '127.0.0.1';
 $port    = $_ENV['DB_PORT'] ?? '3307'; // Default XAMPP MySQL port
 $dbname  = $_ENV['DB_NAME'] ?? 'lasu_cv_db';
 $dbuser  = $_ENV['DB_USER'] ?? 'root';
 $dbpass  = $_ENV['DB_PASS'] ?? ''; // XAMPP default password is empty

// MySQL DSN (Changed back to mysql:)
 $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";

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