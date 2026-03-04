<?php

namespace tablo;

use Kirby;

load([
    'ProjectPage' => 'models/page-project.php',
], __DIR__);

Kirby::plugin('tablo/theme', [
    'options' => [
        'htmlLang'         => 'en',
        'titleSeparator'   => ' — ',
        'smoothNavigation' => true,
    ],
    'translations' => [
        'en' => array_replace(
            include __DIR__ . '/translations/en.php',
            option('tablo.theme.translations') ?? [],
        ),
    ],
    'blueprints' => [
        'site'                   => __DIR__ . '/blueprints/site.yml',
        'blocks/descriptions'    => __DIR__ . '/blueprints/blocks/descriptions.yml',
        'blocks/gallery'         => __DIR__ . '/blueprints/blocks/gallery.yml',
        'blocks/heading'         => __DIR__ . '/blueprints/blocks/heading.yml',
        'blocks/image'           => __DIR__ . '/blueprints/blocks/image.yml',
        'blocks/numbers'         => __DIR__ . '/blueprints/blocks/numbers.yml',
        'blocks/people'          => __DIR__ . '/blueprints/blocks/people.yml',
        'blocks/projects'        => __DIR__ . '/blueprints/blocks/projects.yml',
        'blocks/properties'      => __DIR__ . '/blueprints/blocks/properties.yml',
        'blocks/showcase'        => __DIR__ . '/blueprints/blocks/showcase.yml',
        'blocks/space'           => __DIR__ . '/blueprints/blocks/space.yml',
        'blocks/text'            => __DIR__ . '/blueprints/blocks/text.yml',
        'fields/ablank'          => __DIR__ . '/blueprints/fields/ablank.yml',
        'fields/arel'            => __DIR__ . '/blueprints/fields/arel.yml',
        'fields/blocks'          => __DIR__ . '/blueprints/fields/blocks.yml',
        'fields/blocks-content'  => __DIR__ . '/blueprints/fields/blocks-content.yml',
        'fields/blocks-features' => __DIR__ . '/blueprints/fields/blocks-features.yml',
        'fields/layout'          => __DIR__ . '/blueprints/fields/layout.yml',
        'fields/menu'            => __DIR__ . '/blueprints/fields/menu.yml',
        'fields/socials'         => __DIR__ . '/blueprints/fields/socials.yml',
        'files/default'          => __DIR__ . '/blueprints/files/default.yml',
        'pages/default'          => __DIR__ . '/blueprints/pages/default.yml',
        'pages/error'            => __DIR__ . '/blueprints/pages/error.yml',
        'pages/folder'           => __DIR__ . '/blueprints/pages/folder.yml',
        'pages/generic'          => __DIR__ . '/blueprints/pages/generic.yml',
        'pages/home'             => __DIR__ . '/blueprints/pages/home.yml',
        'pages/project'          => __DIR__ . '/blueprints/pages/project.yml',
        'pages/text'             => __DIR__ . '/blueprints/pages/text.yml',
        'sections/files'         => __DIR__ . '/blueprints/sections/files.yml',
        'sections/pages'         => __DIR__ . '/blueprints/sections/pages.yml',
        'tabs/files'             => __DIR__ . '/blueprints/tabs/files.yml',
        'tabs/site-layout'       => __DIR__ . '/blueprints/tabs/site-layout.yml',
        'tabs/site-structure'    => __DIR__ . '/blueprints/tabs/site-structure.yml',
        'tabs/theme'             => __DIR__ . '/blueprints/tabs/theme.yml',
    ],
    'pageModels' => [
        'project' => 'ProjectPage',
    ],
    'siteMethods' => [
        'theme' => function (?string $scope = null) {
            // parse props
            $data = $this->theme_props()->value ?? '';
            $data = parse_ini_string($data, true, INI_SCANNER_TYPED);
            // scope
            if ($scope and isset($data[$scope]) and is_array($data[$scope])) {
                $data = array_replace_recursive($data, $data[$scope]);
                unset($data[$scope]);
            }
            // return all props
            return $data;
        },
    ],
    'pageMethods' => [
        'theme' => function (?string $prop = null, ?string $unit = null, ?string $scope = null) {
            // parse props
            $data = $this->theme_props()->value ?? '';
            $data = parse_ini_string($data, true, INI_SCANNER_TYPED);
            // merge with parent
            $data = array_replace_recursive(
                $this->parent()?->theme(scope: $scope) ?? $this->site()->theme(scope: $scope),
                $data,
            );
            // scope
            if ($scope and isset($data[$scope]) and is_array($data[$scope])) {
                $data = array_replace_recursive($data, $data[$scope]);
                unset($data[$scope]);
            }
            // return all props
            if (!$prop) {
                return $data;
            }
            // find value
            $value = array_reduce(explode('.', $prop), fn ($data, $key) => $data[$key] ?? null, $data);
            // return value with unit
            return ($unit and isset($value)) ? $value . $unit : $value;
        },
    ],
    'fieldMethods' => [
        'unit' => function ($field, string $unit = '') {
            if ($field->isEmpty() or !$unit) {
                return $field;
            }

            $field = clone $field;
            $field->value .= $unit;
            return $field;
        },
    ],
    'templates' => [
        'blank'    => __DIR__ . '/templates/blank.twig',
        'default'  => __DIR__ . '/templates/default.twig',
        'error'    => __DIR__ . '/templates/error.twig',
        'folder'   => __DIR__ . '/templates/folder.twig',
        'generic'  => __DIR__ . '/templates/generic.twig',
        'home'     => __DIR__ . '/templates/home.twig',
        'post'     => __DIR__ . '/templates/post.twig',
        'posts'    => __DIR__ . '/templates/posts.twig',
        'project'  => __DIR__ . '/templates/project.twig',
        'text'     => __DIR__ . '/templates/text.twig',
    ],
]);
