-- ArchiPlanner V5.0 - Renovación de Planeación Colaborativa
-- Este script expande la estructura para itinerarios, moodboards y finanzas compartidas.

USE archiplanner;

-- 1. Tabla de Itinerarios (Protocolo Paso a Paso)
CREATE TABLE IF NOT EXISTS event_itinerarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cli_id INT NOT NULL,
    parent_id INT DEFAULT NULL, -- Para anidación (ej: Protocolo > Entrada)
    titulo VARCHAR(255) NOT NULL,
    responsable VARCHAR(150),
    descripcion TEXT,
    icono VARCHAR(100) DEFAULT 'Clock', -- Referencia a icono Lucide
    foto_path VARCHAR(255) DEFAULT NULL,
    hora TIME,
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cli_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES event_itinerarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabla de Inspiraciones (Inspire Board / Moodboard)
CREATE TABLE IF NOT EXISTS event_inspiraciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cli_id INT NOT NULL,
    foto_path VARCHAR(255) NOT NULL,
    titulo VARCHAR(255),
    categoria VARCHAR(100) DEFAULT 'General',
    subido_por ENUM('admin', 'cliente') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cli_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabla de Puntos Clave (Planeación Compartida)
CREATE TABLE IF NOT EXISTS event_puntos_clave (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cli_id INT NOT NULL,
    categoria VARCHAR(100) DEFAULT 'Protocolo', -- ej: Música, Baile, Ritual
    titulo VARCHAR(255) NOT NULL,
    valor TEXT, -- ej: Nombre de la canción o detalle
    nota TEXT,
    completado BOOLEAN DEFAULT FALSE,
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cli_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabla para Galería de Actividades (Reuniones)
CREATE TABLE IF NOT EXISTS actividad_fotos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    act_id INT NOT NULL,
    foto_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (act_id) REFERENCES actividades(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Extensión de Actividades (Resumen)
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS resumen TEXT AFTER descripcion;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- 6. Índices para rendimiento
CREATE INDEX idx_itinerario_cli ON event_itinerarios(cli_id);
CREATE INDEX idx_inspiracion_cli ON event_inspiraciones(cli_id);
CREATE INDEX idx_puntos_cli ON event_puntos_clave(cli_id);
