-- Migration: Permissions System and Company Expenses
USE archiplanner;

-- 1. Add permissions column to users table
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS permisos JSON DEFAULT NULL;

-- 2. Create Company Expenses table
CREATE TABLE IF NOT EXISTS gastos_empresa (
    id INT PRIMARY KEY AUTO_INCREMENT,
    concepto VARCHAR(255) NOT NULL,
    categoria ENUM('servicios', 'arriendo', 'sueldos', 'marketing', 'otros') NOT NULL DEFAULT 'otros',
    monto DECIMAL(12,2) NOT NULL DEFAULT 0,
    fecha DATE NOT NULL,
    comprobante_path VARCHAR(255) DEFAULT NULL,
    estado ENUM('pendiente', 'pagado') DEFAULT 'pagado',
    notas TEXT,
    u_id INT, -- Created by
    fcrea TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (u_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 3. Update Super Admins to have full permissions
-- Permissions keys: cotizaciones, arriendos, planeador, calendario, inventario, proveedores, plantillas, usuarios, empresa, gastos_empresa, web_editor
UPDATE usuarios 
SET permisos = '["cotizaciones", "arriendos", "planeador", "calendario", "inventario", "proveedores", "plantillas", "usuarios", "empresa", "gastos_empresa", "web_editor"]'
WHERE rol = 'admin';

-- Update existing coordinator/asesor roles with basic permissions
UPDATE usuarios
SET permisos = '["cotizaciones", "arriendos", "planeador", "calendario", "inventario", "proveedores"]'
WHERE rol IN ('coordinador', 'asesor', 'asesor_arriendos') AND permisos IS NULL;
