<?php

class ProjectPage extends Page
{

    public function getCoverImage()
    {
        return $this->cover()->toFile() ?? $this->media()->toFile();
    }
}
