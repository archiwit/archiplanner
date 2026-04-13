-- Migration for ArchiBuilder V4
CREATE TABLE IF NOT EXISTS web_paginas_v4 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    is_visible TINYINT(1) DEFAULT 1,
    estado ENUM('borrador', 'publicado') DEFAULT 'borrador',
    content LONGTEXT, -- Stores the JSON UI tree
    style_config LONGTEXT -- Stores global page styles as JSON
);
