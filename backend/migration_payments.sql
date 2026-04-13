-- Sincronización de Base de Datos para ArchiPlanner V2

-- 1. Añadir estado 'contratada' a las cotizaciones
ALTER TABLE `cotizaciones` 
MODIFY COLUMN `estado` ENUM('borrador', 'enviada', 'aprobada', 'rechazada', 'facturada', 'contratada') NOT NULL DEFAULT 'borrador';

-- 2. Asegurar que la tabla pagos tenga lo necesario (si no existen las columnas)
-- Nota: IF NOT EXISTS no funciona directo en ALTER de MySQL < 8.0.19, pero el script migrate.js manejará los errores.

-- 3. Añadir columna ubicacion a cotizaciones si no existe (el usuario tiene 'lugar', pero usaremos lugar o añadiremos ubicacion para mayor claridad)
ALTER TABLE `cotizaciones` ADD COLUMN IF NOT EXISTS `ubicacion` VARCHAR(255) AFTER `tematica`;
