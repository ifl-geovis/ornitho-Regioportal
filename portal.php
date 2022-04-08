<?php
session_start();

if(!array_key_exists('state', $_SESSION)){
  $_SESSION['state'] = 0;
  $_SESSION['already_refreshed'] = 0;
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
  <meta name="author" content="Leibniz-Institut für Länderkunde (IfL) e.V.">

  <link rel="shortcut icon" type="image/png" href="img/favicon_portal.ico">

  <!-- Global site tag (gtag.js) - Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=UA-166090622-1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'UA-166090622-1');
  </script>

  <!--lib styles-->
  <link rel="stylesheet" href="css/tools.min.css"/>
  <!--custom styles-->
  <link rel="stylesheet" href="css/portal.min.css"/>

  <title>ornitho-Regioportal</title>
</head>

<body>

<!-- Start navbar-expand -->
<nav class="navbar navbar-expand-lg navbar-dark fixed-top bg-dark" role="navigation">

  <div class='navbar-brand'>
     <div class='logo'><img src="img/ornitho_logo.png"></div>
  </div>

  <button class="navbar-toggler align-self-center" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="#navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <!-- Start navbar-collapse-->
  <div class="collapse navbar-collapse flex-column align-items-start" id="navbarCollapse">

    <!-- Start navbar-nav-->
    <div class="navbar-nav parent">

      <div class="align-bottom left">
        <div class="input-group" id="mainselector">
          <select id="species-search-input"></select>&nbsp;
          <select id="places-search-input"></select>&nbsp;
          <select id="layer-input">
            <option value="VOR">Vorkommen</option>
            <option value="BZC">Brutstatus</option>
            <option value="NON">ohne Vogeldaten</option>
          </select>
        </div>
      </div>

      <ul class="navbar-nav right">

        <?php
        if ($_SESSION['state'] != 2) { ?>
          <li class="nav-item pl-4 pr-2 align-bottom">
            <a class="nav-link" href="php/login.php?login=1" target="_blank" title="Login mit ornitho.de" id="Login">
              <i class="icon-user white" aria-hidden="true"></i>
              <h2>Login</h2>
            </a>
          </li>

        <?php } else {

          ?>
          <li class="nav-item pl-4 pr-2 align-bottom">
            <a class="nav-link" href="php/login.php?logout=1" title="Logout mit ornitho.de" id="Logout">
              <i class="icon-user white" aria-hidden="true"></i>
              <h2>Logout</h2>
            </a>
          </li>
        <?php } ?>

        <li class="nav-item pl-4 align-bottom">
          <a class="nav-link" href="components/tutorial.html" target="_blank" title="zu den Tutorials">
            <i class="icon-help-circled white"></i>
            <h2>Hilfe</h2>
          </a>
        </li>

      </ul>

    </div>
    <!-- End navbar-nav -->

    <!-- Start btn-toolbar-->
    <div class="btn-toolbar mt-2" role="toolbar" aria-label="Toolbar with button groups">

      <div class="btn-group btn-group-lg btn-group-toggle mr-3" id="seasonselector" data-toggle="buttons">
        <label class="btn btn-outline-secondary btn-toggle mr-1 active" data-toggle="tooltip" data-placement="top" title="Januar-Dezember">
          <input type="radio" name="season" id="0" autocomplete="off" checked>ganzjährig
        </label>
        <label class="btn  btn-outline-secondary btn-toggle mr-1" data-toggle="tooltip" data-placement="top" title="März-Mai">
          <input type="radio" name="season" id="1" autocomplete="off">Frühling
        </label>
        <label class="btn btn-outline-secondary btn-toggle mr-1" data-toggle="tooltip" data-placement="top" title="Juni-August">
          <input type="radio" name="season" id="2" autocomplete="off">Sommer
        </label>
        <label class="btn btn-outline-secondary btn-toggle mr-1" data-toggle="tooltip" data-placement="top" title="September-November">
          <input type="radio" name="season" id="3" autocomplete="off">Herbst
        </label>
        <label class="btn btn-outline-secondary btn-toggle mr-1" data-toggle="tooltip" data-placement="top" title="Dezember-Februar">
          <input type="radio" name="season" id="4" autocomplete="off">Winter
        </label>
        <label class="btn btn-outline-secondary btn-toggle hiding" data-toggle="tooltip" data-placement="top" title="nur im Expertenmodus">
          <input type="radio" name="season" id="5" autocomplete="off">Monatsdrittel
        </label>
      </div>

      <div class="input-group mr-3" id="yearselector">
        <select id="yearselector_from"></select>
        <div class="input-group-append">
          <span class="input-group-text">bis</span>
        </div>
        <select id="yearselector_to"></select>
      </div>

      <button type="button" class="btn btn-lg btn-outline-primary" type="submit" id="submit" value="start Query">&rArr;&nbsp;Auswahl anzeigen</button>

      <div class="w-100 mb-2 hiding" id="divseparator"></div>

      <div class="input-group hiding" id="decadeselector">
        <div class="input-group-prepend">
          <span class="input-group-text">Start-und Enddekade</span>
        </div>
        <select id="decadeselector_from"></select>
        <div class="input-group-append">
          <span class="input-group-text">bis</span>
        </div>
        <select id="decadeselector_to"></select>
      </div>

    </div>
    <!-- End btn-toolbar-->

  </div>
  <!--End navbar-collapse -->

</nav>
<!-- End navbar-expand -->


<!-- Begin page content, the map will be included here -->
<div class="container-fluid flex-fill">
  <div class="row">
    <div class="col-lg-12 p-2 my-auto">
      <div class="card card-body bg-light" id="map"></div>
    </div>
  </div>
</div>

<!-- show loading progress -->
<div class="loading">
  <img id="loading-image" src="img/leaflet_loader.gif" alt="Loading..." />  
</div>

<!-- Initialize the info field -->
<div id="infoMsg">
  <span></span>
</div>

<!-- info_Modal Dialog-->
<div class="modal fade" id="info_Modal" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-body" id="tabsImprint">
        <nav>
          <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
            <a class="nav-item nav-link active" id="nav-privacy-tab" data-toggle="tab" href="#imprint" role="tab" aria-controls="nav-privacy" aria-selected="false">
              &nbsp;Impressum
            </a>
            <a class="nav-item nav-link" id="nav-privacy-tab" data-toggle="tab" href="#privacy" role="tab" aria-controls="nav-privacy" aria-selected="false">
              &nbsp;Datenschutzerklärung
            </a>
          </div>
        </nav>
        <div class="tab-content py-3 px-3 px-sm-0">
          <div class="tab-pane fade show active" id="imprint">
          <!-- Imprint content will be included here -->
          </div>
          <div class="tab-pane fade" id="privacy">
          <!-- Privacy content will be included here -->
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-md btn-secondary mr-3 ml-auto" data-dismiss="modal">schlie&szlig;en</button>
      </div>
    </div>
  </div>
</div>
<!-- END info_Modal Dialog-->

<!-- start_Modal Dialog-->
<!-- <div class="modal fade" id="start_Modal">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Hinweis</h3>
        <button type="button" class="close" data-dismiss="modal">&times;</button>
      </div>
      <div class="modal-body" id="startModal">
        <p>
        Liebe Vogelinteressierte,<br/>
        die Datensammlung von ornitho.de startete im Jahr 2011.
        Derzeit umfasst die Datenbank über 50 Millionen Vogelbeobachtungen (Stand Oktober 2020).
        Wir bitten dies beim Laden der Kartendarstellung zu berücksichtigen.<br/>
        Das Portal ist in ständiger Weiterentwicklung.
        </p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-md btn-secondary mr-3 ml-auto" data-dismiss="modal">schlie&szlig;en</button>
      </div>
    </div>
  </div>
</div> -->
<!-- END start_Modal Dialog-->

<!-- JavaScript placed at the end of the document so the pages load faster -->
<script src="js/tools.min.js"></script>

<script type="text/javascript">

  // $(document).ready(function(){
  //   $("#start_Modal").modal('show');
  // });

  // Set the name of the hidden property and the change event for visibility
  var hidden, visibilityChange;
  if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
    hidden = "hidden";
    visibilityChange = "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }

  //handle Visibility
  function handleVisibilityChange() {
    <?php  if(!($_SESSION['already_refreshed'])){ ?>
              if (!document.hidden) {
                $.ajax({
                  url: 'php/login.php',
                  type: 'GET',
                  dataType: "json",
                  contentType: "application/json; charset=utf-8",
                  data: {
                    current:''
                  },
                }).done(function(response) {
                  var userData = $.parseJSON(JSON.stringify(response));
                  if(!$.isEmptyObject(userData)){
                      <?php $_SESSION['already_refreshed'] = 1; ?>
                      location.reload();
                  }
                });
              }
    <?php } ?>
  }

  // Warn if the browser doesn't support addEventListener or the Page Visibility API
  if (typeof document.addEventListener === "undefined" || hidden === undefined) {
    console.log("This requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
  } else {
    // Handle page visibility change
    document.addEventListener("visibilitychange", handleVisibilityChange, false);
  }


  <?php if (isset($_SESSION['user_search_access']) && $_SESSION['user_search_access']==1){ ?>
    var searchpriv = 1;
    $("#seasonselector > label:nth-child(6)").removeClass('hiding').addClass('showing_f');
  <?php } else { ?> var searchpriv = 0; <?php } ?>

</script>

<!-- config file -->
<script src="js/portal.cfg.js" charset="UTF-8"></script>
<!-- minified custom scripts for webmapping -->
<script src="js/portal.min.js" charset="UTF-8"></script>

</body>

</html>
