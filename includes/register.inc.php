<?php

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $firstName = trim($_POST["first_name"]);
    $lastName = trim($_POST["last_name"]);
    $matricNumber = trim($_POST["matric_number"]);
    $email = trim($_POST["email"]);
    $pwd = trim($_POST["pwd"]);

    try {
        // 1. START SESSION FIRST!
        require_once 'config_session.inc.php'; 

        require_once 'dbh.inc.php';
        require_once 'register_model.inc.php';
        require_once 'register_contr.inc.php';   
       
        // ERROR HANDLERS
        $errors = [];

        if (is_input_empty($firstName, $lastName, $matricNumber, $email, $pwd)) {
            $errors["empty_input"] = "Fill in all fields!";
        }

        if (is_matric_number_taken($pdo, $matricNumber)) {
            $errors["matric_number_taken"] = "Matric Number taken!";
        }

        if (is_email_invalid($email)) {
            $errors["invalid_email"] = "Invalid email used!";
        }

        if (is_email_registered($pdo, $email)) {
            $errors["email_used"] = "Email already registered!";
        }

        if ($pwd !== $_POST["confirm_pwd"]) {
            $errors["password_mismatch"] = "Passwords do not match!";
        }

        if ($errors) {
            $_SESSION['errors_register'] = $errors;

            // Preserve user input except password
            $_SESSION['register_data'] = [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'matric_number' => $matricNumber,
                'email' => $email
            ];

            header("Location: ../index.php");
            die();
        }

        // CREATE USER
        create_user($pdo, $firstName, $lastName, $matricNumber, $email, $pwd);

        // ✅ Set signup success flag so login page shows the green message
        $_SESSION["signup_success"] = true;

        // CLEANUP
        $pdo = null;

        // REDIRECT TO LOGIN
        header("Location: ../login.php");
        die();

    } catch (PDOException $e) {
        die("Query failed: " . $e->getMessage());
    }
} else {
    header("Location: ../login.php");
    die();
}