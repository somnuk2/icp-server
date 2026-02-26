<?php
// Function to connect to a database
function get_connection($host, $username, $password, $database)
{
    try {
        $dsn = "mysql:host=$host;dbname=$database;charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        return new PDO($dsn, $username, $password, $options);
    } catch (PDOException $e) {
        die("Connection to $host failed: " . $e->getMessage() . "\n");
    }
}

// Function to get table schema
function get_table_schema($pdo, $table)
{
    $stmt = $pdo->prepare("DESCRIBE $table");
    $stmt->execute();
    return $stmt->fetchAll();
}

// Function to get row count
function get_row_count($pdo, $table)
{
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM $table");
    $stmt->execute();
    return $stmt->fetchColumn();
}

$local_conn = get_connection('localhost', 'u486700931_root', 'REDACTED_PASSWORD', 'u486700931_icp');
$remote_conn = get_connection('10.2.0.5', 'u486700931_root', 'REDACTED_PASSWORD', 'u486700931_icp');

echo "Comparing Databases...\n";
echo "--------------------------------------------------\n";
echo "| Table Name           | Local Rows | Remote Rows | Diff |\n";
echo "--------------------------------------------------\n";

$local_tables_stmt = $local_conn->query("SHOW TABLES");
$local_tables = $local_tables_stmt->fetchAll(PDO::FETCH_COLUMN);

$remote_tables_stmt = $remote_conn->query("SHOW TABLES");
$remote_tables = $remote_tables_stmt->fetchAll(PDO::FETCH_COLUMN);

// Combine and unique tables
$all_tables = array_unique(array_merge($local_tables, $remote_tables));
sort($all_tables);

foreach ($all_tables as $table) {
    $local_rows = in_array($table, $local_tables) ? get_row_count($local_conn, $table) : "N/A";
    $remote_rows = in_array($table, $remote_tables) ? get_row_count($remote_conn, $table) : "N/A";

    $diff = "";
    if ($local_rows === "N/A")
        $diff = "Missing Local";
    elseif ($remote_rows === "N/A")
        $diff = "Missing Remote";
    elseif ($local_rows != $remote_rows)
        $diff = "Different";
    else
        $diff = "Same";

    printf("| %-20s | %-10s | %-11s | %-4s |\n", $table, $local_rows, $remote_rows, $diff);

    // Schema Check (Basic) - if rows seem same, check structure roughly
    if ($diff == "Same" || $diff == "Different") {
        $local_schema = json_encode(get_table_schema($local_conn, $table));
        $remote_schema = json_encode(get_table_schema($remote_conn, $table));
        if ($local_schema !== $remote_schema) {
            printf("|   -> Schema        | %-10s | %-11s | %-4s |\n", "Diff", "Diff", "DIFF");
        }
    }
}
echo "--------------------------------------------------\n";
?>

