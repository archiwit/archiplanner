-- ArchiPlanner V5.0 - Historial de Interacción y Seguimiento de Eventos
-- Este script expande la tabla de seguimiento para soportar tipos de eventos y metadatos.

USE archiplanner;

-- Asegurar que la tabla existe (por si acaso no fue creada en versiones previas)
CREATE TABLE IF NOT EXISTS cotizaciones_seguimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cot_id INT NOT NULL,
    u_id INT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'comentario', -- 'comentario', 'envio', 'creacion', 'cambio_estado'
    comentario TEXT,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cot_id) REFERENCES cotizaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (u_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Añadir columna 'tipo' si no existe
SET @dropdown_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'cotizaciones_seguimiento' AND COLUMN_NAME = 'tipo' AND TABLE_SCHEMA = 'archiplanner');
SET @query = IF(@dropdown_exists = 0, 'ALTER TABLE cotizaciones_seguimiento ADD COLUMN tipo VARCHAR(50) DEFAULT "comentario" AFTER u_id', 'SELECT "Column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar registros antiguos
UPDATE cotizaciones_seguimiento SET tipo = 'cambio_estado' WHERE estado_nuevo IS NOT NULL AND tipo = 'comentario';
UPDATE cotizaciones_seguimiento SET tipo = 'creacion' WHERE comentario LIKE '%creada%' AND tipo = 'comentario';
