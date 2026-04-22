-- ArchiPlanner V4 - Módulo de Calendario y Cronograma
-- Crea la tabla de actividades para agendar citas, visitas y eventos.

CREATE TABLE IF NOT EXISTS actividades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo ENUM('evento', 'cita', 'visita', 'reunion', 'otro') DEFAULT 'otro',
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME,
    ubicacion VARCHAR(255),
    cli_id INT NULL, -- Relación opcional con un cliente específico
    u_id INT NULL,   -- Usuario que creó la actividad (Admin/Planner)
    conf_id INT DEFAULT 1,
    estado ENUM('programado', 'completado', 'cancelado') DEFAULT 'programado',
    all_day BOOLEAN DEFAULT FALSE,
    color VARCHAR(20) DEFAULT '#B76E79',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cli_id) REFERENCES clientes(id) ON DELETE SET NULL,
    FOREIGN KEY (u_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
