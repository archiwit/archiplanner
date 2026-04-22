-- ==============================================================================
-- ArchiPlanner V4 PROD - FUSIÓN TOTAL (Estructura + Datos Editoriales)
-- Propósito: Sincronizar perfectamente Local -> Hostinger sin pérdida de datos.
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- PARTE 1: ASEGURAR ESTRUCTURA (Columnas V4)
-- ------------------------------------------------------------------------------

DELIMITER //

DROP PROCEDURE IF EXISTS ArchiTotalSyncV4 //
CREATE PROCEDURE ArchiTotalSyncV4()
BEGIN
    -- 1. Gastos (Nuevos campos de estado)
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'gastos' AND COLUMN_NAME = 'estado') THEN
        ALTER TABLE gastos ADD COLUMN estado ENUM('pendiente', 'pagado') DEFAULT 'pendiente';
    END IF;
    
    -- 2. Configuración (Campos de Branding y V4)
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'configuracion' AND COLUMN_NAME = 'logo_cuadrado_path') THEN
        ALTER TABLE configuracion ADD COLUMN logo_cuadrado_path VARCHAR(255) DEFAULT NULL,
                                 ADD COLUMN logo_horizontal_path VARCHAR(255) DEFAULT NULL,
                                 ADD COLUMN color_primario VARCHAR(7) DEFAULT '#FF8484',
                                 ADD COLUMN nav_config LONGTEXT DEFAULT NULL,
                                 ADD COLUMN footer_config LONGTEXT DEFAULT NULL;
    END IF;

    -- 3. Páginas V4 (SEO y Homepage)
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'web_paginas_v4' AND COLUMN_NAME = 'is_homepage') THEN
        ALTER TABLE web_paginas_v4 ADD COLUMN is_homepage TINYINT(1) DEFAULT 0,
                                 ADD COLUMN seo_title VARCHAR(255) DEFAULT NULL,
                                 ADD COLUMN seo_description TEXT DEFAULT NULL,
                                 ADD COLUMN seo_keywords VARCHAR(255) DEFAULT NULL;
    END IF;

    -- 4. Clientes (Nuevos indicadores)
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clientes' AND COLUMN_NAME = 'es_nuevo') THEN
        ALTER TABLE clientes ADD COLUMN es_nuevo TINYINT(1) DEFAULT 1;
    END IF;

    -- 5. Cotizaciones (Documentos PDF)
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cotizaciones' AND COLUMN_NAME = 'pdf_path') THEN
        ALTER TABLE cotizaciones ADD COLUMN pdf_path VARCHAR(255) DEFAULT NULL,
                                 ADD COLUMN contrato_path VARCHAR(255) DEFAULT NULL;
    END IF;

END //

DELIMITER ;

-- Ejecutar la nivelación de estructura
CALL ArchiTotalSyncV4();
DROP PROCEDURE IF EXISTS ArchiTotalSyncV4;

-- ------------------------------------------------------------------------------
-- PARTE 2: CREACIÓN DE TABLAS FALTANTES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `web_mensajes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(255),
    `correo` VARCHAR(255),
    `telefono` VARCHAR(50),
    `asunto` VARCHAR(255),
    `mensaje` TEXT,
    `pagina_origen` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `leido` TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `web_paginas_v4` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(100) DEFAULT NULL,
  `is_visible` tinyint(1) DEFAULT 1,
  `estado` enum('borrador','publicado') DEFAULT 'borrador',
  `content` longtext DEFAULT NULL,
  `style_config` longtext DEFAULT NULL,
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `seo_keywords` varchar(255) DEFAULT NULL,
  `is_homepage` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- PARTE 3: DATOS - EDITORIAL Y CONFIGURACIÓN (REPLACE INTO para actualizar)
-- ------------------------------------------------------------------------------

-- Páginas V4 (Esto resuelve el 404 de inmediato)
REPLACE INTO `web_paginas_v4` (`id`, `nombre`, `slug`, `descripcion`, `created_at`, `created_by`, `is_visible`, `estado`, `content`, `style_config`, `seo_title`, `seo_description`, `seo_keywords`, `is_homepage`) VALUES 
(3, 'Bienvenido', 'bienvenido', '✨ ArchiPlanner: Wedding y Event Planner en Bucaramanga. Organizamos bodas, XV años y eventos únicos con elegancia. ¡Contáctanos: 3004760514!', '2026-04-10 21:48:17', 'Admin', 1, 'publicado', '[{"id":"row-1775866750658-90","type":"row","config":{"marginTop":"0","marginRight":"0","marginBottom":"0","marginLeft":"0","paddingTop":"0","paddingRight":"0","paddingBottom":"0","paddingLeft":"0"},"children":[{"id":"col-row-1775866750658-90-1","type":"col","span":12,"children":[{"id":"comp-1775868958290-29","type":"hero-modern","config":{"titulo":"Creamos Historias Inolvidables","subtitulo":"Diseño editorial y curaduría de eventos para almas sofisticadas\n","media_path":"/uploads/gallery/1775873108559-724916003.avif","buttonLabel":"Comenzar mi Historia","bgType":"image"}}],"config":{"marginTop":"0","marginRight":"0","marginBottom":"0","marginLeft":"0","paddingTop":"0","paddingRight":"0","paddingBottom":"0","paddingLeft":"0"}}]},{"id":"row-1775868879210","type":"row","config":{},"children":[{"id":"col-row-1775868879210-1","type":"col","span":12,"children":[{"id":"comp-1775868879210-681","type":"heading","config":{"content":"Grandes Hitos","fontSize":"56px","textColor":"#ffffff","textAlign":"center","fontFamily":"''Playfair Display'', serif","subtitle":"Principales","marginBottom":"50px"}},{"id":"comp-1775876310849-61","type":"query-grid-v4","config":{"source":"servicios","columns":3,"limit":3,"sectionFilter":"principales","cardStyle":{"style":"boxed","shape":"rounded","alignment":"left","layout":"vertical","showLink":true,"ctaAlignment":"center"},"mediaPreference":"only_image"}}],"config":{}}]},{"id":"row-1775876228920","type":"row","config":{},"children":[{"id":"col-row-1775876228920-1","type":"col","span":12,"children":[{"id":"comp-1776054026339-263","type":"heading","config":{"content":"Sociales y Familiares","fontSize":"48px","textColor":"#FFFFFF","textAlign":"center","fontWeight":"800","subtitle":"Momentos Íntimos","fontFamily":"''Playfair Display'', serif","paddingBottom":"","marginBottom":"50px"}},{"id":"comp-1775876228920-129","type":"query-grid-v4","config":{"content":"Elemento","source":"servicios","sectionFilter":"sociales","columns":3,"limit":6,"cardStyle":{"layout":"horizontal-left"}}}],"config":{}}]},{"id":"row-1776068175538-344","type":"row","config":{"isFullWidth":true,"bgType":"color","bgColor":"#2c2c2c","paddingTop":"0px","paddingBottom":"0px","paddingRight":"0px","paddingLeft":"0px","marginTop":"130px","marginBottom":"130px"},"children":[{"id":"col-row-1776068175538-344-1","type":"col","span":12,"children":[{"id":"comp-1776070104450-76","type":"PULSE","config":{"title":"El Pulse de cada Evento","tag":"VIVIMOS EL MÉTODO","closingPhrase":"Vivimos el pulse de cada evento...","paddingTop":"0px","paddingBottom":"0px","marginTop":"0px","marginRight":"0px","marginBottom":"0px","marginLeft":"0px","paddingRight":"0px","paddingLeft":"0px"}}],"config":{}}]},{"id":"row-1776059442031-712","type":"row","config":{"justifyContent":"center"},"children":[{"id":"col-row-1776059442031-712-1","type":"col","span":12,"children":[{"id":"comp-1776061399206-386","type":"cta-phone-v4","config":{"title":"¿Listo para elevar tu evento?","hook":"EMPIEZA AHORA","closure":"Diseñamos y planificamos cada detalle para que tú solo disfrutes.\nTu visión, nuestra magia.","buttonLabel":"Reserva tu fecha mágica","link":"https://wa.me/573004760514?text=Hola%2C%20quiero%20más%20información%20sobre%20tus%20servicios%20de%20bodas%20y%20eventos.","phoneVideo":"/uploads/gallery/1776062620216-262690801.mp4","bgColor":"#121212","accentColor":"#e87c7c","paddingTop":"0px","paddingBottom":"0px","actionType":"whatsapp","whatsappMessage":"Hola, vi tu servicio y me gustaría saber más. ¿Podemos cotizar y agendar una llamada?"}}],"config":{}}]},{"id":"row-1776055163575-490","type":"row","config":{"alignItems":"center","maxWidth":"100%","minHeight":"auto","paddingTop":"0px","paddingRight":"0px","paddingBottom":"0px","paddingLeft":"0px","isFullWidth":true,"marginTop":""},"children":[{"id":"col-row-1776055163575-490-1","type":"col","span":12,"children":[{"id":"comp-1776055537635-699","type":"testimonios","config":{"paddingTop":"0px","paddingBottom":"0px","paddingRight":"0px","paddingLeft":"0px"}}],"config":{"paddingTop":"0","paddingBottom":"0","paddingLeft":"0"}}]}]', '{"canvasBg":"#000000","canvasText":"#FFFFFF"}', 'Wedding Planner Bucaramanga | ArchiPlanner - Bodas y Eventos Únicos', '✨ ArchiPlanner: Wedding y Event Planner en Bucaramanga. Organizamos bodas, XV años y eventos únicos con elegancia. ¡Contáctanos: 3004760514!', NULL, 1);

-- Servicios Premium
REPLACE INTO `servicios` (`id`, `titulo`, `tag`, `icono_svg`, `descripcion`, `imagen`, `link`, `visible`, `orden`, `seccion`) VALUES 
(1, 'Bodas de Ensueño', 'Planificación', '', '<p>Planificación integral con un enfoque romántico y arquitectónico.</p>', '/uploads/services/serv-1775640392815-199546085.png', '/contacto', 1, 1, 'principales'),
(2, 'XV Años Espectaculares', 'Celebración', '', '<p>Celebramos tu esencia con estilo, tendencia y sofisticación.</p>', '/uploads/services/serv-1775640402680-606953320.png', '/contacto', 1, 2, 'principales'),
(3, 'Eventos Corporativos', 'Estrategia', '', '<p>Galas, lanzamientos y encuentros de alto impacto para tu marca.</p>', '/uploads/services/serv-1775640409856-820287403.png', '/contacto', 1, 3, 'principales');

-- Configuración Base
REPLACE INTO `configuracion` (`id`, `nombre_empresa`, `ceo`, `email_contacto`, `telefono`, `logo_cuadrado_path`, `color_primario`, `nav_config`, `footer_config`) VALUES 
(1, 'Archi Planner', 'Luis Archila', 'hola@archiplanner.com', '3004760514', '/uploads/config/logo-1775611225927-593968612.svg', '#FF8484', '[{"id":"1","label":"Inicio","path":"/","type":"link","children":[]},{"id":"2","label":"Servicios","path":"/servicios","type":"link","children":[]},{"id":"1776262226632","label":"Galeria","path":"/p/galeria","type":"link","children":[]},{"id":"4","label":"Nosotros","path":"/nosotros","type":"link","children":[]},{"id":"5","label":"Contacto","path":"/contacto","type":"cta","variant":"primary","children":[]}]', '{"columns":[{"id":"c1","type":"brand","title":"Sobre Nosotros","hook":"Curadores de momentos inolvidables."}]}');

-- testimonios
REPLACE INTO `testimonios` (`id`, `image`, `message`, `name`, `event_title`, `es_visible`) VALUES 
(1, '/uploads/testimonials/test-1775630554447-122689328.png', 'Cada detalle se sintió íntimo, refinado y perfectamente pensado.', 'Yuliana & Fabián', 'Boda editorial Internacional', 1),
(2, '/uploads/testimonials/test-1775630635749-213333467.png', 'Un quinceañera entre brillos y lujo, donde cada destello fue puro esplendor.', 'Sarita', 'Celebración de XV', 1);

-- ------------------------------------------------------------------------------
-- PARTE 4: DATOS OPERATIVOS (INSERT IGNORE para preservar lo actual del hosting)
-- ------------------------------------------------------------------------------

INSERT IGNORE INTO `usuarios` (`id`, `nombre`, `nick`, `clave`, `correo`, `rol`, `estado`) VALUES 
(1, 'Luis Archila', 'ArchiPlanner', '4888', 'archiplannerbga@gmail.com', 'admin', 1);

INSERT IGNORE INTO `clientes` (`id`, `nombre`, `apellido`, `nick`, `clave`, `correo`, `telefono`, `tipo_evento`, `estado`) VALUES 
(1, 'Silvia', 'Club Unión', '', '', 'silvia@g.c', '3173015354', 'Sociales', 'prospecto');

-- ------------------------------------------------------------------------------
-- FINALIZACIÓN
-- ------------------------------------------------------------------------------

-- Garantizar que la página 'bienvenido' sea la Home
UPDATE web_paginas_v4 SET is_homepage = 0;
UPDATE web_paginas_v4 SET is_homepage = 1 WHERE slug = 'bienvenido';

-- Sincronizar es_activa en configuracion
UPDATE configuracion SET es_activa = 0;
UPDATE configuracion SET es_activa = 1 WHERE id = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- FUSIÓN COMPLETADA. Refresca tu sitio web ahora.
-- ==============================================================================
