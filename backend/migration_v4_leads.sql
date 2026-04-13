-- Enhancements for ArchiBuilder V4 and Lead Management

-- 1. Support for Homepage definition
ALTER TABLE web_paginas_v4 ADD COLUMN is_homepage TINYINT(1) DEFAULT 0;

-- 2. Table for raw web messages (Back up lead data)
CREATE TABLE IF NOT EXISTS web_mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    correo VARCHAR(255),
    telefono VARCHAR(50),
    asunto VARCHAR(255),
    mensaje TEXT,
    pagina_origen VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leido TINYINT(1) DEFAULT 0
);

-- 3. Ensure 'nuevo' flag or similar can be used in clients if needed
-- The user mentioned "definiendo que es nuevo", we can use the 'estado' field or just add a 'es_nuevo' column.
-- For now, we will use 'estado' = 'prospecto' and perhaps a specific note.
ALTER TABLE clientes ADD COLUMN es_nuevo TINYINT(1) DEFAULT 1;
