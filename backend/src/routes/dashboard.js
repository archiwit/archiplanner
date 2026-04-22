const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET api/dashboard/stats
// @desc    Obtener estadísticas rápidas para los KPIs
router.get('/stats', async (req, res) => {
    try {
        const u_id = req.query.u_id;
        
        // 1. Clientes totales (Prospectos)
        const qClientes = u_id 
            ? 'SELECT COUNT(*) as count FROM clientes WHERE u_id = ?'
            : 'SELECT COUNT(*) as count FROM clientes';
        const [clientes] = await db.query(qClientes, u_id ? [u_id] : []);
        
        // 2. Cotizaciones totales
        const qCotizaciones = u_id
            ? 'SELECT COUNT(*) as count FROM cotizaciones WHERE u_id = ?'
            : 'SELECT COUNT(*) as count FROM cotizaciones';
        const [cotizaciones] = await db.query(qCotizaciones, u_id ? [u_id] : []);
        
        // 3. Monto total aprobado (Facturación Histórica)
        const qAprobado = u_id
            ? "SELECT SUM(monto_final) as total FROM cotizaciones WHERE u_id = ? AND estado IN ('aprobada', 'facturada', 'contratada')"
            : "SELECT SUM(monto_final) as total FROM cotizaciones WHERE estado IN ('aprobada', 'facturada', 'contratada')";
        const [aprobado] = await db.query(qAprobado, u_id ? [u_id] : []);
        
        // 4. Inventativo (Artículos)
        const [articulos] = await db.query('SELECT COUNT(*) as count FROM articulos');
        
        // 4b. Proveedores
        const [resultProv] = await db.query('SELECT COUNT(*) as count FROM proveedores');
        const countProv = resultProv[0]?.count || 0;
        
        console.log(`[DEBUG-STATS] Proveedores: ${countProv}, Articulos: ${articulos[0].count}`);

        // 5. Próximos Eventos
        const qProximos = u_id
            ? "SELECT COUNT(*) as count FROM cotizaciones WHERE u_id = ? AND fevent >= CURDATE() AND fevent <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND estado IN ('aprobada', 'contratada')"
            : "SELECT COUNT(*) as count FROM cotizaciones WHERE fevent >= CURDATE() AND fevent <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND estado IN ('aprobada', 'contratada')";
        const [proximos] = await db.query(qProximos, u_id ? [u_id] : []);

        // 6. Arriendos Actuales
        const qFuera = u_id
            ? "SELECT COUNT(*) as count FROM cotizaciones WHERE u_id = ? AND clase = 'arriendo' AND estado = 'contratada' AND CURDATE() BETWEEN fevent AND fevent_fin"
            : "SELECT COUNT(*) as count FROM cotizaciones WHERE clase = 'arriendo' AND estado = 'contratada' AND CURDATE() BETWEEN fevent AND fevent_fin";
        const [arriendosFuera] = await db.query(qFuera, u_id ? [u_id] : []);

        // 7. Devoluciones Tardías
        const qTardias = u_id
            ? "SELECT COUNT(*) as count FROM cotizaciones WHERE u_id = ? AND clase = 'arriendo' AND estado = 'contratada' AND CURDATE() > fevent_fin"
            : "SELECT COUNT(*) as count FROM cotizaciones WHERE clase = 'arriendo' AND estado = 'contratada' AND CURDATE() > fevent_fin";
        const [tardias] = await db.query(qTardias, u_id ? [u_id] : []);

        // 8. Egresos e Ingresos Mensuales para Utilidad (Solo si es global/admin)
        let egresosStats = { total: 0, actual: 0, anterior: 0 };
        let utilidad = { total: 0, actual: 0, anterior: 0 };

        if (!u_id) {
            // Egresos (Gastos)
            const [eTotal] = await db.query("SELECT SUM(monto) as total FROM gastos");
            const [eMesActual] = await db.query("SELECT SUM(monto) as total FROM gastos WHERE DATE_FORMAT(fgasto, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')");
            const [eMesAnterior] = await db.query("SELECT SUM(monto) as total FROM gastos WHERE DATE_FORMAT(fgasto, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')");
            
            egresosStats = {
                total: eTotal[0].total || 0,
                actual: eMesActual[0].total || 0,
                anterior: eMesAnterior[0].total || 0
            };

            // Ingresos Mensuales (Cotizaciones aprobadas)
            const incomeQuery = "SELECT SUM(monto_final) as total FROM cotizaciones WHERE estado IN ('aprobada', 'facturada', 'contratada') AND DATE_FORMAT(fcoti, '%Y-%m') = ";
            const [iMesActual] = await db.query(incomeQuery + "DATE_FORMAT(CURDATE(), '%Y-%m')");
            const [iMesAnterior] = await db.query(incomeQuery + "DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')");
            
            const incomeActual = iMesActual[0].total || 0;
            const incomeAnterior = iMesAnterior[0].total || 0;
            const incomeTotal = aprobado[0].total || 0;

            utilidad = {
                total: incomeTotal - egresosStats.total,
                actual: incomeActual - egresosStats.actual,
                anterior: incomeAnterior - egresosStats.anterior
            };
        }

        res.json({
            clientes: clientes[0].count,
            cotizaciones: cotizaciones[0].count,
            facturacion: aprobado[0].total || 0,
            servicios: articulos[0].count,
            proveedores: countProv,
            pendientes: proximos[0].count,
            arriendos_fuera: arriendosFuera[0].count,
            devoluciones_tardias: tardias[0].count,
            egresos: egresosStats,
            utilidad: utilidad
        });
    } catch (err) {
        console.error('[DASHBOARD STATS ERROR]', err);
        res.status(500).json({ error: err.message });
    }
});

// @route   GET api/dashboard/charts
// @desc    Datos para gráficos (Ingresos vs Gastos, Distribución por Tipo)
router.get('/charts', async (req, res) => {
    try {
        const { u_id } = req.query;
        const filter = u_id ? ' AND u_id = ?' : '';
        const params = u_id ? [u_id] : [];

        // 1. Ingresos por mes (últimos 6 meses)
        const [ingresos] = await db.query(`
            SELECT 
                DATE_FORMAT(fcoti, '%Y-%m') as mes,
                SUM(monto_final) as valor
            FROM cotizaciones 
            WHERE estado IN ('aprobada', 'facturada', 'contratada')
            AND fcoti >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            ${filter}
            GROUP BY mes
            ORDER BY mes ASC
        `, params);

        // 2. Gastos por mes (últimos 6 meses)
        const [gastos] = await db.query(`
            SELECT 
                DATE_FORMAT(fgasto, '%Y-%m') as mes,
                SUM(monto) as valor
            FROM gastos
            WHERE fgasto >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            ${filter}
            GROUP BY mes
            ORDER BY mes ASC
        `, params);

        // 3. Distribución por Tipo de Evento
        const [distribucion] = await db.query(`
            SELECT 
                tipo_evento as name,
                COUNT(*) as value
            FROM cotizaciones
            WHERE tipo_evento IS NOT NULL AND tipo_evento != ''
            ${filter}
            GROUP BY tipo_evento
            ORDER BY value DESC
            LIMIT 5
        `, params);

        // 4. Rendimiento del Equipo (Solo Admin)
        let teamPerformance = [];
        if (!u_id) {
            const [team] = await db.query(`
                SELECT 
                    u.nombre as name,
                    COALESCE(SUM(CASE WHEN c.estado IN ('aprobada', 'facturada', 'contratada') THEN c.monto_final ELSE 0 END), 0) as monto,
                    COUNT(CASE WHEN c.estado IN ('aprobada', 'facturada', 'contratada') THEN 1 END) as closed,
                    COUNT(c.id) as total
                FROM usuarios u
                LEFT JOIN cotizaciones c ON u.id = c.u_id
                WHERE u.rol IN ('admin', 'superadmin', 'asesor_arriendos', 'vendedor', 'administrador')
                GROUP BY u.id, u.nombre
                ORDER BY monto DESC
                LIMIT 6
            `);
            teamPerformance = team;
            console.log(`[DEBUG-CHARTS] Team Performance rows: ${team.length}`);
            if(team.length > 0) console.log(`Top user: ${team[0].name} - Monto: ${team[0].monto}`);
        }

        // 4. Últimas actividades
        const [actividad] = await db.query(`
            SELECT 'cliente' as tipo, CONCAT(nombre, ' ', apellido) as titulo, estado as subtitulo, fcrea as fecha
            FROM clientes ${u_id ? 'WHERE u_id = ?' : ''}
            UNION ALL
            SELECT 'cotizacion' as tipo, num as titulo, estado as subtitulo, fcrea as fecha
            FROM cotizaciones ${u_id ? 'WHERE u_id = ?' : ''}
            ORDER BY fecha DESC
            LIMIT 8
        `, u_id ? [u_id, u_id] : []);

        res.json({
            ingresos: Array.isArray(ingresos) ? ingresos : [],
            gastos: Array.isArray(gastos) ? gastos : [],
            distribucion: Array.isArray(distribucion) ? distribucion : [],
            team: Array.isArray(teamPerformance) ? teamPerformance : [],
            actividad: Array.isArray(actividad) ? actividad : []
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// @route   GET api/dashboard/client/events/:cliId
// @desc    Obtener lista de eventos para un cliente específico
router.get('/client/events/:cliId', async (req, res) => {
    try {
        const cliId = req.params.cliId;
        // Consulta robusta: busca por ID de cliente, ID de usuario vinculado o cli_id directo en cotización
        const [rows] = await db.query(`
            SELECT 
                c.id, c.num, c.tematica, c.tipo_evento, c.fevent, c.lugar, 
                c.estado, c.fcrea, c.pdf_path, c.contrato_path,
                cl.nombre as cliente_nombre, cl.apellido as cliente_apellido
            FROM cotizaciones c
            INNER JOIN clientes cl ON c.cli_id = cl.id
            WHERE (cl.id = ? OR cl.u_id = ? OR c.cli_id = ?)
            ORDER BY COALESCE(c.fevent, c.fcrea) DESC
        `, [cliId, cliId, cliId]);
        res.json(rows);
    } catch (err) {
        console.error('[DASHBOARD] Error getting client events:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

