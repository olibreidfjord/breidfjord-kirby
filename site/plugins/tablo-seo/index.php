<?php

namespace tablo;

use Kirby;

Kirby::plugin('tablo/seo', [
    'blueprints' => [
        'tabs/seo' => __DIR__ . '/blueprints/tabs/seo.yml',
    ],
]);
