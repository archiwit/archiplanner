import React from 'react';
import { 
    HelpCircle, Keyboard, MousePointer, Info, 
    BookOpen, Search, Plus, Save, FileText, 
    Users, Package, Truck, ExternalLink, ChevronRight
} from 'lucide-react';

const AdminAyuda = () => {
    const shortcuts = [
        { key: 'Alt + N', action: 'Nuevo Registro', desc: 'Abre el formulario/modal para crear un nuevo item (Cliente, Cotización, Plantilla, etc.) según el módulo actual.' },
        { key: 'Alt + P', action: 'Buscar / Nuevo Item', desc: 'En Cotizaciones y Plantillas, enfoca el buscador de productos instantáneamente.' },
        { key: 'Alt + H', action: 'Centro de Ayuda', desc: 'Te trae a esta página de documentación desde cualquier parte del panel administrativo.' },
        { key: 'Enter', action: 'Confirmar / Siguiente', desc: 'En formularios rápidos, confirma el valor actual o salta al siguiente campo relevante.' },
        { key: 'Esc', action: 'Cerrar / Cancelar', desc: 'Cierra modales de búsqueda o cancela acciones pendientes de selección.' },
    ];

    const modulesDoc = [
        {
            title: 'Módulo de Cotizaciones',
            icon: <FileText className="text-primary" />,
            content: 'Aquí puedes crear propuestas detalladas para tus clientes. Recuerda que puedes aplicar Plantillas Base para ahorrar tiempo. El sistema calcula automáticamente IVA, subtotales y permite sincronizar cantidades por PAX (invitados).'
        },
        {
            title: 'Gestión de Plantillas',
            icon: <BookOpen className="text-primary" />,
            content: 'Crea modelos pre-definidos que incluyen grupos de productos y servicios. Las plantillas te permiten estandarizar tus precios y asegurar que nada se olvide en una cotización estándar.'
        },
        {
            title: 'Inventario Unificado',
            icon: <Package className="text-primary" />,
            content: 'Administra tus "Artículos" (recursos propios) y "Locaciones". Puedes asignar proveedores externos o dejarlo por defecto como "ArchiPlanner". Los precios del inventario se sincronizan con las cotizaciones.'
        },
        {
            title: 'Clientes y CRM',
            icon: <Users className="text-primary" />,
            content: 'Lleva el registro de tus prospectos. Puedes crear clientes rápidamente usando el botón "+" dentro de una cotización si aún no están registrados.'
        }
    ];

    return (
        <div className="admin-page-container fade-in">
            <div className="admin-header-flex">
                <div>
                    <h1 className="admin-title">Centro de Ayuda y Atajos</h1>
                    <p className="admin-subtitle">Optimiza tu flujo de trabajo con ArchiPlanner V2</p>
                </div>
                <div className="status-badge" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-primary)' }}>
                    <HelpCircle size={16} /> Beta
                </div>
            </div>

            <div className="admin-grid-cards" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '30px' }}>
                
                {/* Keyboard Shortcuts Section */}
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div className="icon-circle-bg"><Keyboard size={20} className="text-primary" /></div>
                        <h3 style={{ margin: 0 }}>Atajos de Teclado</h3>
                    </div>
                    
                    <div className="shortcuts-table">
                        {shortcuts.map((s, idx) => (
                            <div key={idx} style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '120px 1fr', 
                                gap: '20px', 
                                padding: '16px 0',
                                borderBottom: idx === shortcuts.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <kbd style={{
                                    background: 'rgba(212, 175, 55, 0.2)',
                                    color: 'var(--color-primary)',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '800',
                                    border: '1px solid rgba(212, 175, 55, 0.3)',
                                    textAlign: 'center',
                                    height: 'fit-content'
                                }}>{s.key}</kbd>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{s.action}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', lineHeight: '1.5' }}>{s.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Module Documentation Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {modulesDoc.map((m, idx) => (
                        <div key={idx} className="glass-panel" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                {m.icon}
                                <h4 style={{ margin: 0 }}>{m.title}</h4>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--color-text-dim)', margin: 0, lineHeight: '1.6' }}>
                                {m.content}
                            </p>
                        </div>
                    ))}
                    
                    <div className="totals-panel" style={{ marginTop: 'auto', background: 'linear-gradient(45deg, rgba(212, 175, 55, 0.05), transparent)' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <Info size={18} className="text-primary" />
                            <div style={{ fontSize: '12px' }}>
                                <b>Consejo Pro:</b> Puedes arrastrar ítems dentro de una cotización para reordenarlos manualmente dentro de sus categorías usando el icono <MousePointer size={12} />.
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <footer style={{ marginTop: '40px', textAlign: 'center', opacity: 0.3, fontSize: '11px' }}>
                ArchiPlanner V2 • Documentación Interna para el Equipo Administrativo
            </footer>
        </div>
    );
};

export default AdminAyuda;
