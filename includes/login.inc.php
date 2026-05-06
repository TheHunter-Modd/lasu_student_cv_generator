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
        }

        if (!$errors && is_password_wrong($pwd, $result["pwd"])) {
            $errors["login_incorrect"] = "Incorrect login details!";
        }

                if ($errors) {
            echo "<pre>";
            print_r($errors);
            echo "</pre>";
            die("STOPPED. Here are the errors.");
        }

        // ✅ LOGIN SUCCESS
        $_SESSION["user_id"] = $result["id"];
        $_SESSION["user_matric"] = htmlspecialchars($result["matric_number"]);

        header("Location: ../dashboard.php");
        die();

    } catch (PDOException $e) {
        die("Query failed: " . $e->getMessage());
    }

} else {
    header("Location: ../login.php");
    die();
}