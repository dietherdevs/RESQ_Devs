<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Leave this matching your local dev server
    'allowed_origins' => ['http://localhost:5173'], 

    // ADD THIS LINE BELOW: This allows ANY netlify.app subdomain to connect safely
    'allowed_origins_patterns' => [
        '/^https:\/\/[a-zA-Z0-9-]+--[a-zA-Z0-9-]+\.netlify\.app$/', // For Netlify preview branches
        '/^https:\/\/[a-zA-Z0-9-]+\.netlify\.app$/'                 // For your main Netlify production URL
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];