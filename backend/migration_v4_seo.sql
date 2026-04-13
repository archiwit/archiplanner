-- Migration for SEO fields in ArchiBuilder V4
ALTER TABLE web_paginas_v4 
ADD COLUMN seo_title VARCHAR(255) DEFAULT NULL,
ADD COLUMN seo_description TEXT DEFAULT NULL,
ADD COLUMN seo_keywords VARCHAR(255) DEFAULT NULL;
