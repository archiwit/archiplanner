USE archiplanner;
ALTER TABLE configuracion 
ADD COLUMN IF NOT EXISTS es_activa BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS logo_cuadrado_path VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS logo_horizontal_path VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS color_primario VARCHAR(7) DEFAULT '#FF8484',
ADD COLUMN IF NOT EXISTS color_secundario VARCHAR(7) DEFAULT '#2C2C2C',
ADD COLUMN IF NOT EXISTS color_terciario VARCHAR(7) DEFAULT '#5fdcc7',
ADD COLUMN IF NOT EXISTS color_fondo VARCHAR(7) DEFAULT '#121212';

-- Actualizar logo_cuadrado_path con el actual logo_path para no perder datos
UPDATE configuracion SET logo_cuadrado_path = logo_path WHERE logo_cuadrado_path IS NULL;

-- Marcar la primera empresa como activa por defecto
UPDATE configuracion SET es_activa = TRUE WHERE id = (SELECT id FROM (SELECT MIN(id) as id FROM configuracion) as t);
