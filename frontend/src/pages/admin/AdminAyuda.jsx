import React from 'react';
import { 
    HelpCircle, Keyboard, MousePointer, Info, 
    BookOpen, Search, Plus, Save, FileText, 
    Users, Package, Truck, ExternalLink, ChevronRight,
    Calendar, DollarSign, ShieldCheck, Briefcase
} from 'lucide-react';

const AdminAyuda = () => {
    const shortcuts = [
        { key: 'Alt + N', action: 'Nuevo Registro', desc: 'Abre el formulario para crear un nuevo item (Actividad, Cliente, Cotización, etc.).' },
        { key: 'Alt + P', action: 'Buscar Producto', desc: 'En Cotizaciones, enfoca el buscador de items instantáneamente.' },
        { key: 'Alt + H', action: 'Centro de Ayuda', desc: 'Acceso directo a este manual desde cualquier parte del panel.' },
        { key: 'Alt + G', action: 'Sync Google', desc: 'En el Calendario, inicia el proceso de vinculación con Google Account.' },
        { key: 'Enter', action: 'Confirmar', desc: 'Guarda cambios en formularios rápidos o salta al siguiente campo.' },
        { key: 'Esc', action: 'Cerrar', desc: 'Cierra modales activos o cancela búsquedas en curso.' },
    ];

    const modulesDoc = [
        {
            title: 'Tiempos y Google Calendar',
            icon: <Calendar className="text-primary" />,
            content: 'Gestión centralizada de agenda. Sincroniza con Google Calendar usando la zona horaria America/Bogota (GMT-5). El sistema traduce automáticamente tipos de actividad a colores de Google: Citas (Lavanda), Reuniones (Arándano), Visitas (Salvia) y Eventos (Uva). Una vez conectado, el indicador circular cambiará a verde permanentemente.'
        },
        {
            title: 'Ingeniería de Cotizaciones (V4.6)',
            icon: <FileText className="text-primary" />,
            content: 'Crea propuestas premium con cálculo inteligente de IVA y margen de utilidad. Permite sincronizar cantidades globales por PAX (invitados) y reordenar ítems manualmente mediante "Drag & Drop". Las firmas digitales y el PDF se generan según el formato oficial YYMMDD.'
        },
        {
            title: 'Finanzas y ROI',
            icon: <DollarSign className="text-primary" />,
            content: 'Módulo de Egresos y Gastos de Empresa. Registra los costos directos de cada evento para obtener un Retorno de Inversión (ROI) visual en tiempo real. Diferencia entre gastos operacionales y costos específicos por contrato.'
        },
        {
            title: 'Equipo y Seguridad',
            icon: <ShieldCheck className="text-primary" />,
            content: 'Control de accesos y roles (Admin, Comercial, Logística). Administra el personal interno y proveedores de apoyo externos. Cada acción importante queda registrada para auditoría.'
        },
        {
            title: 'Logística y Arriendos',
            icon: <Truck className="text-primary" />,
            content: 'Control de inventario en tránsito. Administra fechas de despacho y retorno para evitar cruces en alquiler de mobiliario o locaciones. Incluye alertas de inventario bajo y disponibilidad crítica.'
        },
        {
            title: 'CRM y Clientes',
            icon: <Users className="text-primary" />,
            content: 'Base de datos centralizada con historial de eventos. El sistema permite vincular actividades de calendario directamente a un cliente o a una cotización específica para un seguimiento 360°.'
        }
    ];

    return (
        <div className="admin-page-container fade-in">
            <div className="admin-header-flex">
                <div>
                    <h1 className="admin-title">Manual de Operación ArchiPlanner</h1>
                    <p className="admin-subtitle">Documentación técnica y operativa V4.6 Onyx Rose</p>
                </div>
                <div className="status-badge" style={{ background: 'rgba(255, 132, 132, 0.1)', color: 'var(--color-primary)' }}>
                    <HelpCircle size={16} /> Soporte Activo
                </div>
            </div>

            <div className="admin-grid-cards" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '30px', gap: '30px' }}>
                
                {/* Keyboard Shortcuts Section */}
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div className="icon-circle-bg"><Keyboard size={20} className="text-primary" /></div>
                        <h3 style={{ margin: 0 }}>Comandos y Atajos</h3>
                    </div>
                    
                    <div className="shortcuts-table">
                        {shortcuts.map((s, idx) => (
                            <div key={idx} style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '130px 1fr', 
                                gap: '20px', 
                                padding: '16px 0',
                                borderBottom: idx === shortcuts.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <kbd style={{
                                    background: 'rgba(255, 132, 132, 0.2)',
                                    color: 'var(--color-primary)',
                                    padding: '5px 12px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    fontWeight: '900',
                                    border: '1px solid rgba(255, 132, 132, 0.3)',
                                    textAlign: 'center',
                                    height: 'fit-content',
                                    fontFamily: 'monospace'
                                }}>{s.key}</kbd>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px', color: '#fff' }}>{s.action}</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5' }}>{s.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Module Documentation Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <h3 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BookOpen size={20} className="text-primary" /> Enfoque de Áreas
                    </h3>
                    <div className="modules-scrollable" style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '700px', overflowY: 'auto', paddingRight: '10px' }}>
                        {modulesDoc.map((m, idx) => (
                            <div key={idx} className="glass-panel" style={{ padding: '20px', borderLeft: '3px solid var(--color-primary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    {m.icon}
                                    <h4 style={{ margin: 0, fontSize: '15px', color: '#fff' }}>{m.title}</h4>
                                </div>
                                <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: '1.6' }}>
                                    {m.content}
                                </p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="totals-panel" style={{ background: 'rgba(255, 132, 132, 0.05)', border: '1px dashed rgba(255, 132, 132, 0.2)' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <Info size={18} className="text-primary" />
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                                <b>Estándar ArchiPlanner:</b> Todas las fechas y horas se procesan bajo el estándar de Bogotá. La sincronización con Google ocurre en tiempo real al Guardar o Editar una actividad.
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <footer style={{ marginTop: '50px', pb: '30px', textAlign: 'center', opacity: 0.3, fontSize: '10px', letterSpacing: '1px' }}>
                ARCHIPLANNER AG • CORE V4.6 • PROCESOS DISRUPTIVOS PARA EVENTOS DE ÉLITE
            </footer>
        </div>
    );
};

export default AdminAyuda;
