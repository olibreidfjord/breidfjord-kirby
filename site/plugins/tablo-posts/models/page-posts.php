<?php

class PostsPage extends Page
{

    public function posts(?int $limit = null)
    {
        $posts = $this->children()->listed()->flip();
        $posts = $posts->filterBy('pinned', true)->merge( $posts->filterBy('pinned', false) );
        // limit posts
        if ($limit and $limit > 0) {
            $posts = $posts->limit($limit);
        }
        // return
        return $posts;
    }

    public function tags(bool $drafts = false)
    {
        $tags = $this->children()->listed()->pluck('tags', ',', true);
        $collator = new Collator(locale_get_default());
        $collator->sort($tags);
        return array_values($tags);
    }
}
