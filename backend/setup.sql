-- ==========================================================
-- ESTRUCTURA DE BASE DE DATOS UNIFICADA - ARCHIPLANNER V2
-- Estilo: Onyx & Rose
-- ==========================================================

CREATE DATABASE IF NOT EXISTS archiplanner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE archiplanner;

-- 1. CONFIGURACIÓN GENERAL (Datos Maestros del Sitio)
-- Esta tabla alimenta el Navbar, Footer y Contacto dinámicamente.
CREATE TABLE IF NOT EXISTS configuracion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre_empresa VARCHAR(100) DEFAULT 'Archi Planner',
    email_contacto VARCHAR(100) DEFAULT 'archiplannerbga@gmail.com',
    telefono VARCHAR(20) DEFAULT '573004760514',
    city VARCHAR(100) DEFAULT 'Bucaramanga, Colombia',
    ig_url VARCHAR(255) DEFAULT 'https://instagram.com/archi.planner/',
    fb_url VARCHAR(255) DEFAULT 'https://facebook.com/archiplanner.event',
    pn_url VARCHAR(255) DEFAULT 'https://pinterest.com',
    logo_path VARCHAR(255) DEFAULT NULL,
    u_fmod TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar configuración inicial (Si no existe)
INSERT INTO configuracion (nombre_empresa, email_contacto, telefono, city) 
SELECT 'Archi Planner', 'archiplannerbga@gmail.com', '573004760514', 'Bucaramanga, Colombia'
WHERE NOT EXISTS (SELECT 1 FROM configuracion);

-- 2. USUARIOS (Administradores/Empleados)
CREATE TABLE IF NOT EXISTS usuarios (
    id        INT PRIMARY KEY AUTO_INCREMENT,
    conf_id   INT DEFAULT 1,
    nombre    VARCHAR(100) NOT NULL,
    nick      VARCHAR(255) UNIQUE NOT NULL,
    clave     VARCHAR(255) NOT NULL,
    correo    VARCHAR(100) UNIQUE NOT NULL,
    telefono  VARCHAR(20),
    direccion TEXT,
    rol       ENUM('admin', 'coordinador', 'asesor', 'proveedor') DEFAULT 'admin',
    foto      VARCHAR(255) DEFAULT NULL,
    estado    BOOLEAN DEFAULT TRUE,
    u_fcrea   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    u_ultima_sesion TIMESTAMP NULL,
    FOREIGN KEY (conf_id) REFERENCES configuracion(id) ON DELETE SET NULL
);

-- Usuario admin por defecto (ArchiPlanner / 4888)
INSERT INTO usuarios (nombre, nick, clave, correo, rol)
SELECT 'Luis Archila', 'ArchiPlanner', '4888', 'archiluis48@gmail.com', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE nick = 'ArchiPlanner');

-- 3. PROVEEDORES
CREATE TABLE IF NOT EXISTS proveedores (
    id        INT PRIMARY KEY AUTO_INCREMENT,
    nombre    VARCHAR(100) NOT NULL,
    contacto  VARCHAR(100),
    telefono  VARCHAR(20),
    correo    VARCHAR(100),
    servicios JSON, -- ["decoracion", "salon", "catering", etc]
    direccion TEXT,
    califica  DECIMAL(2,1) DEFAULT 0,
    estado    BOOLEAN DEFAULT TRUE,
    fcrea     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ARTÍCULOS (Inventario / Mobiliario / Servicios)
CREATE TABLE IF NOT EXISTS articulos (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    nombre     VARCHAR(150) NOT NULL,
    nota       TEXT,
    categoria  ENUM('menaje', 'salon', 'entretenimiento', 'catering', 'personal', 'decoracion', 'otros') NOT NULL,
    precio_u   DECIMAL(10,2) NOT NULL DEFAULT 0,
    costo_u    DECIMAL(10,2) NOT NULL DEFAULT 0,
    uni_medida ENUM('unidad', 'hora', 'dia', 'evento') DEFAULT 'unidad',
    foto       VARCHAR(255) DEFAULT NULL,
    pro_id     INT,
    estado     BOOLEAN DEFAULT TRUE,
    fcrea      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pro_id) REFERENCES proveedores(id) ON DELETE SET NULL
);

-- 5. CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    conf_id      INT DEFAULT 1,
    nombre       VARCHAR(100) NOT NULL,
    apellido     VARCHAR(100) NOT NULL DEFAULT '',
    nick         VARCHAR(255) DEFAULT '',
    clave        VARCHAR(255) DEFAULT '',
    correo       VARCHAR(100),
    telefono     VARCHAR(20),
    documento    VARCHAR(20),
    nacimiento   DATE,
    direccion    TEXT,
    cedorigen    VARCHAR(50) DEFAULT 'Bucaramanga',
    presupuesto  DECIMAL(12,2) DEFAULT 0,
    tipo_evento  ENUM('Bodas Catolica', 'Bodas Cristiana', 'Bodas Simbolica', 'Bodas Civil', 'Quince', 'Corporativos', 'Cumpleaños', 'Aniversario', 'Sociales') DEFAULT 'Sociales',
    fevento      DATE,
    estado       ENUM('prospecto', 'contactado', 'propuesta', 'contratado', 'completado', 'cancelado') DEFAULT 'prospecto',
    contactar    DATE,
    ultimocontac DATE,
    notas        TEXT,
    foto         VARCHAR(255) DEFAULT NULL,
    u_id         INT,
    fcrea        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conf_id) REFERENCES configuracion(id) ON DELETE SET NULL,
    FOREIGN KEY (u_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 6. COTIZACIONES
CREATE TABLE IF NOT EXISTS cotizaciones (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    conf_id    INT DEFAULT 1,
    num        VARCHAR(20) UNIQUE NOT NULL,
    cli_id     INT NOT NULL,
    u_id       INT NOT NULL,
    fcoti      DATE NOT NULL,
    fevent     DATE,
    num_adultos INT DEFAULT 0,
    num_ninos   INT DEFAULT 0,
    hora_inicio TIME,
    hora_fin    TIME,
    lugar       VARCHAR(255),
    loc_id      INT,
    tematica    VARCHAR(255),
    tipo_evento VARCHAR(100),
    paleta_colores TEXT,
    subt       DECIMAL(12,2) DEFAULT 0,
    iva        DECIMAL(12,2) DEFAULT 0,
    aplica_iva BOOLEAN DEFAULT FALSE,
    total      DECIMAL(12,2) DEFAULT 0,
    total_tipo ENUM('calculado', 'manual') DEFAULT 'calculado',
    monto_final DECIMAL(12,2) DEFAULT 0,
    estado     ENUM('borrador', 'enviada', 'aprobada', 'rechazada', 'facturada') DEFAULT 'borrador',
    notas      TEXT,
    fcrea      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conf_id) REFERENCES configuracion(id) ON DELETE SET NULL,
    FOREIGN KEY (cli_id)  REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (u_id)    REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (loc_id)  REFERENCES locaciones(id) ON DELETE SET NULL
);

-- 7. DETALLES COTIZACIÓN
CREATE TABLE IF NOT EXISTS cotizacion_detalles (
    id        INT PRIMARY KEY AUTO_INCREMENT,
    cot_id    INT NOT NULL,
    art_id    INT,
    loc_id    INT,
    cantidad  DECIMAL(10,2) NOT NULL DEFAULT 1,
    costo_u   DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_u  DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal  DECIMAL(12,2) NOT NULL DEFAULT 0,
    notas     TEXT,
    FOREIGN KEY (cot_id) REFERENCES cotizaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (art_id) REFERENCES articulos(id) ON DELETE SET NULL,
    FOREIGN KEY (loc_id) REFERENCES locaciones(id) ON DELETE SET NULL
);

-- 7.1 PLANTILLAS DE COTIZACIÓN
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

-- 8. LOCACIONES
CREATE TABLE IF NOT EXISTS locaciones (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    nombre      VARCHAR(100) NOT NULL,
    direccion   TEXT,
    capacidad   INT,
    tipo        ENUM('salon', 'finca', 'hotel', 'restaurante', 'exterior') NOT NULL,
    foto        VARCHAR(255) DEFAULT NULL,
    pro_id      INT,
    precio      DECIMAL(12,2),
    disponible  JSON,
    estado      BOOLEAN DEFAULT TRUE,
    fcrea       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pro_id) REFERENCES proveedores(id) ON DELETE SET NULL
);

-- 9. PAGOS
CREATE TABLE IF NOT EXISTS pagos (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    cot_id       INT NOT NULL,
    n_factura    VARCHAR(50),
    monto        DECIMAL(12,2) NOT NULL,
    fpago        DATE NOT NULL,
    metodo       ENUM('efectivo', 'transferencia', 'tarjeta', 'consignacion') NOT NULL,
    foto_comprobante VARCHAR(255) DEFAULT NULL,
    estado       ENUM('pendiente', 'completado', 'anulado') DEFAULT 'pendiente',
    referencia   VARCHAR(100),
    u_id         INT,
    fcreacion    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cot_id) REFERENCES cotizaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (u_id)   REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 10. ALERTAS
CREATE TABLE IF NOT EXISTS alertas (
    id        INT PRIMARY KEY AUTO_INCREMENT,
    titulo    VARCHAR(150) NOT NULL,
    mensaje   TEXT,
    tipo      ENUM('recordatorio', 'pago_vencido', 'evento_proximo', 'stock_bajo', 'nuevo_cliente') NOT NULL,
    relacionada_a INT,
    tabla_relacionada VARCHAR(30),
    fecha_programada DATE,
    leida     BOOLEAN DEFAULT FALSE,
    u_id      INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (u_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_clientes_estado ON clientes(estado);
CREATE INDEX idx_clientes_fecha ON clientes(fevento);
CREATE INDEX idx_cotizaciones_estado ON cotizaciones(estado);
CREATE INDEX idx_cotizaciones_fecha ON cotizaciones(fcoti);
CREATE INDEX idx_pagos_estado ON pagos(estado);
CREATE INDEX idx_alertas_fecha ON alertas(fecha_programada);

-- Datos de ejemplo
INSERT INTO proveedores (nombre, contacto, servicios) VALUES 
('Salones del Valle', 'Carlos', '["salon"]'),
('DJ Master Beats', 'Andrea', '["dj"]'),
('Fotos Épicas', 'Juan', '["fotografia"]');

INSERT INTO articulos (nombre, categoria, precio_u, pro_id) VALUES 
('Decoración básica boda', 'decoracion', 1500000, 1),
('DJ 6 horas', 'dj', 1200000, 2),
('Fotógrafo 8 horas', 'fotografia', 2500000, 3);
