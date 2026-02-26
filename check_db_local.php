<?php
$servername = "localhost";
$username = "u486700931_root";
$password = "REDACTED_PASSWORD";
$database = "u486700931_icp";

try {
    $connect = new PDO("mysql:host=$servername;dbname=$database;charset=utf8", $username, $password);
    $connect->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $connect->prepare("DESCRIBE individual");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $cols = array();
    foreach ($rows as $row) {
        $cols[] = $row['Field'];
    }
    echo implode(",", $cols);
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>

