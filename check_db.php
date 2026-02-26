<?php
$servername = "localhost";
$username = "root";
$password = "";
$database = "u486700931_icp";

try {
    $connect = new PDO("mysql:host=$servername;dbname=$database;charset=utf8", $username, $password);
    $connect->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Checking qualification LIKE 'ทักษะ-IT%':\n";
    $stmt = $connect->prepare("SELECT * FROM qualification WHERE qualification_name LIKE '%ทักษะ-IT%'");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($rows);

    echo "\nChecking latest 5 qa_plan_career:\n";
    $stmt = $connect->prepare("SELECT qpc.*, qua.qualification_name FROM qa_plan_career qpc LEFT JOIN qualification qua ON qpc.qualification_id = qua.qualification_id ORDER BY qpc.qa_plan_career_id DESC LIMIT 5");
    $stmt->execute();
    $rows2 = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($rows2);
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>

