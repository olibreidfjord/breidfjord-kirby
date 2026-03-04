<?php

Kirby::plugin('tablo/sitemap', [
    'siteMethods' => [
        'sitemaps' => fn () => [
            site()->url() . '/sitemap.txt',
        ],
    ],
    'routes' => [
        [
            'pattern' => 'sitemap.txt',
            'action' => function () {
                $pages = [];
                // add homepage if not listed
                if (!site()->homePage()->isListed()) {
                    $pages[] = site()->url();
                }
                // iterate over all listed pages
                foreach (site()->index()->listed() as $page) {
                    // check if all the parents are listed
                    foreach ($page->parents() as $parent) {
                        if (!$parent->isListed()) {
                            continue 2;
                        }
                    }
                    // add page to sitemap
                    $pages[] = $page->url();
                }
                // filter only unique pages
                $pages = array_unique($pages);
                // return sitemap
                return new Response(join("\n", $pages), 'text/plain');
            },
        ],
        [
            'pattern' => 'sitemap',
            'action' => function () {
                return go('sitemap.txt', 301);
            },
        ],
    ],
]);
