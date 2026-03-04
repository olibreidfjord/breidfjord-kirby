<?php

use Kirby\Uuid\Uuid;

Kirby::plugin('tablo/kirbytags', [
    'tags' => [
        'button' => [
            'attr' => [
                'class',
                'rel',
                'target',
                'title',
                'text',
                'primary',
            ],
            'html' => function ($tag) {
                // if value is a UUID, resolve to page/file model
                // and use the URL as value
                if (
                    Uuid::is($tag->value, 'page') === true ||
                    Uuid::is($tag->value, 'file') === true
                ) {
                    $tag->value = Uuid::for($tag->value)->model()->url();
                }

                $anchor = Html::a($tag->value, $tag->text, [
                    'class'  => 'button' . ($tag->primary ? ' button--primary' : '') . ($tag->class ? ' ' . $tag->class : ''),
                    'rel'    => $tag->rel,
                    'title'  => $tag->title,
                    'target' => $tag->target,
                ]);

                return Html::tag('aside', [ $anchor ], [
                    'class' => 'flex flex-row flex-wrap gap-2 text-action',
                ]);
            },
        ],
    ],
]);
