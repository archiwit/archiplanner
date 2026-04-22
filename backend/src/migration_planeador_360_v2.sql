-- Migración: Planeador 360 v2.0
-- Este script crea las tablas necesarias para la gestión de invitados y el diseño de la distribución espacial.

-- 1. Tabla de Invitados
CREATE TABLE IF NOT EXISTS event_invitados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cot_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    celular VARCHAR(50),
    grupo ENUM('Novio', 'Novia', 'Padre', 'Madre', 'Quinceañera', 'Otro') DEFAULT 'Otro',
    categoria ENUM('Familiar', 'Amigo', 'Conocido', 'Protocolo') DEFAULT 'Familiar',
    adultos INT DEFAULT 1,
    niños INT DEFAULT 0,
    estado ENUM('Pendiente', 'Confirmado', 'Cancelado') DEFAULT 'Pendiente',
    mesa_id INT DEFAULT NULL,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cot_id) REFERENCES cotizaciones(id) ON DELETE CASCADE
);

-- 2. Tabla de Layouts (Espacios del Evento)
CREATE TABLE IF NOT EXISTS event_layouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cot_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL, -- Ej: Salón Principal, Jardín
    ancho_metros DECIMAL(10,2) DEFAULT NULL,
    largo_metros DECIMAL(10,2) DEFAULT NULL,
    fondo_img VARCHAR(255), -- Ruta del croquis subido
    escala_px_metro INT DEFAULT 50, -- Cuántos px representan 1 metro
    is_metric BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cot_id) REFERENCES cotizaciones(id) ON DELETE CASCADE
);

-- 3. Tabla de Elementos del Layout
CREATE TABLE IF NOT EXISTS event_layout_elementos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    layout_id INT NOT NULL,
    tipo VARCHAR(100) NOT NULL, -- mesa_redonda, pista_baile, etc.
    x INT DEFAULT 0,
    y INT DEFAULT 0,
    rotacion INT DEFAULT 0,
    puestos INT DEFAULT 0, -- Para mesas
    label VARCHAR(255),
    config_json JSON, -- Estilos extra, colores, etc.
    FOREIGN KEY (layout_id) REFERENCES event_layouts(id) ON DELETE CASCADE
);
