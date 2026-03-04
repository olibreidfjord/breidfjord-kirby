<?php

Kirby::plugin('tablo/link-title', [
    'fieldMethods' => [
        'toTitle' => function ($field) {
            $value = $field->value;
            // page
            if (str_starts_with($value, 'page://')) {
                return $field->toPage()?->title() ?? 'Not Found';
            }
            // file
            if (str_starts_with($value, 'file://')) {
                $file = $field->toFile();
                return $file->title()->isNotEmpty() ? $file->title() : $file->filename();
            }
            // email
            if (str_starts_with($value, 'mailto:')) {
                return substr($value, 7);
            }
            // phone
            if (str_starts_with($value, 'tel:')) {
                return substr($value, 4);
            }
            // default
            return $value;
        },
    ],
]);
