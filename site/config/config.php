<?php

$host = $_SERVER['HTTP_HOST'] ?? '';

if (str_contains($host, 'kirby.test')) {
    $url = 'https://kirby.test';
} elseif (str_contains($host, 'breidfjord.test')) {
    $url = 'https://breidfjord.test';
} elseif (str_contains($host, 'thisisdongzi.test')) {
    $url = 'https://thisisdongzi.test';
} else {
    $url = 'https://' . $host;
}

return [
    'debug' => str_contains($host, '.test'),
    'yaml.handler' => 'symfony',
    'url' => $url,
    'panel.install' => false,
];