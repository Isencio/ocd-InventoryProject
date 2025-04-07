<?php
try{
    include 'connect.php';
}catch(Exception $ex){
    include 'connect.php';
}
?>


<?php
$json_arr = [];
$query = "SELECT * FROM stockcards ";
$result = mysqli_query($conn, $query);

if (mysqli_num_rows($result) > 0) {
   
    while($row = mysqli_fetch_assoc($result)) {
         $json_arr[] = $row;
    }
} else {
    echo "0 results";
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
echo json_encode($json_arr);
?>
























?>