<?php
require_once 'config_session.inc.php'; // This already starts the session!

session_unset();
session_destroy();

header("Location: ../login.php");
die();