<?php
declare(strict_types=1);

function Check_login_errors() {
    if (isset($_SESSION["errors_login"])) {
        $errors = $_SESSION["errors_login"];

        foreach ($errors as $error) {
            echo '<p>' . $error . '</p>';
        }

        unset($_SESSION["errors_login"]);
    }
}

function check_forgot_errors() {
    if (isset($_SESSION["errors_forgot"])) {
        $errors = $_SESSION["errors_forgot"];

        foreach ($errors as $error) {
            echo '<p>' . $error . '</p>';
        }

        unset($_SESSION["errors_forgot"]);
    }
}

function check_reset_errors() {
    if (isset($_SESSION["errors_reset"])) {
        $errors = $_SESSION["errors_reset"];

        foreach ($errors as $error) {
            echo '<p>' . $error . '</p>';
        }

        unset($_SESSION["errors_reset"]);
    }
}

function show_success_message() {
    if (isset($_SESSION["password_reset_success"])) {
        echo '<div class="success-box">
                <p>Password reset successful! Please log in with your new password.</p>
              </div>';
        unset($_SESSION["password_reset_success"]);
    }

    if (isset($_SESSION["signup_success"])) {
        echo '<div class="success-box">
                <p>Registration successful! Please log in.</p>
              </div>';
        unset($_SESSION["signup_success"]);
    }
}