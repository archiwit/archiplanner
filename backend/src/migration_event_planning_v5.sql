-- ArchiPlanner V5.0 - Migración a Planeación Orientada a Eventos (Cotizaciones)
-- Este script vincula las actividades y módulos de planeación a una Cotización específica.

USE archiplanner;

-- 1. Actualizar tabla de Actividades
ALTER TABLE actividades ADD COLUMN cot_id INT NULL AFTER cli_id;
ALTER TABLE actividades ADD FOREIGN KEY (cot_id) REFERENCES cotizaciones(id) ON DELETE SET NULL;

-- 2. Actualizar módulos de planeación
ALTER TABLE event_itinerarios ADD COLUMN cot_id INT NULL AFTER cli_id;
ALTER TABLE event_itinerarios ADD FOREIGN KEY (cot_id) REFERENCES cotizaciones(id) ON DELETE CASCADE;

ALTER TABLE event_inspiraciones ADD COLUMN cot_id INT NULL AFTER cli_id;
ALTER TABLE event_inspiraciones ADD FOREIGN KEY (cot_id) REFERENCES cotizaciones(id) ON DELETE CASCADE;

ALTER TABLE event_puntos_clave ADD COLUMN cot_id INT NULL AFTER cli_id;
ALTER TABLE event_puntos_clave ADD FOREIGN KEY (cot_id) REFERENCES cotizaciones(id) ON DELETE CASCADE;

-- 3. Migración de datos existentes (Asociar a la última cotización de cada cliente)
-- Actualizar actividades
UPDATE actividades a
SET cot_id = (SELECT id FROM cotizaciones c WHERE c.cli_id = a.cli_id ORDER BY c.id DESC LIMIT 1)
WHERE a.cli_id IS NOT NULL AND a.cot_id IS NULL;

-- Actualizar itinerarios
UPDATE event_itinerarios ei
SET cot_id = (SELECT id FROM cotizaciones c WHERE c.cli_id = ei.cli_id ORDER BY c.id DESC LIMIT 1)
WHERE ei.cli_id IS NOT NULL AND ei.cot_id IS NULL;

-- Actualizar inspiraciones
UPDATE event_inspiraciones ein
SET cot_id = (SELECT id FROM cotizaciones c WHERE c.cli_id = ein.cli_id ORDER BY c.id DESC LIMIT 1)
WHERE ein.cli_id IS NOT NULL AND ein.cot_id IS NULL;

-- Actualizar puntos clave
UPDATE event_puntos_clave ep
SET cot_id = (SELECT id FROM cotizaciones c WHERE c.cli_id = ep.cli_id ORDER BY c.id DESC LIMIT 1)
WHERE ep.cli_id IS NOT NULL AND ep.cot_id IS NULL;
