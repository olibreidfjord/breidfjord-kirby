<?php

namespace Tablo;

use Kirby\Cms\App;
use Twig;
use Symfony\Component\VarDumper\VarDumper;

require __DIR__ . '/clsx.php';
require __DIR__ . '/stlx.php';

class Template extends \Kirby\Cms\Template
{
    private $twig;

    public function __construct(App $kirby, string $name, string $type = 'html', string $defaultType = 'html')    {
        parent::__construct($name, $type, $defaultType);

        $loader = new Twig\Loader\FilesystemLoader([]);

        // add default templates dir, if exists
        if (is_dir($dir = $kirby->root('templates'))) {
            $loader->addPath($dir);
            $loader->addPath($dir, 'templates');
        }

        // add default snippets dir, if exists
        if (is_dir($dir = $kirby->root('snippets'))) {
            $loader->addPath($dir, 'snippets');
        }

        // add plugin templates dirs
        foreach ($this->findDirs('templates') as $dir) if (is_dir($dir)) {
            $loader->addPath($dir);
            $loader->addPath($dir, 'templates');
            $loader->addPath(substr($dir, 0, -10) . '/snippets', 'snippets');
        }

        // add plugin snippets dir
        foreach ($this->findDirs('snippets') as $dir) if (is_dir($dir)) {
            $loader->addPath($dir, 'snippets');
        }

        $twig = new Twig\Environment($loader, [
          'cache' => $kirby->root('cache') . '/twig',
          'debug' => option('debug'),
        ]);

        $twig->addFilter(new Twig\TwigFilter('kirbytext', 'kirbytext', [
            'pre_escape' => 'html',
            'is_safe'    => ['html'],
        ]));
        $twig->addFilter(new Twig\TwigFilter('kirbytextinline', 'kirbytextinline', [
            'pre_escape' => 'html',
            'is_safe'    => ['html'],
        ]));

        $twig->addFunction(new Twig\TwigFunction('option', 'option'));
        $twig->addFunction(new Twig\TwigFunction('dump', function (...$args) {
            VarDumper::dump(...$args);
        }));

        $twig->addFunction(new Twig\TwigFunction('t', 't'));
        $twig->addFunction(new Twig\TwigFunction('tc', 'tc'));
        $twig->addFunction(new Twig\TwigFunction('tt', 'tt'));
        $twig->addFunction(new Twig\TwigFunction('page', 'page'));
        $twig->addFunction(new Twig\TwigFunction('clsx', 'clsx'));
        $twig->addFunction(new Twig\TwigFunction('stlx', 'stlx'));

        $twig->addFunction(new Twig\TwigFunction('*Html', function ($name, ...$arguments) {
            return \Html::$name(...$arguments);
        }, [
            'pre_escape' => 'html',
            'is_safe'    => ['html'],
        ]));

        $twig->addGlobal('kirby', kirby());
        $twig->addGlobal('site', site());
        $twig->addGlobal('page', page());
        $twig->addGlobal('pages', pages());

        $this->twig = $twig;
    }

    public function findDirs(string $extension): array
    {
        $paths = App::instance()->extensions($extension);
        $paths = array_filter($paths, fn ($x) => substr($x, -5) === '.twig');
        $paths = array_map(fn ($x) => explode("/{$extension}/", $x)[0] . "/{$extension}", $paths);
        $paths = array_unique($paths);
        $paths = array_values($paths);
        return $paths;
    }

    public function extension(): string
    {
        return 'twig';
    }

    public function file(): string|null
    {
        // check if php file exists
        if (
            $this->hasDefaultType() === true
            and $file_php = $this->root() . '/' . $this->name() . '.php'
            and is_file($file_php)
        ) {
            return realpath($file_php);
        }
        // fallback to default function
        return parent::file();
    }

    public function render(array $data = []): string
    {
        // render php
        if (substr($this->file(), -4) === '.php') {
            return parent::render($data);
        }
        // render twig
        return $this->twig->render(sprintf('%s.twig', $this->name), $data);
    }
}
