<?php

function stlx(...$args): array
{
    $res = [];
    $args = array_replace(...$args);
    $args = array_filter($args, fn ($x) => (is_string($x) and $x) or is_numeric($x));
    foreach ($args as $key => $val) {
        $res[] = $key . ':' . $val;
    }
    return $res;
}
