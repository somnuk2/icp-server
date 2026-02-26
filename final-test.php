<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Mock the request data that the API expects via file_get_contents("php://input")
// Since we are running via CLI, api-plan.php will fall back to using $request_data if we set it 
// OR it will use $_POST if we handle that. 
// However, the current api-plan.php I wrote uses $request_data = json_decode(file_get_contents("php://input"));

// We can't easily mock php://input in CLI without a separate process, 
// so I'll just write a script that does exactly what the API does internally.

$servername = "localhost";
$username = "u486700931_root";
$password = "REDACTED_PASSWORD";
$database = "u486700931_icp";

try {
    $connect = new PDO("mysql:host=$servername;dbname=$database;charset=utf8", $username, $password);

    $member_id = 221;
    $query = "SELECT ind.*, mem.full_name, 
                     ins.institute_name as institution, 
                     fac.faculty_name, 
                     dep.department_name,
                     deg.degree_name as education_level,
                     pro.project_name,
                     adv.full_name as advisor_name,
                     dis.disability_name
              FROM individual as ind
              LEFT JOIN member     as mem ON ind.member_id = mem.member_id
              LEFT JOIN department as dep ON ind.department_id = dep.department_id
              LEFT JOIN degree     as deg ON dep.degree_id = deg.degree_id
              LEFT JOIN faculty    as fac ON deg.faculty_id = fac.faculty_id
              LEFT JOIN institute  as ins ON fac.institute_id = ins.institute_id
              LEFT JOIN project    as pro ON ind.project_id = pro.project_id
              LEFT JOIN member     as adv ON ind.advisor_id = adv.member_id
              LEFT JOIN disability as dis ON ind.disability_id = dis.disability_id
              WHERE ind.member_id = $member_id
              LIMIT 1;";

    $statement = $connect->prepare($query);
    $statement->execute();
    $row = $statement->fetch(PDO::FETCH_ASSOC);

    echo "--- TEST RESULT ---\n";
    if ($row) {
        echo "SUCCESS: Found data for " . $row['full_name'] . "\n";
        echo "Institution: " . $row['institution'] . "\n";
    } else {
        echo "FAILED: No data found.\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>

