<?php
// Run with: php tests/artwork-caption.php
require dirname(__DIR__) . '/vendor/autoload.php';

use Kirby\Content\Content;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;

$twig = new Environment(new FilesystemLoader(dirname(__DIR__) . '/site/plugins/tablo-theme/snippets'), ['strict_variables' => true]);
$twig->addFunction(new Twig\TwigFunction('t', fn ($key) => $key));
$cases = [
    'duplicate church' => [['worktitle' => 'Bústaðakirkja, Reykjavík', 'location' => 'Bústaðakirkja, Reykjavík', 'year' => '1982–98'], ['Bústaðakirkja, Reykjavík', '1982–98']],
    'case and surrounding whitespace' => [['worktitle' => ' Bústaðakirkja ', 'location' => 'bústaðakirkja'], ['Bústaðakirkja']],
    'stored size' => [['worktitle' => 'Dýrð-Vald-Virðing', 'size' => '860 x 190 cm', 'location' => 'Hallgrímskirkja', 'year' => '1999'], ['Dýrð-Vald-Virðing', '860 x 190 cm', 'Hallgrímskirkja', '1999']],
    'missing size' => [['worktitle' => 'Window', 'location' => 'Edinburgh'], ['Window', 'Edinburgh']],
    'size only' => [['size' => '24 × 32 cm'], ['24 × 32 cm']],
    'location only' => [['location' => 'Fossvogur Chapel'], ['Fossvogur Chapel']],
    'blank fields' => [['worktitle' => '  ', 'size' => '', 'location' => "\t", 'year' => "\n"], []],
    'empty content' => [[], []],
    'preserve distinct location' => [['worktitle' => "St Giles’ Cathedral", 'location' => "St Giles’ Cathedral, Edinburgh"], ["St Giles’ Cathedral", "St Giles’ Cathedral, Edinburgh"]],
    'escape markup' => [['worktitle' => '<script>alert("x")</script>', 'location' => 'A & B'], ['<script>alert("x")</script>', 'A & B']],
];

foreach ($cases as $name => [$fields, $expected]) {
    $image = new class($fields) {
        public function __construct(private array $fields) {}
        public function content(): Content { return new Content($this->fields); }
        public function size(): int { throw new RuntimeException('Caption must not read file size'); }
    };
    $html = $twig->render('artwork-caption.twig', ['image' => $image]);
    preg_match_all('/<span[^>]*data-caption-part>(.*?)<\/span>/s', $html, $matches);
    $actual = array_map(fn ($text) => html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8'), $matches[1]);
    if ($actual !== $expected) {
        throw new RuntimeException($name . ': ' . json_encode($actual, JSON_UNESCAPED_UNICODE));
    }
    if (($expected !== []) !== str_contains($html, '<figcaption')) {
        throw new RuntimeException($name . ': incorrect empty caption behaviour');
    }
    if (str_contains($html, '<script>')) {
        throw new RuntimeException($name . ': caption markup was not escaped');
    }
    if (preg_match('/<\/span><span/', $html)) {
        throw new RuntimeException($name . ': missing text whitespace between fields');
    }
    echo "PASS $name\n";
}

// Compile the consuming template too, without rendering a page or changing CMS data.
$project = dirname(__DIR__) . '/site/plugins/tablo-theme/templates/project.twig';
$twig->parse($twig->tokenize(new Twig\Source(file_get_contents($project), 'project.twig')));
echo "PASS project template syntax\n";
