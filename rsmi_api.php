<?php

// Get parameters for RSMI
$month = isset($_GET['month']) ? (int)$_GET['month'] : null;
$year = isset($_GET['year']) ? (int)$_GET['year'] : null;
$stockNo = isset($_GET['stockNo']) ? $_GET['stockNo'] : null;

// Validate parameters
if ($month !== null && ($month < 1 || $month > 12)) {
    throw new Exception("Invalid month (must be 1-12)");
}

if ($year !== null && ($year < 2000 || $year > 2100)) {
    throw new Exception("Invalid year (must be between 2000-2100)");
}

// Prepare RSMI query for stockcard data with issue quantities
$sql = "SELECT sc.*, sch.stocknumber, sch.description, sch.unitofmeasurement 
        FROM stockcards_inventory sc 
        LEFT JOIN stock_cards_header sch ON sc.stocknumber = sch.stocknumber 
        WHERE sc.issueqty > 0";

$params = [];
$types = "";

if ($month !== null && $year !== null) {
    $firstDay = date('Y-m-01', strtotime("$year-$month-01"));
    $lastDay = date('Y-m-t', strtotime("$year-$month-01"));
    
    $sql .= " AND sc.date BETWEEN ? AND ?";
    $params[] = $firstDay;
    $params[] = $lastDay;
    $types .= "ss";
}

if ($stockNo !== null && $stockNo !== '') {
    $sql .= " AND sc.stocknumber = ?";
    $params[] = $stockNo;
    $types .= "s";
}

$sql .= " ORDER BY sc.date ASC";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    throw new Exception("Prepare failed: " . $conn->error);
}

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$result = $stmt->execute();

if (!$result) {
    throw new Exception("Execute failed: " . $stmt->error);
}

$result = $stmt->get_result();

if (!$result) {
    throw new Exception("Get result failed: " . $stmt->error);
}

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

$stmt->close();

echo json_encode($data); 