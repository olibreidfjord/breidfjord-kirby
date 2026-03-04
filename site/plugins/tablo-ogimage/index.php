<?php

Kirby::plugin('tablo/ogimage', [
    'pageMethods' => [
        'ogImageGenerate' => function ($props) {
            $props = array_replace([
                't' => $this->title()->value(),
                'a' => $this->site()->title()->value(),
            ], array_filter([
                't'  => $props['title'] ?? null,
                'a'  => $props['author'] ?? null,
                'tc' => $props['textColor'] ?? null,
                'bg' => $props['backgroundColor'] ?? null,
            ]));
            return [
                'width'  => 1200,
                'height' => 630,
                'url'    => sprintf('https://og.tablo.me/card/%s.png', strtr(rtrim(base64_encode(json_encode($props)), '='), [
                    '+' => '-',
                    '/' => '_',
                ])),
            ];
        },
    ],
]);
