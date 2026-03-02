<?php

$host = $_SERVER['HTTP_HOST'] ?? '';
$url = str_contains($host, 'kirby.test') ? 'https://kirby.test' : 'https://kirby.olafurbreidfjord.com';

return [
    'debug' => str_contains($host, 'kirby.test'),
    'yaml.handler' => 'symfony',
    'url' => $url,
    'panel.install' => false,
];
