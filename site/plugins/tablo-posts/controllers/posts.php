<?php

return function ($page, $site, $kirby) {
    // get all posts
    $posts = $page->posts();
    // get tag
    $tag = param('tag');
    // filter by tag
    if ($tag) {
        $posts = $posts->filterBy('tags', $tag, ',');
    }
    // tag not found
    if ($posts->count() === 0) {
        \Kirby\Http\Header::notfound(true);
        echo $site->errorPage()->render();
        exit;
    }
    // get author
    $author = ($x = param('author')) ? $kirby->user($x) ?? false : null;
    // author not found
    if (false === $author) {
        \Kirby\Http\Header::notfound(true);
        echo $site->errorPage()->render();
        exit;
    }
    // filter by author
    if ($author) {
        $posts = $posts->filter(fn ($x) => $x->author()->toUser()?->is($author) ?? false);
    }
    // return template data
    return [
        'tag'    => $tag,
        'author' => $author,
        'posts'  => $posts,
    ];
};
