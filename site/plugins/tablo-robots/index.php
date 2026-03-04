<?php

Kirby::plugin('tablo/robots', [
    'routes' => [
        [
            'pattern' => 'robots.txt',
            'action' => function () {
                // initialize empty
                $data = [
                    'User-agent: *',
                    'Disallow:',
                ];
                // sitemaps
                if ($sitemaps = site()->sitemaps() and is_array($sitemaps)) {
                    foreach ($sitemaps as $sitemap) {
                        $data[] = 'Sitemap: ' . $sitemap;
                    }
                };
                // return response
                return new Response(join("\n", $data), 'text/plain');
            },
        ],
    ],
]);
