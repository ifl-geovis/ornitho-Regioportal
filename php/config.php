<?php

define('ROOT', 'https://www.ornitho.de/');
define('HOST', 'www.ornitho.de');
define('OAUTH_HOST', ROOT . 'index.php?m_id=1200'); // URL of the OAuth server
define('REQUEST_TOKEN_URL', OAUTH_HOST . "&cmd=request_token"); // URL to call to request a token
define('AUTHORIZE_URL', OAUTH_HOST . "&cmd=authorize"); // URL to call to authorize
define('ACCESS_TOKEN_URL', OAUTH_HOST . "&cmd=access_token"); // URL to call to transform a request token in a access token
define('CALLBACK_URI', 'https://ornitho-regioportal.de/login.php'); // URL for the callback auth process

define('BIOLOVISION_USER_EMAIL', 'xxx');
define('BIOLOVISION_USER_PW', 'xxx');
define('BIOLOVISION_CONSUMER_KEY', 'xxx');
define('BIOLOVISION_CONSUMER_SECRET', 'xxx');

define('BIOLOVISION_GROUP_TK25', 5);
define('BIOLOVISION_GROUP_TK25VRT', 8);
define('BIOLOVISION_GROUP_TK25HMF', 6);