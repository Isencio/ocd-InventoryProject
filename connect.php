<?php
$hostname = "localhost";
$username = "root";
$password = "";
$database = "ocdncr";

// Create connection
$conn = mysqli_connect($hostname, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
//echo "Connected successfully";
?>