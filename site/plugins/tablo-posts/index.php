<?php

namespace tablo;

use Kirby;

load([
    'PostsPage' => 'models/page-posts.php',
], __DIR__);

Kirby::plugin('tablo/posts', [
    'options' => [
        'dateFormat'   => 'M d, Y',
        'previewLimit' => 5,
    ],
    'translations' => [
        'en' => array_replace(
            include __DIR__ . '/translations/en.php',
            option('tablo.posts.translations') ?? [],
        ),
    ],
    'blueprints' => [
        'blocks/posts'    => __DIR__ . '/blueprints/blocks/posts.yml',
        'pages/post'      => __DIR__ . '/blueprints/pages/post.yml',
        'pages/posts'     => __DIR__ . '/blueprints/pages/posts.yml',
        'sections/posts'  => __DIR__ . '/blueprints/sections/posts.yml',
    ],
    'controllers' => [
        'posts' => require __DIR__ . '/controllers/posts.php',
    ],
    'pageModels' => [
        'posts'   => 'PostsPage',
    ],
    'siteMethods' => [],
    'pageMethods' => [],
    'fieldMethods' => [],
]);
