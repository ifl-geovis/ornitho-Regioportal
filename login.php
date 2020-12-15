<?php
session_start();
ini_set('display_errors', 1); ini_set('display_startup_errors', 1); error_reporting(E_ALL);

require_once('php/config.php');
// Logout cmd
if (isset($_GET['logout'])) {
    $_SESSION['state'] = 0;
    $_SESSION['oauth_token_secret'] = null;
    $_SESSION['oauth_token'] = null;
    $_SESSION['user_name'] = null;
    $_SESSION['user_search_access'] = false;

    header('Location: index.html');
    exit;
}


//Return current user.
if(isset($_GET['current'])) {
    header('Content-Type: application/json');
    if(array_key_exists('user_name', $_SESSION) && !is_null($_SESSION['user_name'])) {
        print json_encode([
           'user_name' => $_SESSION['user_name'],
           'user_search_access' => $_SESSION['user_search_access']
        ]);
    }
    else {
        print '{}';
    }

    exit;
}

// we have requested a request token but we didn't have receive it (probably wrong credential) => reset state
if(!isset($_GET['oauth_token']) && array_keys($_SESSION, 'state') && $_SESSION['state']==1) {
    $_SESSION['state'] = 0;
    $_SESSION['oauth_token_secret'] = null;
    $_SESSION['oauth_token'] = null;
    $_SESSION['user_name'] = null;
    $_SESSION['user_search_access'] = null;
}

// retrieve user info using the PHP OAUTH 3 legged build-in module
if (!(!isset($_GET['login']) && $_SESSION['state'] == 0)) {
    $consumer_user_id = null;

    $params = array(
        'user_id' => $consumer_user_id
    );

    // perform the auth and run the API call
    try
    {
        $oauth = new OAuth(BIOLOVISION_CONSUMER_KEY, BIOLOVISION_CONSUMER_SECRET, OAUTH_SIG_METHOD_HMACSHA1, OAUTH_AUTH_TYPE_URI);
//        $oauth->enableDebug(); // uncomment for more debug info

        // step 1 : ask request token
        if(!isset($_GET['oauth_token']) && !$_SESSION['state'])
        {
            $callback_uri = CALLBACK_URI . '?consumer_key='.rawurlencode(BIOLOVISION_CONSUMER_KEY);
            $request_token_info = $oauth->getRequestToken(REQUEST_TOKEN_URL, $callback_uri);

            $_SESSION['oauth_token_secret'] = $request_token_info['oauth_token_secret'];
            $_SESSION['state'] = 1;

            $uri = AUTHORIZE_URL . '&oauth_token='.rawurlencode($request_token_info['oauth_token']).'&oauth_callback='.rawurlencode($callback_uri);
            header('Location: ' . $uri);
            exit;
        }
        // step 2 : get access token
        else if($_SESSION['state']==1)
        {
            $oauth->setToken($_GET['oauth_token'],$_SESSION['oauth_token_secret']);
            $access_token_info = $oauth->getAccessToken(ACCESS_TOKEN_URL);
            $_SESSION['state'] = 2;
            $_SESSION['oauth_token'] = $access_token_info['oauth_token'];
            $_SESSION['oauth_token_secret'] = $access_token_info['oauth_token_secret'];
        }

        // step 3 : run query
        $request_uri = ROOT . 'api/observers/current/';
        $oauth->setToken($_SESSION['oauth_token'],$_SESSION['oauth_token_secret']);
        $oauth->fetch($request_uri, $params, 'POST');
        $response = $oauth->getLastResponse();


        $data = json_decode($response, true); // display raw user data

        if(array_key_exists('data', $data) && count($data['data'])) {
            $_SESSION['user_name'] = $data['data'][0]['surname'] . ' ' . $data['data'][0]['name'];
            $_SESSION['user_search_access'] = boolval($data['data'][0]['has_search_access']);
        }
        else {
            // Something wrong happened - the response is empty.
        }
    }
    catch(OAuthException $E)
    {
        /*    print "<pre>";
                print_r($E);
                print "</pre>"; */
    }
}
?>
<html>
<script type="text/javascript">
    window.close ();
</script>
<body></body>
</html>

