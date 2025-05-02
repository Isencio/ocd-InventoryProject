<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

try {
    include 'connect.php';
} catch(Exception $ex) {
    http_response_code(500);
    die(json_encode(['error' => 'Database connection failed']));
}

// Get month and year parameters
$month = isset($_GET['month']) ? (int)$_GET['month'] : null;
$year = isset($_GET['year']) ? (int)$_GET['year'] : null;

// Validate parameters
if (!$month || !$year) {
    http_response_code(400);
    die(json_encode(['error' => 'Month and year parameters are required']));
}

// Prepare query with month/year filtering
$query = "SELECT 
            sc.reference as ris_no,
            sc.issueoffice as responsibility_center_code,
            sc.stocknumber as stock_no,
            sc.item,
            sc.description as item_description,
            sc.unitofmeasurement as unit,
            sc.issueqty as quantity_issued,
            sc.balanceunitcost as unit_cost,
            sc.balancetotalcost as amount
          FROM stockcards sc
          WHERE MONTH(sc.transaction_date) = ? 
          AND YEAR(sc.transaction_date) = ?";

$stmt = mysqli_prepare($conn, $query);
mysqli_stmt_bind_param($stmt, "ii", $month, $year);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$json_arr = [];
if (mysqli_num_rows($result) > 0) {
    while($row = mysqli_fetch_assoc($result)) {
        $json_arr[] = $row;
    }
}

echo json_encode($json_arr);
?>