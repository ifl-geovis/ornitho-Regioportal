<?php 

if (isset($_GET['art']) && isset($_GET['ort']) && isset($_GET['von']) && isset($_GET['bis'])){ 
  
require_once 'php/dbconfig.php';

    $dsn = "pgsql:host=$host;port=$port;dbname=$db;user=$username;password=$password";

    try{
     // create a PostgreSQL database connection
      $conn = new PDO($dsn);

      if($conn){
        $s1 = $_GET['art'];
        $s2 = $_GET['ort'];
        $result = $conn->query("select species_id,name_german as species_name,syst_sorting,govlevel_id,name as location_name,hmf,to_json(bbox) as bbox from ref_species a,ref_govlevel b where a.qname='$s1' and b.qname='$s2'")->fetch();
      }
      
      if(isset($result["species_id"])){
        $sid  = $result["species_id"];
        $sname= $result["species_name"];
        $tkmax = $result["syst_sorting"];
        $lid  = $result["govlevel_id"];
        $lname= $result["location_name"];
        $hmf  = $result["hmf"];
        $bbox = $result["bbox"];
      } else {
        echo 'Achtung : Zu Ihrer Anfrage konnte kein Ergebnis gefunden werden, bitte prüfen Sie Ihre Abfragewerte.';
        exit();
      }

    }catch (PDOException $e){
     // report error message
     echo $e->getMessage();
    }

?>

<!DOCTYPE html>
<html lang="de">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="keywords" content="">
  <meta name="description" content="ornitho-Regioportal">
  <meta name="author" content="Leibniz-Institut für Länderkunde">

  <link rel="shortcut icon" type="image/png" href="img/favicon_portal.ico">

  <!-- Global site tag (gtag.js) - Google Analytics -->
  <!-- <script async src="https://www.googletagmanager.com/gtag/js?id=UA-166090622-1"></script>
  <scr ipt>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'UA-166090622-1');
  </script> -->

  <!--custom styles-->
  <link rel="stylesheet" href="css/query.min.css"/>

  <title>ornitho-Regioportal Query App</title>
</head>

<body>

<!-- Begin page content -->
<div class="map-container">
  <div id="map"></div>
</div>

<!-- show loading progress -->
<div class="loading">
  <img id="loading-image" src="img/leaflet_loader.gif" alt="Loading..." />  
</div>

<!-- Initialize the info field -->
<div id="infoMsg">
  <span></span>
</div>

<!-- impr_Modal Dialog-->
<!-- <div id="impr_Modal" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <p>
      Anbieter der Internetpräsenz im Rechtssinne ist der
      Dachverband Deutscher Avifaunisten (DDA) e.V.
      </br>
      </br>
      <b>Adresse</b>
    </p>
    <p>
      An den Speichern 2
      <br/>
      48157 Münster
    </p>
    <p>
      Tel.: 0251 / 210140-0
      <br/>
      Fax: 0251 / 210140-29
    </p>
    <p>
      <b>Rechtsträger</b>
    </p>
    <p>
      Dachverband Deutscher Avifaunisten (DDA) e.V.
    </p>
    <p>
      Vereinsregister-Nr. 5174 beim Amtsgericht Münster
      <br/>
      Steuernummer 336/5754/4653, Finanzamt Münster-Außenstadt
      <br/>
      USt-IdNr. DE263129470
    </p> 
  </div>
</div> -->
<!-- END info_Modal Dialog-->


<!-- core JavaScript
================================================== -->
<!-- Placed at the end of the document so the pages load faster -->

<script src="js/toolsq.min.js"></script>
<script src="js/query.cfg.js" charset="UTF-8"></script>
<script type="text/javascript">
  infoObject.species_name = <?php echo json_encode($sname); ?>;
  infoObject.location_name = <?php echo json_encode($lname); ?>;
  infoObject.bbox = <?php echo $bbox; ?>;
  infoObject.hmf = <?php echo (int)$hmf; ?>;
  queryObject.sid = <?php echo $sid; ?>;
  queryObject.lid = <?php echo $lid; ?>;
  queryObject.year = Array.from([<?php echo ($_GET['von']); ?>, <?php echo ($_GET['bis']); ?>], Number);
  
  <?php if (isset($_GET['jzeit']) && $_GET['jzeit']!="") { ?>
    let obj = seasons.find(foo => foo.season === <?php echo json_encode($_GET['jzeit']); ?>);
    queryObject.tp = Array.from([obj.id, obj.id], Number);
    infoObject.season_select = obj.text;
  <?php } else { ?>
    queryObject.tp = Array.from([0, 0], Number);
    infoObject.season_select = 'Januar-Dezember';
  <?php }  ?>
  
  infoObject.tkmax = <?php 
  if (isset($tkmax)){ 
    if ($tkmax == 50)
      echo json_encode("tk50");
    elseif ($tkmax == 25)
      echo json_encode("tk25");
    else
      echo json_encode("tk25vrt");    
  } else { 
    echo json_encode("tk50");
  } 
?>
</script>
<script src="js/query.min.js" charset="UTF-8"></script>

</body>

</html>

<?php } else { ?> 

Die Karten-Abfrage bitte mit folgenden Parametern aufrufen: 
<p>
https://www.ornitho-regioportal.de/query?art=Amsel&ort=Starnberg&von=2016&bis=2021&jzeit=
</p>
'jzeit' ist optional. folgende Werte können gewählt werden.</br> 
<ul>
<li>Fruehling</li>
<li>Sommer</li>
<li>Herbst</li>
<li>Winter</li> 
</ul> 
<p>
Ohne den Parameter 'jzeit' wird von ganzjährig (Januar-Dezember) ausgegangen.
</p> 

<?php } ?>