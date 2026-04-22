-- ArchiPlanner V4 PROD - Script de Fusión (Migración Estructural)
-- Este script añade las columnas necesarias sin borrar los datos actuales.

DELIMITER //

DROP PROCEDURE IF EXISTS ArchiMigrateV4 //
CREATE PROCEDURE ArchiMigrateV4()
BEGIN
    -- Función auxiliar interna para añadir columnas si no existen
    -- Nota: Se debe declarar la lógica aquí dentro
    
    -- 1. Tabla GASTOS
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'gastos' AND COLUMN_NAME = 'estado') THEN
        ALTER TABLE gastos ADD COLUMN estado ENUM('pendiente', 'pagado') DEFAULT 'pendiente';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'gastos' AND COLUMN_NAME = 'item_id') THEN
        ALTER TABLE gastos ADD COLUMN item_id INT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'gastos' AND COLUMN_NAME = 'categoria') THEN
        ALTER TABLE gastos ADD COLUMN categoria VARCHAR(50) DEFAULT 'General';
    END IF;

    -- 2. Tabla CONFIGURACION
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'configuracion' AND COLUMN_NAME = 'es_activa') THEN
        ALTER TABLE configuracion ADD COLUMN es_activa BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'configuracion' AND COLUMN_NAME = 'logo_cuadrado_path') THEN
        ALTER TABLE configuracion ADD COLUMN logo_cuadrado_path VARCHAR(255) DEFAULT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'configuracion' AND COLUMN_NAME = 'logo_horizontal_path') THEN
        ALTER TABLE configuracion ADD COLUMN logo_horizontal_path VARCHAR(255) DEFAULT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'configuracion' AND COLUMN_NAME = 'color_primario') THEN
        ALTER TABLE configuracion ADD COLUMN color_primario VARCHAR(7) DEFAULT '#FF8484';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'configuracion' AND COLUMN_NAME = 'nav_config') THEN
        ALTER TABLE configuracion ADD COLUMN nav_config LONGTEXT DEFAULT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'configuracion' AND COLUMN_NAME = 'footer_config') THEN
        ALTER TABLE configuracion ADD COLUMN footer_config LONGTEXT DEFAULT NULL;
    END IF;

    -- 3. Tabla WEB_PAGINAS_V4
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'web_paginas_v4' AND COLUMN_NAME = 'is_homepage') THEN
        ALTER TABLE web_paginas_v4 ADD COLUMN is_homepage TINYINT(1) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'web_paginas_v4' AND COLUMN_NAME = 'seo_title') THEN
        ALTER TABLE web_paginas_v4 ADD COLUMN seo_title VARCHAR(255) DEFAULT NULL,
                                 ADD COLUMN seo_description TEXT DEFAULT NULL,
                                 ADD COLUMN seo_keywords VARCHAR(255) DEFAULT NULL;
    END IF;

    -- 4. Tabla CLIENTES
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clientes' AND COLUMN_NAME = 'es_nuevo') THEN
        ALTER TABLE clientes ADD COLUMN es_nuevo TINYINT(1) DEFAULT 1;
    END IF;

    -- 5. Tabla COTIZACIONES (Documentos)
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cotizaciones' AND COLUMN_NAME = 'pdf_path') THEN
        ALTER TABLE cotizaciones ADD COLUMN pdf_path VARCHAR(255) DEFAULT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cotizaciones' AND COLUMN_NAME = 'contrato_path') THEN
        ALTER TABLE cotizaciones ADD COLUMN contrato_path VARCHAR(255) DEFAULT NULL;
    END IF;

END //

DELIMITER ;

-- Ejecutar la migración
CALL ArchiMigrateV4();

-- Eliminar el procedimiento después de usarlo
DROP PROCEDURE IF EXISTS ArchiMigrateV4;

-- 5. Crear tabla de Mensajes si no existe
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mantenimiento de datos: Sincronizar logos si es necesario
UPDATE configuracion SET logo_cuadrado_path = logo_path WHERE logo_cuadrado_path IS NULL AND logo_path IS NOT NULL;
UPDATE configuracion SET es_activa = TRUE WHERE id = (SELECT id FROM (SELECT MIN(id) as id FROM configuracion) as t) AND (SELECT COUNT(*) FROM (SELECT id FROM configuracion WHERE es_activa = TRUE) as a) = 0;
