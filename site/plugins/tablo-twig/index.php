<?php

require __DIR__ . '/src/Template.php';

Kirby::plugin('tablo/twig', [
    'components' => [
        'template' => function (Kirby $kirby, string $name, string $type = 'html', string $defaultType = 'html') {
            return new Tablo\Template($kirby, $name, $type, $defaultType);
        },
    ],
]);
