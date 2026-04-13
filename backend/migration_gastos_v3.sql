-- Migration: Enhanced Gastos Table v3
USE archiplanner;

-- 1. Create table if not exists (insurance)
CREATE TABLE IF NOT EXISTS gastos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cot_id INT NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    fgasto TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pagado_a VARCHAR(200),
    responsable VARCHAR(200),
    metodo ENUM('efectivo', 'transferencia', 'tarjeta', 'consignacion', 'otro') DEFAULT 'efectivo',
    comprobante_path VARCHAR(255),
    u_id INT,
    FOREIGN KEY (cot_id) REFERENCES cotizaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (u_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 2. Add 'estado' column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'gastos' AND COLUMN_NAME = 'estado') THEN
    ALTER TABLE gastos ADD COLUMN estado ENUM('pendiente', 'pagado') DEFAULT 'pendiente';
END IF;

-- 3. Add 'item_id' column to link with quotation_detalles
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'gastos' AND COLUMN_NAME = 'item_id') THEN
    ALTER TABLE gastos ADD COLUMN item_id INT NULL;
END IF;
