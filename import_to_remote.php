<?php
set_time_limit(0); // Allow unlimited execution time

$remote_host = '10.2.0.5';
$username = 'u486700931_root';
$password = 'REDACTED_PASSWORD';
$database = 'u486700931_icp';
$sql_file = 'D:\\Project-icp\\u486700931_icp.sql';

echo "Starting import to Remote Server ($remote_host)...\n";
echo "Source File: $sql_file\n";

if (!file_exists($sql_file)) {
    die("[ERROR] SQL file not found: $sql_file\n");
}

try {
    $dsn = "mysql:host=$remote_host;dbname=$database;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    $pdo = new PDO($dsn, $username, $password, $options);
    echo "[SUCCESS] Connected to database.\n";

    // Function to drop all tables
    echo "\n[INFO] Dropping all existing tables...\n";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (!empty($tables)) {
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
        foreach ($tables as $table) {
            echo "  - Dropping table: $table\n";
            $pdo->exec("DROP TABLE IF EXISTS `$table`");
        }
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
        echo "[SUCCESS] All existing tables dropped.\n\n";
    } else {
        echo "[INFO] No existing tables to drop.\n\n";
    }

    // Read file line by line to handle large files
    echo "[INFO] Starting import from SQL file...\n";
    $handle = fopen($sql_file, "r");
    if ($handle) {
        $query = '';
        $lineCount = 0;
        $paramsCount = 0;
        $errorCount = 0;

        while (($line = fgets($handle)) !== false) {
            $lineCount++;
            $trimmedLine = trim($line);

            // Skip comments and empty lines
            if (
                empty($trimmedLine) ||
                substr($trimmedLine, 0, 2) == '--' ||
                substr($trimmedLine, 0, 2) == '/*' ||
                substr($trimmedLine, 0, 1) == '#'
            ) {
                continue;
            }

            // Add line to current query buffer
            $query .= $line;

            // If line ends with semicolon, execute query
            if (substr($trimmedLine, -1) == ';') {
                try {
                    $pdo->exec($query);
                    $query = '';
                    $paramsCount++;

                    if ($paramsCount % 100 == 0) {
                        echo ".";
                        if ($paramsCount % 5000 == 0) {
                            echo " ($paramsCount queries done)\n";
                        }
                    }
                } catch (PDOException $e) {
                    $errorCount++;
                    echo "\n[ERROR #$errorCount] Line $lineCount: " . $e->getMessage() . "\n";

                    // Show first few errors in detail, then just count
                    if ($errorCount <= 3) {
                        echo "Query: " . substr($query, 0, 200) . "...\n";
                    }

                    // If too many errors, abort
                    if ($errorCount > 10) {
                        fclose($handle);
                        die("\n[ABORTED] Too many errors ($errorCount). Import stopped.\n");
                    }

                    $query = ''; // Reset query buffer and continue
                }
            }
        }

        echo "\n\n[COMPLETE] Import finished!\n";
        echo "Total Queries Executed: $paramsCount\n";
        echo "Total Errors: $errorCount\n";
        fclose($handle);
    } else {
        echo "[ERROR] Could not open file.\n";
    }

} catch (PDOException $e) {
    die("[ERROR] Connection failed: " . $e->getMessage() . "\n");
}
?>

