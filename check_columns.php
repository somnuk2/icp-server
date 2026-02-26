<?php
$servername = "localhost";
$username = "root";
$password = "";
$database = "u486700931_icp";

try {
    $connect = new PDO("mysql:host=$servername;dbname=$database;charset=utf8", $username, $password);

    echo "Columns in individual table:\n";
    $stmt = $connect->prepare("DESC individual");
    $stmt->execute();
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

    echo "\nColumns in member table:\n";
    $stmt = $connect->prepare("DESC member");
    $stmt->execute();
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>

