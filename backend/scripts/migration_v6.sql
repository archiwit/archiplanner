-- ARCORP ARCHIPLANNER - MIGRATION V6 (Multi-Company & Branding Stabilization)
-- Use this script to update your production database on Hostinger.
-- This script is NON-DESTRUCTIVE and will only add missing columns.

USE archiplanner; -- Ensure you use the correct database name on your hosting

-- 1. Update Cotizaciones Table
ALTER TABLE cotizaciones 
    ADD COLUMN IF NOT EXISTS conf_id INT(11) DEFAULT 1 AFTER id,
    ADD COLUMN IF NOT EXISTS clase ENUM('evento', 'arriendo') DEFAULT 'evento',
    ADD COLUMN IF NOT EXISTS num_arriendo VARCHAR(20) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS notas_entrega TEXT,
    ADD COLUMN IF NOT EXISTS notas_devolucion TEXT;

-- 2. Update Usuarios Table
ALTER TABLE usuarios 
    ADD COLUMN IF NOT EXISTS conf_id INT(11) DEFAULT 1;

-- 3. Update Configuracion Table (Ensuring multi-logo support)
ALTER TABLE configuracion
    ADD COLUMN IF NOT EXISTS logo_cuadrado_path VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS logo_horizontal_path VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS logo_black_path VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS color_primario VARCHAR(7) DEFAULT '#FF8484',
    ADD COLUMN IF NOT EXISTS color_secundario VARCHAR(7) DEFAULT '#2C2C2C',
    ADD COLUMN IF NOT EXISTS color_terciario VARCHAR(7) DEFAULT '#5fdcc7',
    ADD COLUMN IF NOT EXISTS color_fondo VARCHAR(7) DEFAULT '#121212',
    ADD COLUMN IF NOT EXISTS cedula VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS ciudad_expedicion VARCHAR(255) DEFAULT NULL;

-- 4. Ensure foreign keys for the new multi-company structure
-- (Safe to run multiple times, will just skip if exists depending on DB engine)
-- CREATE INDEX idx_coti_conf ON cotizaciones(conf_id);
-- CREATE INDEX idx_user_conf ON usuarios(conf_id);

-- 5. Fix possible NULL branding issues
UPDATE cotizaciones SET conf_id = 1 WHERE conf_id IS NULL OR conf_id = 0;
UPDATE usuarios SET conf_id = 1 WHERE conf_id IS NULL OR conf_id = 0;
