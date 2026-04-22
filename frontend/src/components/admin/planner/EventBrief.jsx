import React, { useState, useEffect } from 'react';
import { 
    Printer, 
    FileText, 
    Users, 
    Box, 
    Clock, 
    MapPin, 
    Calendar,
    CheckSquare,
    Package,
    Truck,
    Info
} from 'lucide-react';
import cotizacionService from '../../../services/cotizacionService';
import itinerarioService from '../../../services/itinerarioService';
import itemClaveService from '../../../services/itemClaveService';
import layoutService from '../../../services/layoutService';

const EventBrief = ({ cotId }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        event: null,
        itinerary: [],
        keyItems: [],
        layouts: [],
        materialsSummary: {},
        providers: []
    });

    useEffect(() => {
        if (cotId) {
            loadBriefData();
        }
    }, [cotId]);

    const loadBriefData = async () => {
        setLoading(true);
        try {
            // 1. Cargar Datos Base (Evento y Cotización)
            const eventRes = await cotizacionService.getById(cotId);
            
            // 2. Cargar Itinerario y Protocolo
            const [itRes, keyRes, layoutsRes] = await Promise.all([
                itinerarioService.getByEvent(cotId),
                itemClaveService.getByEvent(cotId),
                layoutService.getByEvent(cotId)
            ]);

            // 3. Cargar Elementos de cada Layout para consolidar materiales
            const layoutsArray = Array.isArray(layoutsRes) ? layoutsRes : [];
            const layoutsWithElements = await Promise.all(
                layoutsArray.map(async (l) => {
                    const elementsRaw = await layoutService.getElements(l.id);
                    const elements = Array.isArray(elementsRaw) ? elementsRaw : [];
                    return { ...l, elements };
                })
            );

            // 4. Consolidar Materiales Totales
            const materialsMap = {};
            layoutsWithElements.forEach(l => {
                // Sumar materiales globales del plano (si existen)
                if (l.materiales_globales) {
                    try {
                        const globalMats = JSON.parse(l.materiales_globales);
                        if (Array.isArray(globalMats)) {
                            globalMats.forEach(m => {
                                const key = m.nombre?.toLowerCase().trim() || 'desconocido';
                                if (!materialsMap[key]) materialsMap[key] = { nombre: m.nombre, cantidad: 0, unidad: m.unidad || 'und' };
                                materialsMap[key].cantidad += parseFloat(m.cantidad || 0);
                            });
                        }
                    } catch (e) { console.warn("Error parsing global materials", e); }
                }

                // Sumar elementos interactivos puestos en el plano
                if (Array.isArray(l.elements)) {
                    l.elements.forEach(el => {
                        const key = el.tipo?.toLowerCase().trim() || 'item';
                        if (!materialsMap[key]) materialsMap[key] = { nombre: el.tipo, cantidad: 0, unidad: 'und' };
                        materialsMap[key].cantidad += 1;
                        // Si tiene puestos asociados (ej: mesas), sumarlos
                        if (el.puestos > 0) {
                            const pKey = 'Puestos / Invitados';
                            if (!materialsMap[pKey]) materialsMap[pKey] = { nombre: 'Puestos Totales', cantidad: 0, unidad: 'puestos' };
                            materialsMap[pKey].cantidad += el.puestos;
                        }
                    });
                }
            });

            // 5. Extraer Proveedores únicos de la cotización
            const providersMap = new Map();
            if (eventRes && Array.isArray(eventRes.detalles)) {
                eventRes.detalles.forEach(d => {
                    if (d.nombre_proveedor) {
                        providersMap.set(d.nombre_proveedor, {
                            nombre: d.nombre_proveedor,
                            servicios: (providersMap.get(d.nombre_proveedor)?.servicios || [])
                        });
                        providersMap.get(d.nombre_proveedor).servicios.push(d.nombre);
                    }
                });
            }

            setData({
                event: eventRes,
                itinerary: Array.isArray(itRes) ? itRes.sort((a,b) => (a.hora || '').localeCompare(b.hora || '')) : [],
                keyItems: Array.isArray(keyRes) ? keyRes : [],
                layouts: layoutsWithElements,
                materialsSummary: materialsMap,
                providers: Array.from(providersMap.values())
            });

        } catch (err) {
            console.error("Error al cargar datos del brief:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;
    if (!data.event) return <div className="no-data-msg">No se encontró información del evento.</div>;

    const { event, itinerary, keyItems, layouts, materialsSummary, providers } = data;

    return (
        <div className="event-brief-container">
            {/* Toolbar exclusivo para pantalla */}
            <div className="brief-toolbar no-print">
                <button className="btn-v4 btn-v4-primary" onClick={handlePrint}>
                    <Printer size={18} /> Imprimir Brief Operativo
                </button>
            </div>

            <div className="brief-paper">
                {/* CABECERA PRINCIPAL */}
                <header className="brief-header">
                    <div className="header-meta">
                        <span className="event-type">{event.tipo_evento}</span>
                        <div className="brief-stamp">PRODUCCIÓN / USO INTERNO</div>
                    </div>
                    <h1 className="event-title">{event.titulo}</h1>
                    <div className="client-names">
                        Orden de Producción: {event.cliente_nombre} {event.cliente_apellido}
                    </div>
                </header>

                {/* SECCIÓN 1: DATOS CLAVE */}
                <section className="brief-section">
                    <h3 className="section-title"><Info size={16} /> Información del Evento</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Fecha del Evento</label>
                            <span>{new Date(event.fevent).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="info-item">
                            <label>Invitados (PAX)</label>
                            <span>{event.num_adultos + event.num_ninos} Personas ({event.num_adultos} Adultos / {event.num_ninos} Niños)</span>
                        </div>
                        <div className="info-item">
                            <label>Hora Inicio / Fin</label>
                            <span>{event.hora_inicio || '--:--'} - {event.hora_fin || '--:--'}</span>
                        </div>
                        <div className="info-item">
                            <label>Locación / Lugar</label>
                            <span>{event.lugar}</span>
                        </div>
                    </div>
                </section>

                <div className="brief-columns">
                    {/* COLUMNA IZQUIERDA: PROTOCOLO Y STAFF */}
                    <div className="brief-col-left">
                        {/* PUNTOS CLAVE / PROTOCOLO */}
                        <section className="brief-section">
                            <h3 className="section-title"><CheckSquare size={16} /> Protocolo y Puntos Clave</h3>
                            <ul className="technical-list">
                                {(Array.isArray(keyItems) ? keyItems : []).map(item => (
                                    <li key={item.id}>
                                        <strong>{item.titulo}:</strong> {item.valor || 'Pendiente'}
                                    </li>
                                ))}
                                {(!Array.isArray(keyItems) || keyItems.length === 0) && <li className="empty">No hay puntos clave registrados.</li>}
                            </ul>
                        </section>

                        {/* PROVEEDORES Y STAFF */}
                        <section className="brief-section">
                            <h3 className="section-title"><Truck size={16} /> Proveedores Externos</h3>
                            <div className="providers-grid">
                                {(Array.isArray(providers) ? providers : []).map((p, i) => (
                                    <div key={i} className="provider-card">
                                        <strong>{p.nombre}</strong>
                                        <p>{Array.isArray(p.servicios) ? [...new Set(p.servicios)].join(', ') : 'Sin servicios'}</p>
                                    </div>
                                ))}
                                {(!Array.isArray(providers) || providers.length === 0) && <p className="empty">No hay proveedores asignados en la cotización.</p>}
                            </div>
                        </section>
                    </div>

                    {/* COLUMNA DERECHA: LOGÍSTICA DE ÁREAS */}
                    <div className="brief-col-right">
                        <section className="brief-section">
                            <h3 className="section-title"><MapPin size={16} /> Montaje y Áreas (360)</h3>
                            <div className="layouts-technical">
                                {(Array.isArray(layouts) ? layouts : []).map(l => (
                                    <div key={l.id} className="layout-tech-card">
                                        <div className="layout-tech-header">
                                            <h4>{l.nombre}</h4>
                                            <span>{l.ancho_metros}x{l.largo_metros}m</span>
                                        </div>
                                        {l.notas_montaje && (
                                            <div className="layout-notes">
                                                <strong>Instrucciones:</strong>
                                                <p>{l.notas_montaje}</p>
                                            </div>
                                        )}
                                        <div className="layout-elements-mini">
                                            <strong>Elementos:</strong> {Array.isArray(l.elements) ? l.elements.length : 0} objetos en plano.
                                        </div>
                                    </div>
                                ))}
                                {(!Array.isArray(layouts) || layouts.length === 0) && <p className="empty">Sin áreas diseñadas en el mapa 360.</p>}
                            </div>
                        </section>

                        {/* RECURSOS TOTALES */}
                        <section className="brief-section">
                            <h3 className="section-title"><Package size={16} /> Listado de Materiales (Totales)</h3>
                            <div className="materials-table">
                                <div className="m-header">
                                    <span>Recurso</span>
                                    <span>Cant.</span>
                                </div>
                                {Object.values(materialsSummary).map((m, i) => (
                                    <div key={i} className="m-row">
                                        <span>{m.nombre}</span>
                                        <strong>{m.cantidad} {m.unidad}</strong>
                                    </div>
                                ))}
                                {Object.keys(materialsSummary).length === 0 && <p className="empty">No hay materiales registrados.</p>}
                            </div>
                        </section>
                    </div>
                </div>

                {/* ITINERARIO COMPLETO (FULL WIDTH) */}
                <section className="brief-section itinerary-section">
                    <h3 className="section-title"><Clock size={16} /> Itinerario de Operación (Cronograma)</h3>
                    <table className="brief-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>HORA</th>
                                <th>ACTIVIDAD / DESCRIPCIÓN</th>
                                <th style={{ width: '150px' }}>RESPONSABLE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(Array.isArray(itinerary) ? itinerary : []).map(item => (
                                <tr key={item.id}>
                                    <td className="t-time">{item.hora?.slice(0, 5)}</td>
                                    <td className="t-desc">
                                        <strong>{item.titulo}</strong>
                                        <p>{item.descripcion || 'Sin descripción adicional.'}</p>
                                    </td>
                                    <td className="t-resp">{item.responsable || '--'}</td>
                                </tr>
                            ))}
                            {(!Array.isArray(itinerary) || itinerary.length === 0) && (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '30px', opacity: 0.5 }}>
                                        No se ha creado el itinerario para este evento.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>

                {/* OBSERVACIONES FINALES */}
                <section className="brief-section">
                    <h3 className="section-title"><FileText size={16} /> Observaciones Administrativas</h3>
                    <div className="observations-box">
                        {event.notas || 'No hay notas administrativas registradas para este evento.'}
                    </div>
                </section>

                <footer className="brief-footer">
                    <p>Generado por ArchiPlanner 360 - {new Date().toLocaleString('es-ES')}</p>
                </footer>
            </div>

            <style>{`
                .event-brief-container {
                    padding: 20px;
                    background: #222;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .brief-toolbar {
                    width: 100%;
                    max-width: 900px;
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 20px;
                }
                .brief-paper {
                    width: 100%;
                    max-width: 900px;
                    background: #fff;
                    color: #111;
                    padding: 50px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    font-family: 'Inter', sans-serif;
                    position: relative;
                }
                .brief-header {
                    border-bottom: 2px solid #000;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                }
                .header-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .event-type {
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #666;
                }
                .brief-stamp {
                    font-size: 10px;
                    font-weight: 800;
                    padding: 4px 10px;
                    border: 1px solid #111;
                }
                .event-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 42px;
                    margin: 0;
                    font-weight: 400;
                    color: #000;
                }
                .client-names {
                    font-size: 16px;
                    font-weight: 700;
                    color: #555;
                    text-transform: uppercase;
                    margin-top: 5px;
                }

                .brief-section { margin-bottom: 35px; }
                .section-title {
                    font-size: 14px;
                    font-weight: 700;
                    text-transform: uppercase;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 5px;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }
                .info-item label {
                    display: block;
                    font-size: 10px;
                    text-transform: uppercase;
                    font-weight: 700;
                    color: #999;
                }
                .info-item span {
                    font-size: 14px;
                    font-weight: 600;
                    color: #111;
                }

                .brief-columns {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                }

                .technical-list { list-style: none; padding: 0; margin: 0; }
                .technical-list li {
                    padding: 8px 0;
                    border-bottom: 1px solid #f9f9f9;
                    font-size: 13px;
                }
                .technical-list li strong { color: #555; }

                .providers-grid { display: flex; flex-direction: column; gap: 10px; }
                .provider-card {
                    padding: 10px;
                    background: #fbfbfb;
                    border-left: 3px solid #eee;
                }
                .provider-card strong { font-size: 13px; display: block; }
                .provider-card p { font-size: 11px; margin: 0; color: #777; }

                .layouts-technical { display: flex; flex-direction: column; gap: 15px; }
                .layout-tech-card {
                    padding: 15px;
                    border: 1px solid #eee;
                    border-radius: 8px;
                }
                .layout-tech-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .layout-tech-header h4 { margin: 0; font-size: 15px; color: #000; }
                .layout-tech-header span { font-size: 11px; color: #999; }
                .layout-notes { margin-bottom: 10px; }
                .layout-notes strong { font-size: 11px; text-transform: uppercase; color: #999; }
                .layout-notes p { font-size: 12px; color: #444; margin: 3px 0; }
                .layout-elements-mini { font-size: 11px; color: #b76e79; }

                .materials-table { border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
                .m-header {
                    display: flex; justify-content: space-between; padding: 10px;
                    background: #f5f5f5; font-size: 11px; font-weight: 800; text-transform: uppercase;
                }
                .m-row {
                    display: flex; justify-content: space-between; padding: 8px 10px;
                    border-top: 1px solid #eee; font-size: 12px;
                }
                .m-row:nth-child(even) { background: #fafafa; }

                .brief-table { width: 100%; border-collapse: collapse; }
                .brief-table th {
                    text-align: left; background: #000; color: #fff; padding: 10px; font-size: 12px;
                }
                .brief-table td { padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 13px; }
                .t-time { font-weight: 700; color: #B76E79; font-family: monospace; }
                .t-desc strong { display: block; margin-bottom: 4px; }
                .t-desc p { margin: 0; font-size: 12px; color: #666; line-height: 1.4; }
                .t-resp { font-style: italic; color: #555; }

                .observations-box {
                    padding: 20px;
                    background: #f9f9f9;
                    border: 1px dashed #ddd;
                    font-size: 13px;
                    line-height: 1.6;
                    color: #444;
                }

                .brief-footer {
                    margin-top: 50px;
                    border-top: 1px solid #000;
                    padding-top: 10px;
                    display: flex;
                    justify-content: flex-end;
                }
                .brief-footer p { font-size: 10px; color: #999; margin: 0; }

                .empty { font-style: italic; opacity: 0.5; font-size: 12px; padding: 10px 0; }

                /* PRINT STYLES */
                @media print {
                    body * { visibility: hidden; }
                    .event-brief-container, .event-brief-container * { visibility: visible; }
                    .event-brief-container { 
                        position: absolute; left: 0; top: 0; width: 100%; padding: 0; background: #fff;
                    }
                    .brief-paper { 
                        max-width: 100% !important; box-shadow: none !important; padding: 0 !important;
                    }
                    .no-print { display: none !important; }
                    .brief-toolbar { display: none !important; }
                    
                    @page { size: portrait; margin: 15mm; }
                }
            `}</style>
        </div>
    );
};

export default EventBrief;
