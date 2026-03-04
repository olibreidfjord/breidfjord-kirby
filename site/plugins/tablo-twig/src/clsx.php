<?php

/**
 * Returns a string of concatenated CSS class names.
 *
 * @param mixed ...$args Variable number of arguments to be converted to CSS class names.
 * @return string A string of concatenated CSS class names.
 */
function clsx(...$args)
{
    $res = [];
    foreach ($args as $key => $val) {
        if (is_array($val)) {
            $res[] = clsx(...$val);
        } elseif ($val) {
            $res[] = is_numeric($key) ? $val : $key;
        }
    }
    $res = array_filter($res);
    $res = array_unique($res);
    return join(' ', $res);
}
