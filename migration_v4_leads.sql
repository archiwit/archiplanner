-- 1. Ensure web_paginas_v4 has homepage flag
ALTER TABLE web_paginas_v4 ADD COLUMN IF NOT EXISTS is_homepage TINYINT(1) DEFAULT 0;

-- 2. Create web_mensajes for lead capture redundancy
CREATE TABLE IF NOT EXISTS web_mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255),
    telefono VARCHAR(50),
    mensaje TEXT,
    pagina_origen VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Ensure clients table can handle 'prospecto' status and 'es_nuevo' flag
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS es_nuevo TINYINT(1) DEFAULT 0;
ALTER TABLE clientes MODIFY COLUMN estado ENUM('activo', 'inactivo', 'prospecto', 'pendiente') DEFAULT 'prospecto';
