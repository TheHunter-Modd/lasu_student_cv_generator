<?php

        // ✅ LOGIN SUCCESS
        $_SESSION["user_id"] = $result["id"];
        $_SESSION["user_matric"] = htmlspecialchars($result["matric_number"]);

        // DEBUG BLOCK
        echo "<h1>Success Block Reached!</h1>";
        echo "<pre>";
        print_r($result);
        echo "\n--- SESSION ---\n";
        print_r($_SESSION);
        echo "</pre>";
        die("Stopping here so you can read this.");
        // END DEBUG BLOCK

        // header("Location: ../dashboard.php");
        // die();