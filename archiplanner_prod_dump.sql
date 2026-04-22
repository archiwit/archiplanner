-- ArchiPlanner AG - Exportación para Hostinger
-- Generado el: 16/4/2026, 11:42:25 a. m.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `alertas`;
CREATE TABLE `alertas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) NOT NULL,
  `mensaje` text DEFAULT NULL,
  `tipo` enum('recordatorio','pago_vencido','evento_proximo','stock_bajo','nuevo_cliente') NOT NULL,
  `relacionada_a` int(11) DEFAULT NULL,
  `tabla_relacionada` varchar(30) DEFAULT NULL,
  `fecha_programada` date DEFAULT NULL,
  `leida` tinyint(1) DEFAULT 0,
  `u_id` int(11) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `u_id` (`u_id`),
  KEY `idx_alertas_fecha` (`fecha_programada`),
  CONSTRAINT `alertas_ibfk_1` FOREIGN KEY (`u_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `articulos`;
CREATE TABLE `articulos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `nota` text DEFAULT NULL,
  `categoria` varchar(50) NOT NULL,
  `precio_u` decimal(10,2) NOT NULL,
  `costo_u` decimal(10,2) NOT NULL DEFAULT 0.00,
  `uni_medida` enum('unidad','hora','dia','evento') DEFAULT 'unidad',
  `foto` varchar(255) DEFAULT NULL COMMENT 'Foto del artículo/servicio',
  `pro_id` int(11) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1,
  `fcrea` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `pro_id` (`pro_id`),
  CONSTRAINT `articulos_ibfk_1` FOREIGN KEY (`pro_id`) REFERENCES `proveedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `articulos` (`id`, `nombre`, `nota`, `categoria`, `precio_u`, `costo_u`, `uni_medida`, `foto`, `pro_id`, `estado`, `fcrea`) VALUES 
(4, 'Mesas (R-8P)', '', 'menaje', '12000.00', '8000.00', 'unidad', NULL, NULL, 1, '2026-04-05 14:58:19'),
(5, 'Mesas (R-10P)', '', 'menaje', '12000.00', '8000.00', 'unidad', NULL, 4, 1, '2026-04-05 14:59:01'),
(6, 'Sillas Chavari Gold', 'Dorada', 'menaje', '4500.00', '3000.00', 'unidad', '/uploads/items/item-1775411904994-344457137.jpg', NULL, 1, '2026-04-05 14:59:34'),
(7, 'Plato base (melanina)', '', 'menaje', '1500.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 15:00:23'),
(8, 'Plato base (cristal)', '', 'menaje', '4000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 15:00:55'),
(9, 'Servilletas', '', 'menaje', '1000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 15:01:13'),
(10, 'Copa de agua', '', 'menaje', '1000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 16:07:38'),
(11, 'Silla Crop', '', 'menaje', '8000.00', '6500.00', 'unidad', NULL, 5, 1, '2026-04-05 18:03:22'),
(12, 'Copa de agua (Barroca)', 'Dorada, Verdes, Azul, Tornazol, Rosa', 'menaje', '1500.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:04:04'),
(13, 'Mantel R(-8P)', '', 'menaje', '12000.00', '5000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:05:15'),
(14, 'Sobremantel (R-10)', '', 'menaje', '15000.00', '5000.00', 'unidad', NULL, 5, 1, '2026-04-05 18:05:47'),
(15, 'Sobremantel (R-10)', '', 'menaje', '15000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:05:59'),
(16, 'Plato lomplay (R)', '', 'menaje', '1000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:06:52'),
(17, 'Plato lomplay (C)', '', 'menaje', '1000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:07:28'),
(18, 'Plato ponque (R)', '', 'menaje', '800.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:07:52'),
(19, 'Plato ponque (C)', '', 'menaje', '800.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:08:10'),
(20, 'Vaso gaseosa', '', 'menaje', '5000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:08:19'),
(21, 'Vaso roquero', '', 'menaje', '5000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:08:29'),
(22, 'Copa champaña', '', 'menaje', '800.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:08:58'),
(23, 'Trio cubierto', '', 'menaje', '1000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:09:27'),
(24, 'Trio cubierto (Gold)', '', 'menaje', '2000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:09:40'),
(25, 'Charolas', '', 'menaje', '5000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:09:55'),
(26, 'Hielera con pinza', '', 'menaje', '5000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:10:09'),
(27, 'Jarra', '', 'menaje', '5000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:10:35'),
(28, 'Wedding Planner • Essential', '', 'personal', '1000000.00', '1000000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:11:20'),
(29, 'Event Planner • Essential', '', 'personal', '700000.00', '700000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:11:38'),
(30, 'Mesero', '', 'personal', '120000.00', '120000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:12:06'),
(31, 'Arte y Decoración, montaje y desmontaje', '', 'otros', '1000000.00', '10000000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:12:57'),
(32, 'Transporte', '', 'otros', '100000.00', '100000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:13:25'),
(33, 'Invitaciones Intecactivas', '', 'otros', '120000.00', '120000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:13:45'),
(34, 'Coreografia', '', 'otros', '450000.00', '450000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:14:30'),
(35, 'Sonido profesional • Essential', 'Dj + Animador + Luces', 'entretenimiento', '1200000.00', '750000.00', 'unidad', NULL, 2, 1, '2026-04-05 18:15:17'),
(36, 'Sonido profesional (Media)', '• Desplazamiento y montaje dentro del área metropolitana.
• Operario especializado durante todo el evento.
• Instalación completa o modular, según el diseño y la necesidad del cliente.

Características técnicas de la pantalla:
• Tipo: Pantalla LED Outdoor ON (ideal para exterior).
• Pitch: 3.9 mm, que garantiza excelente resolución y visibilidad incluso a distancia.
• Compatible con contenido 3D, permitiendo experiencias visuales más inmersivas.
• Dimensiones totales: 3 x 2 metros.
• Conformada por 12 módulos de 1 m x 50 cm.
• Incluye yinas elevadoras y estructura truss para un montaje seguro y profesional.

Jornada de servicio:
• El valor incluye hasta 8 horas de servicio continuo.

Hora adicional $60.000', 'entretenimiento', '1400000.00', '1100000.00', 'unidad', NULL, 2, 1, '2026-04-05 18:15:40'),
(37, 'Humo denso', '', 'entretenimiento', '300000.00', '200000.00', 'unidad', NULL, 2, 1, '2026-04-05 18:19:31'),
(38, 'Volcanes • Fuego frío', '', 'entretenimiento', '250000.00', '150000.00', 'unidad', NULL, 2, 1, '2026-04-05 18:20:29'),
(39, 'Pantalla LED', '', 'entretenimiento', '1400000.00', '900000.00', 'unidad', NULL, 2, 1, '2026-04-05 18:22:18'),
(40, 'Viñedo Charlotte', '', 'salon', '2500000.00', '2500000.00', 'unidad', NULL, 4, 1, '2026-04-05 18:28:21'),
(41, 'Eventos Maravillosos (Grande)', '', 'salon', '2500000.00', '2500000.00', 'unidad', NULL, 5, 1, '2026-04-05 18:28:54'),
(42, 'Eventos Maravillosos (Medio)', '', 'salon', '1500000.00', '1500000.00', 'unidad', NULL, 5, 1, '2026-04-05 18:29:22'),
(43, 'Eventos Maravillosos (Salón)', '', 'salon', '2500000.00', '2500000.00', 'unidad', NULL, 5, 1, '2026-04-05 18:29:37'),
(44, 'Finca el Ensueño', '', 'salon', '10000000.00', '10000000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:33:17'),
(45, 'Spot Principal', '', 'decoracion', '2000000.00', '800000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:38:57'),
(46, 'Spot Principal (Bosque encantado)', '', 'decoracion', '2500000.00', '1000000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:39:21'),
(47, 'Spot Principal • Cumple Essential', '1 Baking
1 Letrero let
2 Cilindros
Piso 4*4
Globos', 'decoracion', '800000.00', '450000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:41:10'),
(48, 'Spot de Bienvenida', '', 'decoracion', '500000.00', '150000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:41:58'),
(49, 'Tunel iluminado', '', 'decoracion', '500000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:42:12'),
(50, 'Luces de pueblo', '', 'decoracion', '500000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:42:25'),
(51, 'Menú (2 proteínas)', '', 'catering', '32000.00', '18000.00', 'unidad', NULL, 6, 1, '2026-04-05 18:48:02'),
(52, 'Menú (2 proteínas)', '', 'catering', '32000.00', '18000.00', 'unidad', NULL, 5, 1, '2026-04-05 18:48:22'),
(53, 'Menú (1 proteínas)', '', 'catering', '25000.00', '16000.00', 'unidad', NULL, 6, 1, '2026-04-05 18:48:52'),
(54, 'Menú (1 proteínas)', '', 'catering', '25000.00', '16000.00', 'unidad', NULL, 5, 1, '2026-04-05 18:49:17'),
(55, 'Pasabocas (Sal y Dulce)', '', 'catering', '2500.00', '1000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:49:44'),
(56, 'Cóctel bienvenida (100px)', '', 'catering', '300000.00', '50000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:50:54'),
(57, 'Cóctel bienvenida (150px)', '', 'catering', '450000.00', '80000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:51:17'),
(58, 'Barra de Cócteles', '', 'otros', '1800000.00', '950000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:51:39'),
(59, 'Ponqué', '', 'catering', '170000.00', '120000.00', 'unidad', NULL, 7, 1, '2026-04-05 18:53:33'),
(60, 'Camino al Altar', '', 'ceremonia', '500000.00', '150000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:54:46'),
(61, 'Techo Iluminado • Essential', '', 'decoracion', '1200000.00', '700000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:55:33'),
(62, 'Techo Iluminado • Lux', '', 'decoracion', '4500000.00', '3500000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:55:59'),
(63, 'Techo Iluminado • Onyx', '', 'decoracion', '2200000.00', '1500000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:56:31'),
(64, 'Centros de Mesa • Essential', '', 'decoracion', '70000.00', '30000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:57:00'),
(65, 'Centros de Mesa • Onyx', '', 'decoracion', '100000.00', '50000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:57:24'),
(66, 'Centros de Mesa • Lux', '', 'decoracion', '200000.00', '70000.00', 'unidad', NULL, NULL, 1, '2026-04-05 18:57:44'),
(67, 'Diván (Ceremonia)', '', 'ceremonia', '80000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 19:03:07'),
(68, 'Silla de novios', '', 'ceremonia', '50000.00', '20000.00', 'unidad', NULL, NULL, 1, '2026-04-05 19:03:26'),
(69, 'Alfombra (rustica)', '', 'ceremonia', '90000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 19:03:52'),
(70, 'Alfombra (elegante)', '', 'ceremonia', '90000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 19:04:23'),
(71, 'Arreglos del altar', '', 'ceremonia', '60000.00', '35000.00', 'unidad', NULL, NULL, 1, '2026-04-05 19:04:54'),
(72, 'Carro decorado', '', 'ceremonia', '30000.00', '15000.00', 'unidad', NULL, NULL, 1, '2026-04-05 19:05:35'),
(73, 'Buquet', '', 'ceremonia', '120000.00', '70000.00', 'unidad', NULL, NULL, 1, '2026-04-05 19:06:00'),
(74, 'Botonier', '', 'ceremonia', '20000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 19:06:12'),
(75, 'Maniflor', '', 'ceremonia', '15000.00', '5000.00', 'unidad', NULL, NULL, 1, '2026-04-05 19:06:28'),
(76, 'Lluvia de sobre', '', 'decoracion', '50000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 19:06:43'),
(77, '15 LED Gigante', '', 'decoracion', '80000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 19:07:09'),
(78, 'Letras iluminadas', '', 'decoracion', '50000.00', '20000.00', 'unidad', NULL, NULL, 1, '2026-04-05 19:07:25'),
(79, 'Mesa de novios • Decorada', '', 'decoracion', '160000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-05 19:07:49'),
(80, 'Mesa de ponque', '', 'decoracion', '120000.00', '40000.00', 'unidad', NULL, NULL, 1, '2026-04-05 19:08:26'),
(81, 'Fotografia', '', 'otros', '2000000.00', '1800000.00', 'unidad', NULL, 3, 1, '2026-04-05 19:10:04'),
(82, 'Agua, hielo y gaseosa (100pax)', '', 'catering', '300000.00', '150000.00', 'unidad', NULL, NULL, 1, '2026-04-06 02:01:09'),
(83, 'Agua, hielo y gaseosa (150pax)', '', 'catering', '450000.00', '150000.00', 'unidad', NULL, NULL, 1, '2026-04-06 02:01:30'),
(84, 'Deposito', '', 'otros', '300000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-06 21:34:08'),
(85, 'Humo denso y Fuego frío', 'Test description note', 'entretenimiento', '550000.00', '250000.00', 'unidad', NULL, NULL, 1, '2026-04-06 21:39:31'),
(86, 'Pólvora certificada', '', 'entretenimiento', '650000.00', '450000.00', 'unidad', NULL, NULL, 1, '2026-04-06 21:40:07'),
(87, 'Foto Cabina (1 Hr.)', 'Una (1) hora', 'entretenimiento', '450000.00', '320000.00', 'unidad', NULL, NULL, 1, '2026-04-06 21:40:45'),
(88, 'Foto Cabina (2 Hr.)', 'Dos (2) hora ', 'entretenimiento', '780000.00', '450000.00', 'unidad', NULL, NULL, 1, '2026-04-06 21:41:37'),
(89, 'Foto cabina Espejo', '+ Fotografías', 'entretenimiento', '1400000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-06 21:42:57'),
(90, 'Cámara 360° (1 Hr.)', 'Una (1) hora ', 'entretenimiento', '480000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-06 21:43:58'),
(91, 'Cámara 360° (2 Hr.)', 'Dos (2) hora', 'entretenimiento', '800000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-06 21:44:24'),
(92, 'Pantalla LED (4*2 mtrs.)', '4 x 2 mtrs.', 'entretenimiento', '1200000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-06 21:46:00'),
(93, 'Pantalla LED (4*4 mtrs.)', '4 x 4 mtrs.', 'entretenimiento', '1600000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-06 21:46:24'),
(94, 'Mantel R(-10P)', '', 'menaje', '12000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-07 12:39:43'),
(95, 'Mantel Rect', '', 'menaje', '12000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-07 12:40:20'),
(96, 'Mantel de Lujo', '', 'menaje', '15000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-07 12:41:19'),
(97, 'Carpeta', '', 'menaje', '12000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-07 12:49:06'),
(98, 'Transporte • Iglesia', '', 'otros', '80000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-07 13:38:42'),
(99, 'Servilleta • Yute', '', 'menaje', '2000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-07 13:53:04'),
(100, 'Plato base (rustico)', '', 'menaje', '4000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-07 13:53:35'),
(101, 'Plato base • Lux', 'Doble plato base', 'menaje', '6000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-07 13:56:35'),
(102, 'Wedding Planner • Onyx', '1 Planner Asistent', 'personal', '2000000.00', '2000000.00', 'unidad', NULL, NULL, 1, '2026-04-07 13:57:19'),
(103, 'Wedding Planner • Lux', '1 Planner Asistent
2 Protocolo', 'personal', '3000000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-07 13:59:18'),
(104, 'Event Planner • Onyx', '1 Planner Asistent', 'personal', '1200000.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-07 14:02:49'),
(105, 'Event Planner • Lux', '1 Planner Asistent
1 Protocolo', 'personal', '1999999.00', '0.00', 'unidad', NULL, NULL, 1, '2026-04-07 14:03:42'),
(106, 'Mantenimiento y Aseo', '', 'personal', '120000.00', '120000.00', 'unidad', NULL, NULL, 1, '2026-04-12 23:55:05'),
(107, 'Vigilancia y parqueadero', '', 'personal', '80000.00', '80000.00', 'unidad', NULL, NULL, 1, '2026-04-12 23:55:47'),
(108, 'Mesón (10P)', '', 'menaje', '12000.00', '8000.00', 'unidad', NULL, 4, 1, '2026-04-13 01:54:29');

DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `nick` varchar(255) NOT NULL,
  `clave` varchar(255) NOT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `documento` varchar(20) DEFAULT NULL,
  `ciudad_cedula` varchar(100) DEFAULT NULL,
  `nacimiento` date DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `cedorigen` varchar(50) DEFAULT 'Bucaramanga',
  `presupuesto` decimal(12,2) DEFAULT 0.00,
  `tipo_evento` enum('Bodas Catolica','Bodas Cristiana','Bodas Simbolica','Bodas Civil','Quince','Corporativos','Cumpleaños','Aniversario','Sociales') NOT NULL,
  `fevento` date DEFAULT NULL,
  `estado` enum('prospecto','contactado','propuesta','contratado','completado','cancelado') DEFAULT 'prospecto',
  `contactar` date DEFAULT NULL,
  `ultimocontac` date DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL COMMENT 'Foto del cliente o pareja',
  `u_id` int(11) DEFAULT NULL,
  `fcrea` timestamp NOT NULL DEFAULT current_timestamp(),
  `conf_id` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `u_id` (`u_id`),
  KEY `idx_clientes_estado` (`estado`),
  KEY `idx_clientes_fecha` (`fevento`),
  KEY `conf_id` (`conf_id`),
  CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`u_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `clientes_ibfk_2` FOREIGN KEY (`conf_id`) REFERENCES `configuracion` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `clientes` (`id`, `nombre`, `apellido`, `nick`, `clave`, `correo`, `telefono`, `documento`, `ciudad_cedula`, `nacimiento`, `direccion`, `cedorigen`, `presupuesto`, `tipo_evento`, `fevento`, `estado`, `contactar`, `ultimocontac`, `notas`, `foto`, `u_id`, `fcrea`, `conf_id`) VALUES 
(1, 'Silvia', 'Club Unión', '', '', 'silvia@g.c', '3173015354', '123456789', 'Bucaramanga', NULL, 'Casa en Buacaramanga', 'Bucaramanga', '0.00', 'Sociales', NULL, 'prospecto', NULL, NULL, '', NULL, 1, '2026-04-05 15:17:42', 2),
(2, 'Claudia', 'Gutierrez', '', '', 'Ortegabma@hotmail.com', '3104093759', '37512964', 'Bucaramanga', '1899-11-30 04:56:16', 'Cra 23 53-13', NULL, '0.00', 'Bodas Catolica', NULL, 'prospecto', NULL, NULL, '', NULL, 1, '2026-04-12 16:26:11', 2);

DROP TABLE IF EXISTS `configuracion`;
CREATE TABLE `configuracion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_empresa` varchar(100) DEFAULT 'ArchiPlanner',
  `ceo` varchar(100) DEFAULT '''Luis Archila''',
  `email_contacto` varchar(100) DEFAULT 'hola@archiplanner.com',
  `telefono` varchar(20) DEFAULT '+57 300 000 0000',
  `city` varchar(100) DEFAULT 'Bucaramanga, Colombia',
  `ig_url` varchar(255) DEFAULT 'https://instagram.com/archiplanner',
  `fb_url` varchar(255) DEFAULT 'https://facebook.com/archiplanner',
  `tt_url` varchar(255) DEFAULT '''https://tiktok.com''',
  `pn_url` varchar(255) DEFAULT 'https://pinterest.com/archiplanner',
  `li_url` varchar(255) DEFAULT '''https://linkedin.com''',
  `x_url` varchar(255) DEFAULT '''https://x.com''',
  `web_url` varchar(255) DEFAULT '''https://archiplanner.com''',
  `cedula` varchar(255) DEFAULT NULL,
  `ciudad_expedicion` varchar(255) DEFAULT NULL,
  `logo_path` varchar(255) DEFAULT NULL,
  `u_fmod` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `es_activa` tinyint(1) DEFAULT 0,
  `logo_cuadrado_path` varchar(255) DEFAULT NULL,
  `logo_horizontal_path` varchar(255) DEFAULT NULL,
  `color_primario` varchar(7) DEFAULT '#FF8484',
  `color_secundario` varchar(7) DEFAULT '#2C2C2C',
  `color_terciario` varchar(7) DEFAULT '#5fdcc7',
  `color_fondo` varchar(7) DEFAULT '#121212',
  `intro_cotizacion` text DEFAULT NULL,
  `politicas_cotizacion` text DEFAULT NULL,
  `nav_config` longtext DEFAULT NULL,
  `footer_config` longtext DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `configuracion` (`id`, `nombre_empresa`, `ceo`, `email_contacto`, `telefono`, `city`, `ig_url`, `fb_url`, `tt_url`, `pn_url`, `li_url`, `x_url`, `web_url`, `cedula`, `ciudad_expedicion`, `logo_path`, `u_fmod`, `es_activa`, `logo_cuadrado_path`, `logo_horizontal_path`, `color_primario`, `color_secundario`, `color_terciario`, `color_fondo`, `intro_cotizacion`, `politicas_cotizacion`, `nav_config`, `footer_config`) VALUES 
(1, 'Archi Planner', 'Luis Archila', 'hola@archiplanner.com', '3004760514', 'Crr 17F, 58A - 49. Bucaramanga, Colombia', 'https://instagram.com/archiplanner', 'https://www.facebook.com/archiplanner.event', 'https://www.tiktok.com/@archiplanner7', NULL, '', '', 'https://archiplanner.com', NULL, NULL, '/uploads/config/logo-1775439199037-726467284.svg', '2026-04-16 00:52:10', 1, '/uploads/config/logo-1775611225927-593968612.svg', '/uploads/config/logo-1775611225927-267139045.svg', '#FF8484', '#2C2C2C', '#5fdcc7', '#121212', NULL, NULL, '[{"id":"1","label":"Inicio","path":"/","type":"link","children":[]},{"id":"2","label":"Servicios","path":"/servicios","type":"link","children":[]},{"id":"1776262226632","label":"Galeria","path":"/p/galeria","type":"link","children":[]},{"id":"4","label":"Nosotros","path":"/nosotros","type":"link","children":[]},{"id":"5","label":"Contacto","path":"/contacto","type":"cta","variant":"primary","children":[]}]', '{"columns":[{"id":"c1","type":"brand","title":"Sobre Nosotros","hook":"Curadores de momentos inolvidables. Diseño y planificación integral de eventos de lujo."},{"id":"c2","type":"links","title":"Explora","items":[{"label":"Servicios","path":"/servicios"},{"label":"Galería","path":"/galeria"},{"label":"Nosotros","path":"/nosotros"}]},{"id":"c3","type":"contact","title":"Información","showIcons":true},{"id":"c4","type":"social","title":"Siguenos","showInstagram":true}],"bottom":{"copyright":"Todos los derechos reservados. Diseñado con Distinción.","devName":"ArchiWit","devUrl":"https://ArchiWit.com","policies":[{"label":"Privacidad","path":"/privacidad"},{"label":"Protección","path":"/proteccion"}]}}'),
(2, 'Anny Garrido', 'Anny Garrido', 'anny70decoraciones@gmail.com', '3157071830', 'Diagonal. 31A, #29-30. Lagos 1 - Floridablanca', 'https://www.instagram.com/annygarridop/', '', '', NULL, '', '', 'https://archiplanner.com', '32733040', 'Barranquilla', '/uploads/config/logo-1775411931957-899994583.svg', '2026-04-13 09:42:46', 0, '/uploads/config/logo-1775573453437-170599524.svg', NULL, '#693030', '#2b2b2b', '#ffffff', '#121212', NULL, NULL, NULL, NULL);

DROP TABLE IF EXISTS `cotizacion_detalles`;
CREATE TABLE `cotizacion_detalles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cot_id` int(11) NOT NULL,
  `art_id` int(11) DEFAULT NULL,
  `loc_id` int(11) DEFAULT NULL,
  `cantidad` decimal(8,2) NOT NULL,
  `costo_u` decimal(10,2) NOT NULL DEFAULT 0.00,
  `precio_u` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `notas` text DEFAULT NULL,
  `por_persona` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `cot_id` (`cot_id`),
  KEY `art_id` (`art_id`),
  KEY `fk_det_loc` (`loc_id`),
  CONSTRAINT `cotizacion_detalles_ibfk_1` FOREIGN KEY (`cot_id`) REFERENCES `cotizaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cotizacion_detalles_ibfk_2` FOREIGN KEY (`art_id`) REFERENCES `articulos` (`id`),
  CONSTRAINT `fk_det_loc` FOREIGN KEY (`loc_id`) REFERENCES `locaciones` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=994 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cotizacion_detalles` (`id`, `cot_id`, `art_id`, `loc_id`, `cantidad`, `costo_u`, `precio_u`, `subtotal`, `notas`, `por_persona`) VALUES 
(585, 1, 63, NULL, '1.00', '1500000.00', '2200000.00', '2200000.00', '', 0),
(586, 1, 17, NULL, '70.00', '0.00', '1000.00', '70000.00', '', 0),
(587, 1, 19, NULL, '70.00', '0.00', '800.00', '56000.00', '', 0),
(588, 1, 15, NULL, '10.00', '0.00', '15000.00', '150000.00', '', 0),
(589, 1, 6, NULL, '70.00', '3000.00', '4500.00', '315000.00', 'Dorada', 0),
(590, 1, 12, NULL, '70.00', '0.00', '1500.00', '105000.00', '', 0),
(591, 1, 22, NULL, '70.00', '0.00', '800.00', '56000.00', '', 0),
(592, 1, 24, NULL, '70.00', '0.00', '3000.00', '210000.00', '', 0),
(593, 1, 20, NULL, '70.00', '0.00', '5000.00', '350000.00', '', 0),
(594, 1, 48, NULL, '1.00', '150000.00', '500000.00', '500000.00', '', 0),
(595, 1, 65, NULL, '10.00', '50000.00', '100000.00', '1000000.00', '', 0),
(596, 1, 51, NULL, '70.00', '18000.00', '32000.00', '2240000.00', '', 1),
(597, 1, 55, NULL, '140.00', '1000.00', '2500.00', '350000.00', '', 0),
(598, 1, 59, NULL, '2.50', '120000.00', '170000.00', '425000.00', '', 0),
(599, 1, 46, NULL, '1.00', '1000000.00', '2500000.00', '2500000.00', '', 0),
(600, 1, 21, NULL, '70.00', '0.00', '5000.00', '350000.00', '', 0),
(601, 1, 30, NULL, '3.00', '120000.00', '120000.00', '360000.00', '', 0),
(602, 1, 32, NULL, '2.00', '100000.00', '150000.00', '300000.00', '', 0),
(603, 1, 29, NULL, '1.00', '700000.00', '700000.00', '700000.00', '', 0),
(604, 1, 35, NULL, '1.00', '750000.00', '1200000.00', '1200000.00', '', 0),
(964, 4, 5, NULL, '10.00', '8000.00', '10000.00', '100000.00', '', 0),
(965, 4, 94, NULL, '10.00', '0.00', '10000.00', '100000.00', '', 0),
(966, 4, 14, NULL, '10.00', '5000.00', '10000.00', '100000.00', '', 0),
(967, 4, 6, NULL, '100.00', '3000.00', '4500.00', '450000.00', '', 0),
(968, 4, 7, NULL, '100.00', '0.00', '1000.00', '100000.00', '', 0),
(969, 4, 9, NULL, '100.00', '0.00', '1000.00', '100000.00', '', 0),
(970, 4, 17, NULL, '100.00', '0.00', '1000.00', '100000.00', '', 0),
(971, 4, 19, NULL, '100.00', '0.00', '800.00', '80000.00', '', 0),
(972, 4, 23, NULL, '100.00', '0.00', '1000.00', '100000.00', '', 0),
(973, 4, 10, NULL, '100.00', '0.00', '1000.00', '100000.00', '', 0),
(974, 4, 22, NULL, '100.00', '0.00', '600.00', '60000.00', '', 0),
(975, 4, 20, NULL, '100.00', '0.00', '500.00', '50000.00', '', 0),
(976, 4, 21, NULL, '100.00', '0.00', '500.00', '50000.00', '', 0),
(977, 4, 25, NULL, '3.00', '0.00', '5000.00', '15000.00', '', 0),
(978, 4, 27, NULL, '3.00', '0.00', '5000.00', '15000.00', '', 0),
(979, 4, 26, NULL, '3.00', '0.00', '5000.00', '15000.00', '', 0),
(980, 4, 30, NULL, '3.00', '120000.00', '120000.00', '360000.00', '', 0),
(981, 4, 31, NULL, '1.00', '0.00', '1000000.00', '1000000.00', '', 0),
(982, 4, 32, NULL, '2.00', '100000.00', '100000.00', '200000.00', '', 0),
(983, 4, 35, NULL, '1.00', '800000.00', '1000000.00', '1000000.00', '', 0),
(984, 4, 29, NULL, '1.00', '500000.00', '500000.00', '500000.00', '', 0),
(985, 4, 85, NULL, '1.00', '260000.00', '500000.00', '500000.00', '', 0),
(986, 4, 49, NULL, '1.00', '0.00', '500000.00', '500000.00', '', 0),
(987, 4, 45, NULL, '1.00', '800000.00', '1500000.00', '1500000.00', '', 0),
(988, 4, 48, NULL, '1.00', '150000.00', '500000.00', '500000.00', '', 0),
(989, 4, 82, NULL, '1.00', '150000.00', '300000.00', '300000.00', '', 0),
(990, 4, 58, NULL, '1.00', '950000.00', '1000000.00', '1000000.00', '', 0),
(991, 4, 56, NULL, '1.00', '50000.00', '250000.00', '250000.00', '', 0),
(992, 4, 59, NULL, '2.50', '120000.00', '170000.00', '425000.00', '', 0),
(993, 4, 55, NULL, '200.00', '1000.00', '2500.00', '500000.00', '', 0);

DROP TABLE IF EXISTS `cotizaciones`;
CREATE TABLE `cotizaciones` (
  `conf_id` int(11) DEFAULT 1,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `num` varchar(20) NOT NULL,
  `cli_id` int(11) NOT NULL,
  `u_id` int(11) NOT NULL,
  `fcoti` date NOT NULL,
  `fevent` date DEFAULT NULL,
  `fevent_fin` date DEFAULT NULL,
  `num_adultos` int(11) DEFAULT 0,
  `num_ninos` int(11) DEFAULT 0,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `lugar` varchar(255) DEFAULT NULL,
  `loc_id` int(11) DEFAULT NULL,
  `tematica` varchar(255) DEFAULT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `tipo_evento` varchar(100) DEFAULT NULL,
  `paleta_colores` text DEFAULT NULL,
  `subt` decimal(12,2) DEFAULT 0.00,
  `nota` decimal(12,2) DEFAULT 0.00,
  `iva` decimal(12,2) DEFAULT 0.00,
  `aplica_iva` tinyint(1) DEFAULT 0,
  `mostrar_precios` tinyint(1) DEFAULT 1,
  `total` decimal(12,2) DEFAULT 0.00,
  `total_tipo` enum('calculado','manual') DEFAULT 'calculado',
  `monto_final` decimal(12,2) DEFAULT 0.00,
  `estado` enum('borrador','enviada','aprobada','rechazada','facturada','contratada') NOT NULL DEFAULT 'borrador',
  `notas` text DEFAULT NULL,
  `fcrea` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `num` (`num`),
  KEY `cli_id` (`cli_id`),
  KEY `u_id` (`u_id`),
  KEY `idx_cotizaciones_estado` (`estado`),
  KEY `idx_cotizaciones_fecha` (`fcoti`),
  KEY `fk_coti_conf` (`conf_id`),
  KEY `fk_coti_loc` (`loc_id`),
  CONSTRAINT `cotizaciones_ibfk_1` FOREIGN KEY (`cli_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cotizaciones_ibfk_2` FOREIGN KEY (`u_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_coti_conf` FOREIGN KEY (`conf_id`) REFERENCES `configuracion` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_coti_loc` FOREIGN KEY (`loc_id`) REFERENCES `locaciones` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cotizaciones` (`conf_id`, `id`, `num`, `cli_id`, `u_id`, `fcoti`, `fevent`, `fevent_fin`, `num_adultos`, `num_ninos`, `hora_inicio`, `hora_fin`, `lugar`, `loc_id`, `tematica`, `ubicacion`, `tipo_evento`, `paleta_colores`, `subt`, `nota`, `iva`, `aplica_iva`, `mostrar_precios`, `total`, `total_tipo`, `monto_final`, `estado`, `notas`, `fcrea`) VALUES 
(2, 1, '6871', 1, 1, '2026-04-05 05:00:00', '2026-10-10 05:00:00', '2026-10-11 05:00:00', 54, 16, '19:00:00', '02:00:00', 'Club Unión', NULL, 'Rapunzel', NULL, 'Quinceaños', '#9c8cbd, #fcd28a, #a7d488', '13437000.00', '0.00', '0.00', 0, 1, '13437000.00', 'calculado', '13437000.00', 'borrador', '', '2026-04-05 15:20:03'),
(2, 4, '4910', 2, 1, '2026-04-12 05:00:00', '2026-08-01 05:00:00', '2026-08-02 05:00:00', 100, 0, '19:00:00', '02:00:00', 'Viñedo Charlotte', NULL, 'Inspiración Griega', NULL, 'Quinceaños', '#a0cede, #c0c0c0, #ffffff', '10070000.00', '0.00', '0.00', 0, 0, '10070000.00', 'manual', '11500000.00', 'contratada', '', '2026-04-12 22:53:42');

DROP TABLE IF EXISTS `cotizaciones_seguimiento`;
CREATE TABLE `cotizaciones_seguimiento` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cot_id` int(11) NOT NULL,
  `u_id` int(11) NOT NULL,
  `comentario` text DEFAULT NULL,
  `estado_anterior` varchar(50) DEFAULT NULL,
  `estado_nuevo` varchar(50) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cot_id` (`cot_id`),
  KEY `u_id` (`u_id`),
  CONSTRAINT `cotizaciones_seguimiento_ibfk_1` FOREIGN KEY (`cot_id`) REFERENCES `cotizaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cotizaciones_seguimiento_ibfk_2` FOREIGN KEY (`u_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cotizaciones_seguimiento` (`id`, `cot_id`, `u_id`, `comentario`, `estado_anterior`, `estado_nuevo`, `fecha`) VALUES 
(1, 4, 1, 'Cotización creada', NULL, 'borrador', '2026-04-12 22:53:42');

DROP TABLE IF EXISTS `gastos`;
CREATE TABLE `gastos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cot_id` int(11) NOT NULL,
  `concepto` varchar(255) NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `fgasto` date NOT NULL,
  `pagado_a` varchar(255) DEFAULT NULL,
  `responsable` varchar(255) DEFAULT NULL,
  `metodo` enum('efectivo','transferencia','tarjeta','consignacion') DEFAULT 'efectivo',
  `comprobante_path` varchar(255) DEFAULT NULL,
  `u_id` int(11) DEFAULT NULL,
  `fcreacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cot_id` (`cot_id`),
  KEY `u_id` (`u_id`),
  CONSTRAINT `gastos_ibfk_1` FOREIGN KEY (`cot_id`) REFERENCES `cotizaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `gastos_ibfk_2` FOREIGN KEY (`u_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `locaciones`;
CREATE TABLE `locaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `direccion` text DEFAULT NULL,
  `capacidad` int(11) DEFAULT NULL,
  `tipo` varchar(50) NOT NULL,
  `foto` varchar(255) DEFAULT NULL COMMENT 'Foto principal de la locación',
  `pro_id` int(11) DEFAULT NULL,
  `precio` decimal(12,2) DEFAULT NULL,
  `disponible` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`disponible`)),
  `estado` tinyint(1) DEFAULT 1,
  `fcrea` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `pro_id` (`pro_id`),
  CONSTRAINT `locaciones_ibfk_1` FOREIGN KEY (`pro_id`) REFERENCES `proveedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `pagos`;
CREATE TABLE `pagos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cot_id` int(11) NOT NULL,
  `n_factura` varchar(50) DEFAULT NULL,
  `monto` decimal(12,2) NOT NULL,
  `fpago` date NOT NULL,
  `metodo` enum('efectivo','transferencia','tarjeta','consignacion') NOT NULL,
  `foto_comprobante` varchar(255) DEFAULT NULL COMMENT 'Foto del comprobante de pago',
  `estado` enum('pendiente','completado','anulado') DEFAULT 'pendiente',
  `referencia` varchar(100) DEFAULT NULL,
  `u_id` int(11) DEFAULT NULL,
  `fcreacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cot_id` (`cot_id`),
  KEY `u_id` (`u_id`),
  KEY `idx_pagos_estado` (`estado`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`cot_id`) REFERENCES `cotizaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pagos_ibfk_2` FOREIGN KEY (`u_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pagos` (`id`, `cot_id`, `n_factura`, `monto`, `fpago`, `metodo`, `foto_comprobante`, `estado`, `referencia`, `u_id`, `fcreacion`) VALUES 
(1, 4, NULL, '1000000.00', '2026-04-12 05:00:00', 'efectivo', NULL, 'completado', 'Pago entregado a Anny', 1, '2026-04-13 03:01:37');

DROP TABLE IF EXISTS `plantilla_detalles`;
CREATE TABLE `plantilla_detalles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pla_id` int(11) NOT NULL,
  `art_id` int(11) DEFAULT NULL,
  `loc_id` int(11) DEFAULT NULL,
  `cantidad` decimal(10,2) NOT NULL DEFAULT 1.00,
  `por_persona` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `pla_id` (`pla_id`),
  KEY `art_id` (`art_id`),
  KEY `loc_id` (`loc_id`),
  CONSTRAINT `plantilla_detalles_ibfk_1` FOREIGN KEY (`pla_id`) REFERENCES `plantillas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `plantilla_detalles_ibfk_2` FOREIGN KEY (`art_id`) REFERENCES `articulos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `plantilla_detalles_ibfk_3` FOREIGN KEY (`loc_id`) REFERENCES `locaciones` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=472 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `plantilla_detalles` (`id`, `pla_id`, `art_id`, `loc_id`, `cantidad`, `por_persona`) VALUES 
(42, 2, 5, NULL, '1.00', 0),
(43, 2, 94, NULL, '1.00', 0),
(44, 2, 14, NULL, '1.00', 0),
(45, 2, 6, NULL, '1.00', 1),
(46, 2, 7, NULL, '1.00', 1),
(47, 2, 9, NULL, '1.00', 1),
(48, 2, 17, NULL, '1.00', 1),
(49, 2, 19, NULL, '1.00', 1),
(50, 2, 23, NULL, '1.00', 1),
(51, 2, 10, NULL, '1.00', 1),
(52, 2, 22, NULL, '1.00', 1),
(53, 2, 20, NULL, '1.00', 1),
(54, 2, 21, NULL, '1.00', 1),
(55, 2, 25, NULL, '1.00', 0),
(56, 2, 27, NULL, '1.00', 0),
(57, 2, 26, NULL, '1.00', 0),
(58, 2, 30, NULL, '1.00', 0),
(59, 2, 31, NULL, '1.00', 0),
(60, 2, 32, NULL, '1.00', 0),
(61, 2, 35, NULL, '1.00', 0),
(392, 4, 5, NULL, '1.00', 0),
(393, 4, 15, NULL, '1.00', 0),
(394, 4, 94, NULL, '1.00', 0),
(395, 4, 6, NULL, '1.00', 1),
(396, 4, 8, NULL, '1.00', 1),
(397, 4, 99, NULL, '1.00', 1),
(398, 4, 17, NULL, '1.00', 1),
(399, 4, 19, NULL, '1.00', 1),
(400, 4, 23, NULL, '1.00', 1),
(401, 4, 10, NULL, '1.00', 1),
(402, 4, 20, NULL, '1.00', 1),
(403, 4, 21, NULL, '1.00', 1),
(404, 4, 25, NULL, '1.00', 0),
(405, 4, 27, NULL, '1.00', 0),
(406, 4, 26, NULL, '1.00', 0),
(407, 4, 30, NULL, '1.00', 0),
(408, 4, 32, NULL, '1.00', 0),
(409, 4, 31, NULL, '1.00', 0),
(410, 4, 35, NULL, '1.00', 0),
(411, 4, 51, NULL, '1.00', 1),
(412, 4, 55, NULL, '1.00', 0),
(413, 4, 82, NULL, '1.00', 0),
(414, 4, 59, NULL, '1.00', 0),
(415, 4, 56, NULL, '1.00', 0),
(416, 4, 73, NULL, '1.00', 0),
(417, 4, 74, NULL, '1.00', 0),
(418, 4, 60, NULL, '1.00', 0),
(419, 4, 71, NULL, '1.00', 0),
(420, 4, 79, NULL, '1.00', 0),
(421, 4, 67, NULL, '1.00', 0),
(422, 4, 72, NULL, '1.00', 0),
(423, 4, 48, NULL, '1.00', 0),
(424, 4, 98, NULL, '1.00', 0),
(425, 4, 102, NULL, '1.00', 0),
(426, 3, 5, NULL, '1.00', 0),
(427, 3, 15, NULL, '1.00', 0),
(428, 3, 94, NULL, '1.00', 0),
(429, 3, 6, NULL, '1.00', 1),
(430, 3, 7, NULL, '1.00', 1),
(431, 3, 9, NULL, '1.00', 1),
(432, 3, 17, NULL, '1.00', 1),
(433, 3, 19, NULL, '1.00', 1),
(434, 3, 23, NULL, '1.00', 1),
(435, 3, 10, NULL, '1.00', 1),
(436, 3, 20, NULL, '1.00', 1),
(437, 3, 21, NULL, '1.00', 1),
(438, 3, 25, NULL, '1.00', 0),
(439, 3, 27, NULL, '1.00', 0),
(440, 3, 26, NULL, '1.00', 0),
(441, 3, 30, NULL, '1.00', 0),
(442, 3, 32, NULL, '1.00', 0),
(443, 3, 28, NULL, '1.00', 0),
(444, 3, 31, NULL, '1.00', 0),
(445, 3, 35, NULL, '1.00', 0),
(446, 3, 51, NULL, '1.00', 1),
(447, 3, 55, NULL, '1.00', 0),
(448, 3, 82, NULL, '1.00', 0),
(449, 3, 59, NULL, '1.00', 0),
(450, 3, 56, NULL, '1.00', 0),
(451, 3, 73, NULL, '1.00', 0),
(452, 3, 74, NULL, '1.00', 0),
(453, 3, 60, NULL, '1.00', 0),
(454, 3, 79, NULL, '1.00', 0),
(455, 3, 68, NULL, '1.00', 0),
(456, 3, 72, NULL, '1.00', 0),
(457, 3, 48, NULL, '1.00', 0),
(458, 3, 98, NULL, '1.00', 0),
(459, 1, 84, NULL, '1.00', 0),
(460, 1, 85, NULL, '1.00', 0),
(461, 1, 86, NULL, '1.00', 0),
(462, 1, 58, NULL, '1.00', 0),
(463, 1, 87, NULL, '1.00', 0),
(464, 1, 88, NULL, '1.00', 0),
(465, 1, 89, NULL, '1.00', 0),
(466, 1, 90, NULL, '1.00', 0),
(467, 1, 91, NULL, '1.00', 0),
(468, 1, 92, NULL, '1.00', 0),
(469, 1, 93, NULL, '1.00', 0),
(470, 1, 34, NULL, '1.00', 0),
(471, 1, 33, NULL, '1.00', 0);

DROP TABLE IF EXISTS `plantillas`;
CREATE TABLE `plantillas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `tipo_evento` varchar(100) DEFAULT NULL,
  `fcrea` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `plantillas` (`id`, `nombre`, `tipo_evento`, `fcrea`) VALUES 
(1, 'Adicionales', 'Otro', '2026-04-06 21:49:21'),
(2, 'XV ♦ Essential', 'Quinceaños', '2026-04-07 12:39:01'),
(3, 'Catolica ♦ Essential', 'Boda', '2026-04-07 13:33:29'),
(4, 'Catolica ♦ Onyx', 'Boda', '2026-04-07 13:51:43');

DROP TABLE IF EXISTS `proveedores`;
CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `contacto` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `servicios` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`servicios`)),
  `direccion` text DEFAULT NULL,
  `califica` decimal(2,1) DEFAULT 0.0,
  `estado` tinyint(1) DEFAULT 1,
  `foto` varchar(255) DEFAULT NULL,
  `fcrea` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `proveedores` (`id`, `nombre`, `contacto`, `telefono`, `correo`, `servicios`, `direccion`, `califica`, `estado`, `foto`, `fcrea`) VALUES 
(2, 'Activa TM', 'Javier', '3046716767', '', '["dj","Sonido","DJ / Música","Iluminación","Animación"]', '', '4.0', 1, NULL, '2026-04-04 03:24:34'),
(3, 'Wolf Estudio Audiovisual', 'Julián Céspedes ', '3023501483', '', '["fotografia","Fotografía","Video"]', '', '4.5', 1, NULL, '2026-04-04 03:24:34'),
(4, 'Viñedo Charlotte', 'Carmen Bermudez • Leidy', '3017842991', '', '["Salón","Mobiliario"]', '', '5.0', 1, NULL, '2026-04-05 17:30:53'),
(5, 'Eventos Maravillosos', 'Elsa Rueda', '3187757984', '', '["Salón","DJ / Música","Sonido","Flores","Bar / Bebidas","Catering","Mobiliario"]', 'Piedecuesta', '4.5', 1, NULL, '2026-04-05 17:32:10'),
(6, 'Aldredo Cheff', 'Alfredo', '3138251061', '', '["Catering"]', 'Girón', '5.0', 1, NULL, '2026-04-05 18:47:17'),
(7, 'Gomki Pastelería', 'Damarys', '3163159550', '', '["Pastelería"]', 'Calle 28 A #30-141, Girón, Santander, Colombia', '4.0', 1, NULL, '2026-04-05 18:53:05');

DROP TABLE IF EXISTS `servicios`;
CREATE TABLE `servicios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `tag` varchar(50) DEFAULT NULL,
  `icono_svg` text DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT '/contacto',
  `visible` tinyint(1) DEFAULT 1,
  `orden` int(11) DEFAULT 0,
  `seccion` varchar(50) DEFAULT 'principales',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `servicios` (`id`, `titulo`, `tag`, `icono_svg`, `descripcion`, `imagen`, `link`, `visible`, `orden`, `seccion`, `created_at`) VALUES 
(1, 'Bodas de Ensueño', 'Planificación', '', '<p>Planificación&nbsp;integral&nbsp;con&nbsp;un&nbsp;enfoque&nbsp;romántico&nbsp;y&nbsp;arquitectónico.</p>', '/uploads/services/serv-1775640392815-199546085.png', '/contacto', 1, 1, 'principales', '2026-04-08 07:15:49'),
(2, 'XV Años Espectaculares', 'Celebración', '', '<p>Celebramos&nbsp;tu&nbsp;esencia&nbsp;con&nbsp;estilo,&nbsp;tendencia&nbsp;y&nbsp;sofisticación.</p>', '/uploads/services/serv-1775640402680-606953320.png', '/contacto', 1, 2, 'principales', '2026-04-08 07:15:49'),
(3, 'Eventos Corporativos', 'Estrategia', '', '<p>Galas,&nbsp;lanzamientos&nbsp;y&nbsp;encuentros&nbsp;de&nbsp;alto&nbsp;impacto&nbsp;para&nbsp;tu&nbsp;marca.</p>', '/uploads/services/serv-1775640409856-820287403.png', '/contacto', 1, 3, 'principales', '2026-04-08 07:15:49'),
(4, 'Baby Shower', 'Dulces esperas', '<svg viewBox="0 0 100 100" class="premium-svg-icon">
                    <circle cx="50" cy="35" r="20" class="svg-anim-path" />
                    <path d="M50 55 L50 85" class="svg-anim-path" />
                    <rect x="40" y="75" width="20" height="5" class="svg-anim-path" />
                </svg>', '<p>Dulces&nbsp;esperas&nbsp;con&nbsp;decoraciones&nbsp;temáticas&nbsp;y&nbsp;organización&nbsp;cálida.</p>', NULL, '/contacto', 1, 4, 'sociales', '2026-04-08 07:15:49'),
(5, 'Revelación de Sexo', 'Momentos mágicos', '<svg viewBox="0 0 100 100" class="premium-svg-icon">
                    <path d="M50 20 C20 20 20 50 50 80 C80 50 80 20 50 20" class="svg-anim-path" />
                    <path d="M50 40 Q55 35 50 30 Q45 35 50 40" class="svg-anim-path" stroke-width="1" />
                    <text x="45" y="55" fill="currentColor" style="font-size: 20px; font-weight: bold;">?</text>
                </svg>', '<p>Momentos&nbsp;de&nbsp;máxima&nbsp;emoción&nbsp;con&nbsp;puestas&nbsp;en&nbsp;escena&nbsp;creativas.</p>', NULL, '/contacto', 1, 5, 'sociales', '2026-04-08 07:15:49'),
(6, 'Aniversarios', 'Renovando promesas', '<svg viewBox="0 0 100 100" class="premium-svg-icon">
                    <path d="M40 30 Q40 60 50 60 Q60 60 60 30 Z" transform="rotate(-15 50 45)" class="svg-anim-path" />
                    <path d="M60 30 Q60 60 50 60 Q40 60 40 30 Z" transform="rotate(15 50 45)" class="svg-anim-path" />
                    <path d="M50 50 V80 M35 80 H65" class="svg-anim-path" />
                    <circle cx="50" cy="20" r="2" class="svg-anim-path" />
                    <circle cx="45" cy="12" r="1.5" class="svg-anim-path" />
                </svg>', '<p>Renovando&nbsp;promesas&nbsp;con&nbsp;celebraciones&nbsp;llenas&nbsp;de&nbsp;nostalgia&nbsp;y&nbsp;elegancia.</p>', NULL, '/contacto', 1, 6, 'sociales', '2026-04-08 07:15:49'),
(7, 'Cenas Privadas', 'Encuentros gastronómicos', '<svg viewBox="0 0 100 100" class="premium-svg-icon">
                    <path d="M30 20 V80 H45 V20 Z" class="svg-anim-path" />
                    <path d="M60 40 Q60 70 75 70 Q90 70 90 40 Z" class="svg-anim-path" />
                    <path d="M75 70 V85 M65 85 H85" class="svg-anim-path" />
                    <path d="M30 35 H45 M30 50 H45" class="svg-anim-path" />
                </svg>', '<p>Encuentros&nbsp;gastronómicos&nbsp;exclusivos&nbsp;con&nbsp;curaduría&nbsp;de&nbsp;mesa&nbsp;editorial.</p>', NULL, '/contacto', 1, 7, 'sociales', '2026-04-08 07:15:49'),
(8, 'Encuentros Deportivos', 'Logística premium', '<svg viewBox="0 0 100 100" class="premium-svg-icon">
                    <path d="M30 20 H70 V45 Q70 65 50 65 Q30 65 30 45 Z" class="svg-anim-path" />
                    <path d="M30 30 H20 V45 Q20 55 30 55" class="svg-anim-path" />
                    <path d="M70 30 H80 V45 Q80 55 70 55" class="svg-anim-path" />
                    <path d="M50 65 V80 M35 80 H65" class="svg-anim-path" />
                </svg>', '<p>Organización&nbsp;de&nbsp;torneos&nbsp;y&nbsp;jornadas&nbsp;activas&nbsp;con&nbsp;logística&nbsp;premium.</p>', NULL, '/contacto', 1, 9, 'sociales', '2026-04-08 07:15:49'),
(9, 'Propuestas de matrimonio', 'Historias de amor', '<svg viewBox="0 0 100 100" class="premium-svg-icon">
                    <circle cx="50" cy="65" r="25" class="svg-anim-path" />
                    <path d="M35 30 L50 10 L65 30 L55 42 L45 42 Z" class="svg-anim-path" />
                    <path d="M42 5 L45 10 M58 5 L55 10 M50 2 L50 8" class="svg-anim-path" stroke-width="1" />
                </svg>', '<p>Creamos&nbsp;el&nbsp;ambiente&nbsp;ideal&nbsp;para&nbsp;el&nbsp;inicio&nbsp;de&nbsp;una&nbsp;historia&nbsp;especial.</p>', NULL, '/contacto', 1, 8, 'sociales', '2026-04-08 07:15:49');

DROP TABLE IF EXISTS `testimonios`;
CREATE TABLE `testimonios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `image` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `event_title` varchar(100) DEFAULT NULL,
  `es_visible` tinyint(1) DEFAULT 1,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `testimonios` (`id`, `image`, `message`, `name`, `event_title`, `es_visible`, `date`) VALUES 
(1, '/uploads/testimonials/test-1775630554447-122689328.png', 'Cada detalle se sintió íntimo, refinado y perfectamente pensado. ArchiPlanner logró convertir nuestra historia en una experiencia visual inolvidable, uniendo dos naciones.', 'Yuliana & Fabián', 'Boda editorial Internacional', 1, '2026-04-08 05:56:00'),
(2, '/uploads/testimonials/test-1775630635749-213333467.png', 'Un quinceañera entre brillos y lujo, donde cada destello fue puro esplendor. ArchiPlanner transformó la noche en una experiencia de elegancia absoluta y sofisticación luxury.', 'Sarita', 'Celebración de XV', 1, '2026-04-08 05:56:00'),
(3, '/uploads/testimonials/test-1775630704437-111089016.png', 'No solo diseñaron un evento hermoso; diseñaron una emoción. Todo tuvo armonía, intención y muchísima delicadeza.', 'Dayana & Sergio', 'Wedding design', 1, '2026-04-08 05:56:00'),
(4, '/uploads/testimonials/test-1775630824228-543618039.png', 'Nuestra boda entre flores fue un sueño romántico: pétalos cayendo como lluvia suave, aromas que envolvían cada momento y una estética floral que respiraba amor eterno y elegancia natural.', 'Laura & Daniel', 'Boda entre flores', 1, '2026-04-08 05:56:00'),
(5, '/uploads/testimonials/test-1775630490062-990491749.png', 'ArchiPlanner no solo crea eventos; construye recuerdos que perduran con una elegancia natural y atemporal.', 'Juliana', 'XV entre Lunas y Estrellas', 1, '2026-04-08 06:24:27'),
(6, '/uploads/testimonials/test-1775630441657-305463339.png', 'Desde la primera reunión supimos que confiábamos en su visión. Cada decisión reflejaba buen gusto y sensibilidad. queriamos el Sause fuera el protagonista, delicado y minimalista', 'Ximena & Daniel', 'Boda íntima', 1, '2026-04-08 06:24:46');

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `nick` varchar(255) NOT NULL,
  `clave` varchar(255) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `rol` enum('admin','coordinador','asesor','proveedor') DEFAULT 'asesor',
  `foto` varchar(255) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1,
  `u_fcrea` timestamp NOT NULL DEFAULT current_timestamp(),
  `u_ultima_sesion` timestamp NULL DEFAULT NULL,
  `conf_id` int(11) DEFAULT 1,
  `email` varchar(255) DEFAULT NULL,
  `reset_code` varchar(10) DEFAULT NULL,
  `nacimiento` date DEFAULT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  KEY `conf_id` (`conf_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`conf_id`) REFERENCES `configuracion` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `usuarios` (`id`, `nombre`, `nick`, `clave`, `correo`, `telefono`, `direccion`, `rol`, `foto`, `estado`, `u_fcrea`, `u_ultima_sesion`, `conf_id`, `email`, `reset_code`, `nacimiento`, `apellido`) VALUES 
(1, 'Luis Archila', 'ArchiPlanner', '4888', 'archiplannerbga@gmail.com', '3004760514', 'Cra. 18w # 64-11 03. Monterredondo - Bucaramanaga', 'admin', '/uploads/users/user-1775348412105-864285004.jpg', 1, '2026-04-04 03:24:34', NULL, 1, 'ArchiPlanner@archiplanner.com', NULL, NULL, NULL);

DROP TABLE IF EXISTS `web_contenido`;
CREATE TABLE `web_contenido` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pagina` varchar(50) DEFAULT NULL,
  `seccion` varchar(50) DEFAULT NULL,
  `clave` varchar(50) DEFAULT NULL,
  `valor` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_content` (`pagina`,`seccion`,`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `web_contenido` (`id`, `pagina`, `seccion`, `clave`, `valor`) VALUES 
(1, 'home', 'hero', 'titulo', 'Celebraciones que <br /><span>Permanecen</span>'),
(2, 'home', 'hero', 'descripcion', 'Especialistas en la planificación integral de hitos inolvidables con un toque de distinción y diseño editorial.'),
(3, 'home', 'metodo', 'tag', 'El Método ArchiPlanner'),
(4, 'home', 'metodo', 'titulo', 'De la Idea a la Celebración'),
(5, 'home', 'footer', 'cierre', 'Vivimos el pulse de cada evento...'),
(6, 'contacto', 'info', 'titulo', 'Contacto'),
(7, 'contacto', 'info', 'descripcion', 'Estamos listos para hacer realidad tu evento emocionante.');

DROP TABLE IF EXISTS `web_ctas`;
CREATE TABLE `web_ctas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(50) DEFAULT NULL,
  `tag` varchar(100) DEFAULT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `texto_boton` varchar(100) DEFAULT NULL,
  `enlace` varchar(255) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `web_ctas` (`id`, `slug`, `tag`, `titulo`, `descripcion`, `texto_boton`, `enlace`, `imagen`, `created_at`) VALUES 
(1, 'home_personal', 'Confianza', 'Diseñemos juntos tu próximo gran hito', 'Mi compromiso es convertir tu visión en una realidad impecable.', 'Solicitar Propuesta', '/contacto', '/uploads/services/item-1775641168407-129360974.png', '2026-04-08 08:01:04'),
(2, 'services_final', 'Empieza ahora', '¿Listo para elevar tu evento?', 'Déjanos acompañarte en este viaje emocional y creativo.', 'Consultar Disponibilidad', '/contacto', '/uploads/services/item-1775641183297-185266685.png', '2026-04-08 08:01:04');

DROP TABLE IF EXISTS `web_galeria_categorias`;
CREATE TABLE `web_galeria_categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `web_galeria_categorias` (`id`, `nombre`, `slug`) VALUES 
(1, 'Bodas', 'bodas'),
(2, 'XV Años', 'xv'),
(3, 'Sociales', 'social'),
(4, 'Corporativos', 'corp');

DROP TABLE IF EXISTS `web_galeria_eventos`;
CREATE TABLE `web_galeria_eventos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `portada_url` varchar(255) DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `en_hero` tinyint(1) DEFAULT 0,
  `narrativa` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `web_galeria_eventos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `web_galeria_categorias` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `web_galeria_eventos` (`id`, `titulo`, `descripcion`, `categoria_id`, `portada_url`, `orden`, `activo`, `created_at`, `metadata`, `en_hero`, `narrativa`) VALUES 
(1, 'Sergio y Dayana', 'En las serenas colinas de nuestra finca, Sergio y Dayana unieron sus vidas en un matrimonio cristiano lleno de fe y elegancia. Todo se desarrolló aquí: la ceremonia íntima al aire libre, bajo el cielo protector, y la celebración refinada en el salón, donde cada detalle respiró amor eterno. Una historia de devoción que cobró vida en nuestro espacio.

¿Quieres crear la tuya? Escríbeme y cuéntame tu visión.', 1, '/uploads/gallery/hero-1775790132523-387660629.jpg', 0, 1, '2026-04-09 16:27:42', '{"paleta":["#ffffff","#e4e6d9","#4e6350"],"mensaje_novios":"Hoy, en esta finca bendecida por Dios, Sergio y Dayana queremos agradecerles desde lo más profundo del corazón por acompañarnos en el día más importante de nuestras vidas. La ceremonia al aire libre, bajo Su mirada protectora, y la celebración íntima en el salón, fueron testigos de nuestro compromiso eterno, lleno de fe, amor y promesas divinas. Cada sonrisa, oración y abrazo suyo hizo que este momento fuera inolvidable y perfecto. ¡Gracias por ser el reflejo de Su gracia en nuestra unión!\n\nSi sueñas con un día así, cuéntanos tu historia. Estamos aquí para hacerlo realidad.\n\nCon gratitud eterna,\nSergio & Dayana","portada_focal":"49.59% 27.07%"}', 1, 'En las serenas colinas de nuestra finca, Sergio y Dayana unieron sus vidas en un matrimonio cristiano lleno de fe y elegancia. Todo se desarrolló aquí: la ceremonia íntima al aire libre, bajo el cielo protector, y la celebración refinada en el salón, donde cada detalle respiró amor eterno. Una historia de devoción que cobró vida en nuestro espacio.'),
(2, 'Lunas y Estrellas • Juli', '', 2, '/uploads/gallery/hero-1775783883277-629594342.jpg', 0, 1, '2026-04-09 21:31:47', '{"paleta":["#0f1b4d","#969696","#ffffff"],"mensaje_novios":"","portada_focal":"59.02% 31.71%"}', 1, 'Bajo un manto de lunas y estrellas, los XV años de Juli brillaron en nuestra finca rodeada de naturaleza pura. Fuegos artificiales iluminaron el cielo mientras familia y amigos celebraban con amor, agradeciendo a Dios por esta nueva etapa llena de promesas. Una noche inolvidable de alegría eterna.'),
(3, 'Yuliana y Fábian', '', 1, '/uploads/gallery/hero-1775788755159-898650641.jpg', 0, 1, '2026-04-10 02:14:12', '{"paleta":["#D4AF37","#F5E6E8"],"mensaje_novios":"","portada_focal":"58.45% 40.25%"}', 1, ''),
(4, 'Valentina entre luces flotantes', '', 2, '/uploads/gallery/hero-1775795172424-969996597.jpg', 0, 1, '2026-04-10 04:25:10', '{"paleta":["#D4AF37","#F5E6E8"],"mensaje_novios":"","portada_focal":"56.16% 30.50%"}', 1, '');

DROP TABLE IF EXISTS `web_galeria_media`;
CREATE TABLE `web_galeria_media` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `evento_id` int(11) NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `tipo` enum('image','video','embed') NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `categoria` varchar(50) DEFAULT 'galeria',
  `created_at` datetime DEFAULT current_timestamp(),
  `external_url` varchar(500) DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `evento_id` (`evento_id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `web_galeria_media` (`id`, `evento_id`, `url`, `tipo`, `name`, `categoria`, `created_at`, `external_url`, `orden`) VALUES 
(1, 1, '/uploads/gallery/gal-1775752126546-242852079.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 0),
(2, 1, '/uploads/gallery/gal-1775752126548-353828048.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 12),
(3, 1, '/uploads/gallery/gal-1775752126569-692121303.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 10),
(4, 1, '/uploads/gallery/gal-1775752126563-579999528.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 14),
(5, 1, '/uploads/gallery/gal-1775752126559-410501167.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 13),
(6, 1, '/uploads/gallery/gal-1775752126556-328122880.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 15),
(7, 1, '/uploads/gallery/gal-1775752126578-705108591.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 11),
(8, 1, '/uploads/gallery/gal-1775752126582-623222780.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 9),
(9, 1, '/uploads/gallery/gal-1775752133208-182834509.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 1),
(10, 1, '/uploads/gallery/gal-1775752133214-685016050.png', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 4),
(11, 1, '/uploads/gallery/gal-1775752133225-597723252.png', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 3),
(12, 1, '/uploads/gallery/gal-1775752133233-77593713.png', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 6),
(13, 1, '/uploads/gallery/gal-1775752133236-835239583.png', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 7),
(14, 1, '/uploads/gallery/gal-1775752133221-234224287.png', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 5),
(15, 1, '/uploads/gallery/gal-1775752133230-717887531.png', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 2),
(16, 1, '/uploads/gallery/gal-1775752133239-534397996.png', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 8),
(17, 3, '/uploads/gallery/hero-1775787252733-112526267.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 1),
(18, 3, '/uploads/gallery/hero-1775788923787-412105380.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 2),
(19, 3, '/uploads/gallery/hero-1775788923840-193618863.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 3),
(20, 3, '/uploads/gallery/hero-1775788923923-768954111.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 4),
(21, 3, '/uploads/gallery/hero-1775788923995-926873576.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 5),
(22, 3, '/uploads/gallery/hero-1775788924066-101205729.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 6),
(23, 3, '/uploads/gallery/hero-1775788924129-539959966.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 7),
(24, 3, '/uploads/gallery/hero-1775788924184-305207952.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 8),
(25, 3, '/uploads/gallery/hero-1775788924270-973083644.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 9),
(26, 3, '/uploads/gallery/hero-1775788924353-337580547.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 10),
(27, 3, '/uploads/gallery/hero-1775788924452-875717915.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 11),
(28, 3, '/uploads/gallery/hero-1775788924552-16293609.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 12),
(29, 3, '/uploads/gallery/hero-1775788924639-991782439.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 13),
(30, 3, '/uploads/gallery/hero-1775788924729-907598742.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 14),
(31, 3, '/uploads/gallery/hero-1775788924799-564129653.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 15),
(32, 3, '/uploads/gallery/hero-1775788924906-694383834.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 16),
(33, 3, '/uploads/gallery/hero-1775788924995-548414430.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 17),
(34, 3, '/uploads/gallery/hero-1775788925106-855528343.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 18),
(35, 4, '/uploads/gallery/hero-1775795155916-580684853.jpeg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 6),
(36, 4, '/uploads/gallery/hero-1775795155925-771196991.jpeg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 7),
(37, 4, '/uploads/gallery/hero-1775795155946-885813320.jpeg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 1),
(38, 4, '/uploads/gallery/hero-1775795155969-687151972.jpeg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 14),
(39, 4, '/uploads/gallery/hero-1775795155976-763132281.jpeg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 12),
(40, 4, '/uploads/gallery/hero-1775795155982-733777385.jpeg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 4),
(41, 4, '/uploads/gallery/hero-1775795156022-623524416.jpeg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 5),
(42, 4, '/uploads/gallery/hero-1775795156037-372357187.jpeg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 11),
(43, 4, '/uploads/gallery/hero-1775795156044-302203006.jpeg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 0),
(44, 4, '/uploads/gallery/hero-1775795156084-914359685.jpeg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 8),
(45, 4, '/uploads/gallery/hero-1775795156092-989222449.jpeg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 9),
(46, 4, '/uploads/gallery/hero-1775795156101-437597919.jpeg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 10),
(47, 4, '/uploads/gallery/hero-1775795156110-761073030.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 13),
(48, 4, '/uploads/gallery/hero-1775795156132-884951629.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 15),
(49, 4, '/uploads/gallery/hero-1775795156152-723678779.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 2),
(50, 4, '/uploads/gallery/hero-1775795156163-466045877.jpg', 'image', NULL, 'galeria', '2026-04-11 01:26:00', NULL, 3),
(52, 0, '/uploads/items/item-1775411904994-344457137.jpg', '', 'Sillas Chavari Gold', 'productos', '2026-04-11 01:27:28', NULL, 0),
(53, 0, '/uploads/gallery/1775873108559-724916003.avif', '', 'photo-1519741497674-611481863552.avif', 'sistema', '2026-04-11 02:05:08', NULL, 0),
(54, 0, '/uploads/gallery/1776062620216-262690801.mp4', 'video', 'Valentina â¢ Rapubzel.mp4', 'galeria', '2026-04-13 06:43:40', NULL, 0),
(55, 0, '/uploads/gallery/hero-1775790132523-387660629.jpg', '', 'Sergio y Dayana', 'eventos', '2026-04-15 14:16:45', NULL, 0),
(56, 0, '/uploads/gallery/hero-1775783883277-629594342.jpg', '', 'Lunas y Estrellas • Juli', 'eventos', '2026-04-15 14:16:45', NULL, 0),
(57, 0, '/uploads/gallery/hero-1775788755159-898650641.jpg', '', 'Yuliana y Fábian', 'eventos', '2026-04-15 14:16:45', NULL, 0),
(58, 0, '/uploads/gallery/hero-1775795172424-969996597.jpg', '', 'Valentina entre luces flotantes', 'eventos', '2026-04-15 14:16:45', NULL, 0),
(59, 0, '/uploads/gallery/1776266525579-267203652.avif', '', 'photo-1519225421980-715cb0215aed.avif', 'sistema', '2026-04-15 15:22:05', NULL, 0);

DROP TABLE IF EXISTS `web_historias`;
CREATE TABLE `web_historias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) DEFAULT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  `activo` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `web_paginas_v4`;
CREATE TABLE `web_paginas_v4` (
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `web_paginas_v4` (`id`, `nombre`, `slug`, `descripcion`, `created_at`, `created_by`, `is_visible`, `estado`, `content`, `style_config`, `seo_title`, `seo_description`, `seo_keywords`, `is_homepage`) VALUES 
(3, 'Bienvenido', 'bienvenido', '✨ ArchiPlanner: Wedding y Event Planner en Bucaramanga. Organizamos bodas, XV años y eventos únicos con elegancia. ¡Contáctanos: 3004760514!', '2026-04-10 21:48:17', 'Admin', 1, 'publicado', '[{"id":"row-1775866750658-90","type":"row","config":{"marginTop":"0","marginRight":"0","marginBottom":"0","marginLeft":"0","paddingTop":"0","paddingRight":"0","paddingBottom":"0","paddingLeft":"0"},"children":[{"id":"col-row-1775866750658-90-1","type":"col","span":12,"children":[{"id":"comp-1775868958290-29","type":"hero-modern","config":{"titulo":"Creamos Historias Inolvidables","subtitulo":"Diseño editorial y curaduría de eventos para almas sofisticadas\n","media_path":"/uploads/gallery/1775873108559-724916003.avif","buttonLabel":"Comenzar mi Historia","bgType":"image"}}],"config":{"marginTop":"0","marginRight":"0","marginBottom":"0","marginLeft":"0","paddingTop":"0","paddingRight":"0","paddingBottom":"0","paddingLeft":"0"}}]},{"id":"row-1775868879210","type":"row","config":{},"children":[{"id":"col-row-1775868879210-1","type":"col","span":12,"children":[{"id":"comp-1775868879210-681","type":"heading","config":{"content":"Grandes Hitos","fontSize":"56px","textColor":"#ffffff","textAlign":"center","fontFamily":"''Playfair Display'', serif","subtitle":"Principales","marginBottom":"50px"}},{"id":"comp-1775876310849-61","type":"query-grid-v4","config":{"source":"servicios","columns":3,"limit":3,"sectionFilter":"principales","cardStyle":{"style":"boxed","shape":"rounded","alignment":"left","layout":"vertical","showLink":true,"ctaAlignment":"center"},"mediaPreference":"only_image"}}],"config":{}}]},{"id":"row-1775876228920","type":"row","config":{},"children":[{"id":"col-row-1775876228920-1","type":"col","span":12,"children":[{"id":"comp-1776054026339-263","type":"heading","config":{"content":"Sociales y Familiares","fontSize":"48px","textColor":"#FFFFFF","textAlign":"center","fontWeight":"800","subtitle":"Momentos Íntimos","fontFamily":"''Playfair Display'', serif","paddingBottom":"","marginBottom":"50px"}},{"id":"comp-1775876228920-129","type":"query-grid-v4","config":{"content":"Elemento","source":"servicios","sectionFilter":"sociales","columns":3,"limit":6,"cardStyle":{"layout":"horizontal-left"}}}],"config":{}}]},{"id":"row-1776068175538-344","type":"row","config":{"isFullWidth":true,"bgType":"color","bgColor":"#2c2c2c","paddingTop":"0px","paddingBottom":"0px","paddingRight":"0px","paddingLeft":"0px","marginTop":"130px","marginBottom":"130px"},"children":[{"id":"col-row-1776068175538-344-1","type":"col","span":12,"children":[{"id":"comp-1776070104450-76","type":"PULSE","config":{"title":"El Pulse de cada Evento","tag":"VIVIMOS EL MÉTODO","closingPhrase":"Vivimos el pulse de cada evento...","paddingTop":"0px","paddingBottom":"0px","marginTop":"0px","marginRight":"0px","marginBottom":"0px","marginLeft":"0px","paddingRight":"0px","paddingLeft":"0px"}}],"config":{}}]},{"id":"row-1776059442031-712","type":"row","config":{"justifyContent":"center"},"children":[{"id":"col-row-1776059442031-712-1","type":"col","span":12,"children":[{"id":"comp-1776061399206-386","type":"cta-phone-v4","config":{"title":"¿Listo para elevar tu evento?","hook":"EMPIEZA AHORA","closure":"Diseñamos y planificamos cada detalle para que tú solo disfrutes.\nTu visión, nuestra magia.","buttonLabel":"Reserva tu fecha mágica","link":"https://wa.me/573004760514?text=Hola%2C%20quiero%20más%20información%20sobre%20tus%20servicios%20de%20bodas%20y%20eventos.","phoneVideo":"/uploads/gallery/1776062620216-262690801.mp4","bgColor":"#121212","accentColor":"#e87c7c","paddingTop":"0px","paddingBottom":"0px","actionType":"whatsapp","whatsappMessage":"Hola, vi tu servicio y me gustaría saber más. ¿Podemos cotizar y agendar una llamada?"}}],"config":{}}]},{"id":"row-1776055163575-490","type":"row","config":{"alignItems":"center","maxWidth":"100%","minHeight":"auto","paddingTop":"0px","paddingRight":"0px","paddingBottom":"0px","paddingLeft":"0px","isFullWidth":true,"marginTop":""},"children":[{"id":"col-row-1776055163575-490-1","type":"col","span":12,"children":[{"id":"comp-1776055537635-699","type":"testimonios","config":{"paddingTop":"0px","paddingBottom":"0px","paddingRight":"0px","paddingLeft":"0px"}}],"config":{"paddingTop":"0","paddingBottom":"0","paddingLeft":"0"}}]}]', '{"canvasBg":"#000000","canvasText":"#FFFFFF"}', 'Wedding Planner Bucaramanga | ArchiPlanner - Bodas y Eventos Únicos', '✨ ArchiPlanner: Wedding y Event Planner en Bucaramanga. Organizamos bodas, XV años y eventos únicos con elegancia. ¡Contáctanos: 3004760514!', NULL, 1),
(4, 'Galeria', 'galeria', NULL, '2026-04-13 10:50:33', 'Admin', 1, 'publicado', '[{"id":"row-1776262297289-610","type":"row","config":{"bgType":"color","bgColor":"#0b0b0b"},"children":[{"id":"col-row-1776262297289-610-1","type":"col","span":12,"children":[{"id":"comp-1776262306675-240","type":"heading","config":{"variant":"premium","content":"Nuevo Título Editorial","titleMain":"Galería de","titleHighlight":"Experiencias","subtitle":"Nuestro Trabajo","description":"Una experiencia visual de los hitos que hemos tenido el honor de planificar.","fontSize":"56px","textColor":"#FFFFFF","textAlign":"left","fontWeight":"800"}}],"config":{}}]},{"id":"row-1776262308424-804","type":"row","config":{"bgType":"color","bgColor":"#0b0b0b"},"children":[{"id":"col-row-1776262308424-804-1","type":"col","span":12,"children":[{"id":"comp-1776262313099-928","type":"gallery","config":{"source":"dynamic","images":[],"columns":4,"gap":10,"category":"todos"}}],"config":{}}]},{"id":"row-1776262349080-992","type":"row","config":{"bgType":"color","bgColor":"#111111"},"children":[{"id":"col-row-1776262349080-992-1","type":"col","span":12,"children":[{"id":"comp-1776262356451-550","type":"cta-phone-v4","config":{"title":"¿Listo para elevar tu evento?","hook":"EMPIEZA AHORA","closure":"Diseñamos y planificamos cada detalle para que tú solo disfrutes. Tu visión, nuestra magia.","buttonLabel":"Reserva tu fecha mágica","actionType":"whatsapp","whatsappMessage":"Hola, me interesa ArchiPlanner para mi evento","customPhone":"","phoneVideo":"/uploads/gallery/1776062620216-262690801.mp4","bgColor":"#121212","accentColor":"#e87c7c"}}],"config":{}}]}]', '{"canvasBg":"#FFFFFF","canvasText":"#121212"}', NULL, NULL, NULL, 0),
(5, 'Nosotros', 'nosotros', '', '2026-04-15 13:36:01', 'Admin', 1, 'publicado', '[{"id":"row-1776266333931-134","type":"row","config":{"bgType":"color","bgColor":"#0b0b0b","paddingBottom":"50px","paddingTop":"100px"},"children":[{"id":"col-row-1776266333931-134-1","type":"col","span":12,"children":[{"id":"comp-1776266336767-611","type":"heading","config":{"variant":"premium","content":"Nuevo Título Editorial","titleMain":"Pasión por Crear","titleHighlight":"Momentos Eternos","subtitle":"NUESTRA ESENCIA","description":"En ArchiPlanner, no solo organizamos eventos; diseñamos experiencias que perduran en la memoria.","fontSize":"56px","textColor":"#FFFFFF","textAlign":"left","fontWeight":"800"}}],"config":{}}]},{"id":"row-1776266359998-695","type":"row","config":{"bgType":"color","bgColor":"#0b0b0b","paddingTop":"0","paddingBottom":"50px"},"children":[{"id":"col-row-1776266359998-695-1","type":"col","span":12,"children":[{"id":"comp-1776266367022-282","type":"text","config":{"content":"<h2>Más que Planeación,\nson Experiencias</h2>\n\n</p>Nacimos de la idea de que cada celebración es una obra de arte única. Nuestro enfoque editorial y nuestra obsesión por el detalle nos permiten elevar hitos tradicionales a experiencias cinematográficas.</p>\n\n<p>Creemos en la elegancia del minimalismo, en la calidez de lo auténtico y en la perfección de lo planeado con alma.</p>","textColor":"#AAAAAA"}}],"config":{}}]},{"id":"row-1776266471731-476","type":"row","config":{"bgType":"color","bgColor":"#0b0b0b","paddingTop":"0","paddingBottom":"100px"},"children":[{"id":"col-row-1776266471731-476-1","type":"col","span":12,"children":[{"id":"comp-1776266476382-4","type":"image","config":{"src":"","alt":"Diseño ArchiPlanner","media_path":"/uploads/gallery/1776266525579-267203652.avif"}}],"config":{}}]},{"id":"row-1776266536926-119","type":"row","config":{"paddingTop":"12px","paddingBottom":"120px","isFullWidth":true,"bgType":"color","bgColor":"#0b0b0b"},"children":[{"id":"col-row-1776266536926-119-1","type":"col","span":12,"children":[{"id":"comp-1776266542167-862","type":"PULSE","config":{"title":"El Pulse de cada Evento","tag":"VIVIMOS EL MÉTODO","closingPhrase":"Vivimos el pulse de cada evento...","bgColor":"#2c2c2c","paddingTop":"0px","paddingRight":"0px","paddingBottom":"0px","paddingLeft":"0px","animation":"slide-up"}}],"config":{}}]}]', '{"canvasBg":"#FFFFFF","canvasText":"#121212"}', 'Nosotros', '', '', 0),
(6, 'Servicios', 'servicios', '', '2026-04-15 13:52:35', 'Admin', 1, 'publicado', '[{"id":"row-1776265899319-126","type":"row","config":{"bgType":"color","bgColor":"#0b0b0b","paddingBottom":"0px"},"children":[{"id":"col-row-1776265899319-126-1","type":"col","span":12,"children":[{"id":"comp-1776265939238-403","type":"heading","config":{"variant":"premium","content":"Nuevo Título Editorial","titleMain":"Eventos que Cuentan","titleHighlight":"Historias Únicas","subtitle":"Propuesta de Valor","description":"Desde grandes hitos hasta los momentos más íntimos, curamos cada detalle para lograr la perfección.","fontSize":"56px","textColor":"#FFFFFF","textAlign":"left","fontWeight":"800"}}],"config":{}}]},{"id":"row-1776265905815-553","type":"row","config":{"bgType":"color","bgColor":"#0b0b0b"},"children":[{"id":"col-row-1776265905815-553-1","type":"col","span":12,"children":[{"id":"comp-1776266103247-575","type":"heading","config":{"variant":"standard","content":"Grandes Hitos","titleMain":"Pasión por Crear","titleHighlight":"Momentos Eternos","subtitle":"principales","description":"En ArchiPlanner, no solo organizamos eventos; diseñamos experiencias que perduran en la memoria.","fontSize":"56px","textColor":"#FFFFFF","textAlign":"center","fontWeight":"800"}},{"id":"comp-1776266073726-540","type":"query-grid-v4","config":{"source":"servicios","columns":3,"limit":6,"cardStyle":{"style":"boxed","shape":"rounded","alignment":"left","layout":"vertical","showLink":true},"sectionFilter":"principales"}}],"config":{}}]},{"id":"row-1776266147659-131","type":"row","config":{"bgType":"color","bgColor":"#141414"},"children":[{"id":"col-row-1776266147659-131-1","type":"col","span":12,"children":[{"id":"comp-1776266147659-3759","type":"heading","config":{"variant":"standard","content":"Sociales y Familiares","titleMain":"Pasión por Crear","titleHighlight":"Momentos Eternos","subtitle":"intimos","description":"En ArchiPlanner, no solo organizamos eventos; diseñamos experiencias que perduran en la memoria.","fontSize":"56px","textColor":"#FFFFFF","textAlign":"center","fontWeight":"800"}},{"id":"comp-1776266147659-7924","type":"query-grid-v4","config":{"source":"servicios","columns":3,"limit":6,"cardStyle":{"style":"boxed","shape":"rounded","alignment":"left","layout":"horizontal-left","showLink":true},"sectionFilter":"sociales"}}],"config":{}}]},{"id":"row-1776266192335-560","type":"row","config":{"bgType":"color","bgColor":"#0b0b0b"},"children":[{"id":"col-row-1776266192335-560-1","type":"col","span":12,"children":[{"id":"comp-1776266200531-85","type":"cta-phone-v4","config":{"title":"¿Listo para elevar tu evento?","hook":"EMPIEZA AHORA","closure":"Diseñamos y planificamos cada detalle para que tú solo disfrutes. Tu visión, nuestra magia.","buttonLabel":"Reserva tu fecha mágica","actionType":"whatsapp","whatsappMessage":"Hola, me interesa ArchiPlanner para mi evento","customPhone":"","phoneVideo":"/uploads/gallery/1776062620216-262690801.mp4","bgColor":"#121212","accentColor":"#e87c7c"}}],"config":{}}]}]', '{"canvasBg":"#FFFFFF","canvasText":"#121212"}', 'Servicios', '', '', 0),
(7, 'Contacto', 'contacto', 'Página de contacto editable sistema V4.', '2026-04-15 14:09:07', 'Admin', 1, 'publicado', '[{"id":"row-contact","type":"row","config":{"isFullWidth":true,"paddingTop":"0","paddingBottom":"0"},"children":[{"id":"col-contact","span":12,"config":{},"children":[{"id":"comp-contact","type":"contact-v4","config":{"heroTagline":"Experiencias de Lujo","heroTitle":"Hablemos de tu <br/><span>Próximo Hito</span>","infoTagline":"Exclusividad","infoTitle":"Conversemos","infoDescription":"Déjanos acompañarte en la creación de una experiencia inolvidable. Estamos listos para elevar tu visión y convertir tu próximo hito en algo legendario.","formTitle":"Envíanos un mensaje","submitText":"Solicitar Asesoría Exclusiva"}}]}]}]', '{"canvasBg":"#000000","canvasText":"#ffffff"}', 'Contacto', '', '', 0),
(8, 'Política de Privacidad', 'privacidad', 'Términos de privacidad y manejo de datos personales.', '2026-04-15 15:09:16', 'Admin', 0, 'publicado', '[{"id":"row1","config":{},"children":[{"id":"col1","span":12,"children":[{"id":"title1","type":"text","config":{"content":"<h1 style=\"font-size: 48px; text-align: center; margin-bottom: 40px;\">Política de Privacidad</h1>","textAlign":"center"}},{"id":"text1","type":"text","config":{"content":"\n                                        <h3>1. Información que Recolectamos</h3>\n                                        <p>En ArchiPlanner, recolectamos información personal que nos proporcionas directamente para la planificación de tu evento, incluyendo nombre, correo electrónico, teléfono y detalles específicos de la celebración.</p>\n                                        <br/>\n                                        <h3>2. Uso de la Información</h3>\n                                        <p>Utilizamos tus datos exclusivamente para gestionar las cotizaciones, coordinar con proveedores externos autorizados y mantener comunicación sobre el progreso del evento.</p>\n                                        <br/>\n                                        <h3>3. Protección de Datos</h3>\n                                        <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tu información contra acceso no unauthorized o pérdida accidental.</p>\n                                        <br/>\n                                        <h3>4. Cookies</h3>\n                                        <p>Nuestro sitio utiliza cookies para mejorar la experiencia de navegación y analizar el tráfico de forma anónima.</p>\n                                    ","fontSize":"16px","textColor":"#ffffff","textAlign":"left"}}]}]}]', '{"canvasBg":"#0a0a0b","canvasText":"#ffffff"}', 'Privacidad', '', '', 0),
(9, 'Protección y Términos', 'proteccion', 'Condiciones generales de servicio y protección al consumidor.', '2026-04-15 15:10:18', 'Admin', 0, 'publicado', '[{"id":"row1","config":{},"children":[{"id":"col1","span":12,"children":[{"id":"title1","type":"text","config":{"content":"<h1 style=\"font-size: 48px; text-align: center; margin-bottom: 40px;\">Protección y Términos</h1>","textAlign":"center"}},{"id":"text1","type":"text","config":{"content":"\n                                        <h3>1. Aceptación de Términos</h3>\n                                        <p>Al contratar los servicios de ArchiPlanner, el cliente acepta los términos y condiciones aquí descritos para la planeación y ejecución de eventos.</p>\n                                        <br/>\n                                        <h3>2. Reservas y Pagos</h3>\n                                        <p>Toda reserva requiere un abono inicial para garantizar la fecha. Los pagos posteriores deberán realizarse según el cronograma acordado en la cotización oficial.</p>\n                                        <br/>\n                                        <h3>3. Política de Cancelación</h3>\n                                        <p>Las cancelaciones por parte del cliente estarán sujetas a penalidades proporcionales al tiempo de anticipación y los gastos ya incurridos con proveedores.</p>\n                                        <br/>\n                                        <h3>4. Responsabilidad</h3>\n                                        <p>ArchiPlanner actúa como intermediario y coordinador. No nos hacemos responsables por fallos directos de proveedores externos, aunque garantizamos la gestión de contingencias.</p>\n                                    ","fontSize":"16px","textColor":"#ffffff","textAlign":"left"}}]}]}]', '{"canvasBg":"#0a0a0b","canvasText":"#ffffff"}', 'Protección', '', '', 0);

DROP TABLE IF EXISTS `web_secciones`;
CREATE TABLE `web_secciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pagina` varchar(50) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  `activo` tinyint(4) DEFAULT 1,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `web_secciones` (`id`, `pagina`, `tipo`, `orden`, `activo`, `metadata`, `created_at`) VALUES 
(6, 'about', 'header', 1, 1, NULL, '2026-04-08 08:01:04'),
(7, 'about', 'historia', 2, 1, NULL, '2026-04-08 08:01:04'),
(8, 'about', 'pulse', 3, 1, NULL, '2026-04-08 08:01:04'),
(9, 'galeria', 'services', 1, 1, '{"titulo":"Boda Sergio y Dayana","estilos":{"paddingTop":"25px","paddingBottom":"25px","bgColor":"#712d2d"}}', '2026-04-09 16:26:51'),
(11, 'home', 'stories', 4, 1, '{"titulo":"Nuestras Historias","estilos":{"paddingTop":"80px","paddingBottom":"80px","bgColor":"#080808"}}', '2026-04-09 18:52:09'),
(12, 'home', 'servicios', 3, 1, '{"titulo":"Nuestros Servicios","estilos":{"paddingTop":"100px","paddingBottom":"100px"}}', '2026-04-09 18:52:09'),
(13, 'home', 'valores', 5, 1, '{"titulo":"Nuestros Valores","estilos":{"paddingTop":"80px","paddingBottom":"80px"}}', '2026-04-09 18:52:09'),
(14, 'home', 'pulse', 7, 1, '{"titulo":"El Pulso ArchiPlanner","estilos":{"paddingTop":"120px","paddingBottom":"120px"}}', '2026-04-09 18:52:09'),
(15, 'home', 'cta', 6, 1, '{"cta_slug":"bento_cta_main","estilos":{"paddingTop":"80px","paddingBottom":"120px"}}', '2026-04-09 18:52:09'),
(16, 'home', 'HERO_MODERN', 2, 1, '{"titulo":"Creamos Historias Inolvidables","estilos":{"paddingTop":"80px","paddingBottom":"80px","bgColor":"#111112"},"subtitulo":"Diseño editorial y curaduría de eventos para almas sofisticadas","media_path":"/uploads/gallery/hero-1775769121876-908314599.avif"}', '2026-04-09 21:05:59'),
(21, 'final-test', 'GRID_LAYOUT', 3, 1, '{"titulo":"Historias","columnas":[{"elementos":[{"id":"nested-1775810832929","tipo":"VIDEO_REELS","metadata":{"titulo":"Historias en Movimiento","items":[]}}]},{"elementos":[{"id":"nested-1775810808674","tipo":"VIDEO_REELS","metadata":{"titulo":"Historias en Movimiento","items":[]}}]},{"elementos":[{"id":"nested-1775810846602","tipo":"IMAGE","metadata":{"titulo":"Captura Visual","media_path":"","estilos":{"borderRadius":"20px","overflow":"hidden"}}}]},{"elementos":[{"id":"nested-1775810858441","tipo":"IMAGE","metadata":{"titulo":"Captura Visual","media_path":"","estilos":{"borderRadius":"20px","overflow":"hidden"}}}]}],"estilos":{"paddingTop":"80px","paddingBottom":"80px","gap":"40px","gridDirection":"row"},"media_path":"/uploads/gallery/hero-1775810869152-954930689.png"}', '2026-04-10 08:43:08'),
(22, 'home', 'COLUMNS_2', 7, 1, '{"titulo":"Layout 2 Columnas","columnas":[{"elementos":[]},{"elementos":[]},{"elementos":[]},{"elementos":[]}],"estilos":{"paddingTop":"60px","paddingBottom":"60px","gap":"30px","gridDirection":"row"}}', '2026-04-10 08:46:11');

SET FOREIGN_KEY_CHECKS = 1;
