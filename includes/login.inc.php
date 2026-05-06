<?php

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $matricNumber = trim($_POST["matric_number"]);
    $pwd = trim($_POST["pwd"]);

    try {
        // 1. START SESSION FIRST!
        require_once 'config_session.inc.php'; 
        
        require_once 'dbh.inc.php';
        require_once 'login_model.inc.php';
        require_once 'login_contr.inc.php';

        $errors = [];

        if (is_input_empty($matricNumber, $pwd)) {
            $errors["empty_input"] = "Fill in all fields!";
        }

        $result = get_user($pdo, $matricNumber);

        if (is_user_wrong($result)) {
            $errors["login_incorrect"] = "Incorrect login details!";
        } else {
            if (!$errors && is_password_wrong($pwd, $result["pwd"])) {
                $errors["login_incorrect"] = "Incorrect login details!";
            }
        }

        if ($errors) {
            $_SESSION["errors_login"] = $errors;

            // DEBUG: Print errors instead of redirecting
            echo "<h1>ERRORS FOUND:</h1>";
            print_r($errors);
            die("Stopped to show errors.");
        }

        // ✅ LOGIN SUCCESS
        $_SESSION["user_id"] = $result["id"];
        $_SESSION["user_matric"] = htmlspecialchars($result["matric_number"]);

        // DEBUG BLOCK: Check what database returned
        echo "<h1>Success Block Reached!</h1>";
        echo "<pre>";
        print_r($result);
        echo "\n--- SESSION ---\n";
        print_r($_SESSION);
        echo "</pre>";
        die("Stopped to show success data.");
        // END DEBUG BLOCK

        // header("Location: ../dashboard.php");
        // die();

    } catch (PDOException $e) {
        die("Query failed: " . $e->getMessage());
    }

} else {
    header("Location: ../login.php");
    die();
}