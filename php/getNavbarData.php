<?php

    header('Content-type:application/json;charset=utf-8');
    //ini_set('display_errors', 1);
    require_once 'dbconfig.php';

    $dsn = "pgsql:host=$host;port=$port;dbname=$db;user=$username;password=$password";

    try{
     // create a PostgreSQL database connection
     $conn = new PDO($dsn);

     if($conn){

       //do query if parameters are set
       if (isset($_GET['id'])){
          $navbar = $_GET['id'];
          switch ($navbar) {
              case "species":
                if (isset($_GET['pm'])){
                  $pm_arr = array(0,25,50);
                  if ($_GET['pm']==1){
                    array_push($pm_arr,1);
                  }
                  $pm_str = implode(",",$pm_arr);
                  $result = $conn->query("SELECT get_species(ARRAY[$pm_str])")->fetch();
                  echo json_encode($result["get_species"], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
                }
                break;
              case "location":
                if (isset($_GET['qstr'])){
                  $qstring = $_GET['qstr'];
                  $result = $conn->query("SELECT get_govlevelnames(ARRAY['Bundesland','Kreis','Stadt','Gemeinde'],'".$qstring."')")->fetch();
                  echo json_encode($result["get_govlevelnames"], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
                }
                break;
              default:
                echo json_encode('[{"id":0,"text":"NoData"}]');
          }
        }else{
          echo json_encode("{\"results\":[{\"id\":0, \"text\": \"noData\"}]}");
        }
     }
    }catch (PDOException $e){
     // report error message
     echo $e->getMessage();
    }
?>