<?php

    header('Content-type:application/json;charset=utf-8');
    //ini_set('display_errors', 1);
    require_once 'dbconfig.php';

    $dsn = "pgsql:host=$host;port=$port;dbname=$db;user=$username;password=$password";

    try{
     // create a PostgreSQL database connection
     $conn = new PDO($dsn);

     if($conn){
          $result = $conn->query("SELECT get_heatmapdata()")->fetch();
          echo json_encode($result["get_heatmapdata"], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
     }

    }catch (PDOException $e){
     // report error message
     echo $e->getMessage();
    }

?>