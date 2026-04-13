USE archiplanner;

-- Update articulos
ALTER TABLE articulos ADD COLUMN IF NOT EXISTS costo_u DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER precio_u;

-- Update cotizaciones
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS conf_id INT DEFAULT 1 FIRST;
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS num_adultos INT DEFAULT 0 AFTER fevent;
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS num_ninos INT DEFAULT 0 AFTER num_adultos;
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS hora_inicio TIME AFTER num_ninos;
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS hora_fin TIME AFTER hora_inicio;
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS lugar VARCHAR(255) AFTER hora_fin;
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS loc_id INT AFTER lugar;
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS tematica VARCHAR(255) AFTER loc_id;
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS tipo_evento VARCHAR(100) AFTER tematica;
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS paleta_colores TEXT AFTER tipo_evento;
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS aplica_iva BOOLEAN DEFAULT FALSE AFTER iva;
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS total_tipo ENUM('calculado', 'manual') DEFAULT 'calculado' AFTER total;
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS monto_final DECIMAL(12,2) DEFAULT 0 AFTER total_tipo;

-- Add Missing Foreign Keys to cotizaciones (if not present)
-- We'll just try to add them, errors might happen if they exist but that's okay for now
ALTER TABLE cotizaciones ADD CONSTRAINT fk_coti_conf FOREIGN KEY (conf_id) REFERENCES configuracion(id) ON DELETE SET NULL;
ALTER TABLE cotizaciones ADD CONSTRAINT fk_coti_loc FOREIGN KEY (loc_id) REFERENCES locaciones(id) ON DELETE SET NULL;

-- Update cotizacion_detalles
-- Drop old foreign key if it's too restrictive
-- ALTER TABLE cotizacion_detalles DROP FOREIGN KEY cotizacion_detalles_ibfk_2; -- Might need careful check
ALTER TABLE cotizacion_detalles MODIFY COLUMN art_id INT NULL;
ALTER TABLE cotizacion_detalles ADD COLUMN IF NOT EXISTS loc_id INT AFTER art_id;
ALTER TABLE cotizacion_detalles ADD COLUMN IF NOT EXISTS costo_u DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER cantidad;
ALTER TABLE cotizacion_detalles ADD COLUMN IF NOT EXISTS notas TEXT AFTER subtotal;
ALTER TABLE cotizacion_detalles ADD CONSTRAINT fk_det_loc FOREIGN KEY (loc_id) REFERENCES locaciones(id) ON DELETE SET NULL;

-- New Tables
CREATE TABLE IF NOT EXISTS plantillas (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    nombre      VARCHAR(100) NOT NULL,
    tipo_evento VARCHAR(100),
    fcrea       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plantilla_detalles (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    pla_id      INT NOT NULL,
    art_id      INT,
    loc_id      INT,
    cantidad    DECIMAL(10,2) NOT NULL DEFAULT 1,
    por_persona BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (pla_id) REFERENCES plantillas(id) ON DELETE CASCADE,
    FOREIGN KEY (art_id) REFERENCES articulos(id) ON DELETE SET NULL,
    FOREIGN KEY (loc_id) REFERENCES locaciones(id) ON DELETE SET NULL
);
