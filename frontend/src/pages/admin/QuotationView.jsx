import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useAuth } from '../../context/AuthContext';
import { getUploadUrl } from '../../config';
import { parseDateSafe, formatDateSafe } from '../../utils/dateUtils';
import { User, Calendar, Clock, Users, Palette, Droplets, Tag, FileText, Printer, ArrowLeft, Mail, MapPin, Phone, MessageCircle, Download, X, Plus, Briefcase, History, Edit3, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import QuotationHistoryPanel from '../../components/admin/QuotationHistoryPanel';
import '../style/QuotationView.css';

const QuotationView = ({ isPrintView = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [freshConfig, setFreshConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [plantillaAdicionales, setPlantillaAdicionales] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const isArriendo = data?.clase === 'arriendo';
    const { cliente, detalles, num } = data || {};

    useEffect(() => {
        if (isPrintView && data) {
            const date = parseDateSafe(data.fevent);
            if (!date) return;

            const yy = date.getFullYear().toString().slice(-2);
            const mm = (date.getMonth() + 1).toString().padStart(2, '0');
            const dd = date.getDate().toString().padStart(2, '0');
            const dateStr = `${yy}${mm}${dd}`;

            const shortTypes = {
                'Quinceaños': 'XV', 'Boda': 'Boda', 'Baby shower': 'BabyShower',
                'Aniversario': 'Aniversario', 'Corporativo': 'Corpo', 'Cumpleaños': 'Cumple'
            };
            const tipoStr = isArriendo ? 'Arriendo' : (shortTypes[data.tipo_evento_nombre] || data.tipo_evento_nombre || 'Evento');
            const numStr = isArriendo ? (data.num_arriendo || data.num) : data.num;
            const clienteStr = cliente?.nombre || data.cliente_nombre || 'Cliente';
            const fileName = `${dateStr} • ${tipoStr} • ${numStr} • ${clienteStr}`;

            const originalTitle = document.title;
            document.title = fileName;

            const timer = setTimeout(() => {
                window.print();
                document.title = originalTitle;
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isPrintView, data]);

    useEffect(() => {
        const fetchQuotation = async () => {
            try {
                const res = await api.get(`/cotizaciones/${id}`);
                const coti = res.data;
                setData(coti);

                try {
                    const pRes = await api.get('/plantillas');
                    const adicTemplate = pRes.data.find(p => p.nombre.toLowerCase().includes('adicional'));
                    if (adicTemplate) {
                        const fullAdicRes = await api.get(`/plantillas/${adicTemplate.id}`);
                        setPlantillaAdicionales(fullAdicRes.data.detalles || []);
                    }
                } catch (e) {
                    console.warn("No se pudieron cargar plantillas adicionales:", e);
                }

                let confId = coti.conf_id || (coti.configuracion ? coti.configuracion.id : null);
                if (confId) {
                    try {
                        const confRes = await api.get(`/configuraciones/${confId}`);
                        setFreshConfig(confRes.data);
                    } catch (e) {
                        console.warn("No se pudo obtener config fresca, usando snapshot:", e);
                    }
                }
            } catch (err) {
                console.error('Error fetching quotation:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuotation();
    }, [id]);


    if (loading) return <div className="quotation-loading">Cargando...</div>;
    if (!data) return <div className="quotation-empty">Cotización no encontrada.</div>;

    const config = freshConfig || data.configuracion;

    const groupedDetalles = (detalles || []).reduce((acc, item) => {
        const cat = item.categoria || 'Servicios Generales';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    const formatCurrency = (value) => {
        const amount = parseFloat(value || 0);
        return amount.toLocaleString('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    const calculatedSubtotal = detalles.reduce((acc, item) => {
        const itemSub = parseFloat(item.subtotal || 0);
        if (itemSub > 0) return acc + itemSub;
        const price = parseFloat(item.precio_u || item.precio || 0);
        const qty = parseFloat(item.cantidad || 0);
        return acc + (price * qty);
    }, 0);

    const finalSubtotal = (data.subt && parseFloat(data.subt) > 0)
        ? parseFloat(data.subt)
        : calculatedSubtotal;

    const defaultPolicies = [
        'La vigencia de la oferta tiene un periodo de 15 días calendario a partir de su elaboración.',
        'Monto sujeto a cambio, según reajuste de precios a la fecha del Evento.',
        'El monto total no incluye el IVA.',
        'Monto no incluye Deposito.'
    ];

    const displayPolicies = config?.politicas_cotizacion
        ? config.politicas_cotizacion.split('\n')
        : defaultPolicies;

    const filteredAdicionals = plantillaAdicionales.filter(sug =>
        !detalles.some(det =>
            det.art_id === sug.art_id ||
            det.nombre.toUpperCase().includes(sug.nombre.toUpperCase())
        )
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return formatDateSafe(dateStr, {
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeStr) => {
        if (!timeStr || typeof timeStr !== 'string') return "00:00";
        // Si ya viene formateada o es un formato extraño, intentar parsear
        try {
            const parts = timeStr.split(':');
            if (parts.length < 2) return timeStr;
            const [hours, minutes] = parts;
            let h = parseInt(hours);
            const m = minutes || "00";
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12;
            h = h ? h : 12; // la hora '0' debe ser '12'
            const strTime = h.toString().padStart(2, '0') + ':' + m + ' ' + ampm;
            return strTime;
        } catch (e) {
            return timeStr;
        }
    };

    const brandStyles = {
        '--color-primary': config?.color_primario || '#ff8484',
        '--color-primary-hover': (config?.color_primario || '#ff6b6b') + 'dd',
        '--color-bg-page': config?.color_fondo || '#242424',
    };

    const nombresEvento = {
        'Quinceaños': 'XV Años',
        'Boda': 'Boda',
        'Baby shower': 'Baby Shower',
        'Aniversario': 'Aniversario',
        'Corporativo': 'Corporativo',
        'Cumpleaños': 'Cumpleaños',
    };
    const tituloEvento = isArriendo ? 'Detalle de Arriendo' : (data ? (nombresEvento[data.tipo_evento] || data.tipo_evento) : 'Evento');

    const handleDownloadPDF = () => {
        const printUrl = `/print-quotation/${id}`;
        window.open(printUrl, '_blank');
    };

    const handleWhatsAppShare = async () => {
        const phone = cliente?.telefono?.replace(/\D/g, '');
        if (!phone) {
            Swal.fire({
                title: 'Atención',
                text: "No hay teléfono registrado para este cliente.",
                icon: 'warning',
                confirmButtonColor: 'var(--color-primary, #ff8484)'
            });
            return;
        }

        // --- AUTOMATIZACIÓN DE ESTATUS ---
        try {
            if (cliente?.id) {
                await api.put(`/clientes/${cliente.id}/status`, { estado: 'Cotizando' });
            }
        } catch (err) {
            console.error('Error auto-updating status:', err);
        }

        const message = `Hola ${cliente?.nombre || data?.cliente_nombre || 'Cliente'}, adjunto la cotización para tu evento de ${data?.tipo_evento_nombre || 'Evento'} el día ${formatDateSafe(data?.fevent)}. Quedamos atentos a tus comentarios.`;
        const waUrl = `https://wa.me/57${phone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    return (
        <div className="quotation-view" style={brandStyles}>
            {!isPrintView && (
                <div className="quotation-actions">
                    <div className="actions-cluster">
                        {/* Primarios */}
                        <div className="action-circle-group">
                            <button className="circle-btn back" onClick={() => navigate('/admin/cotizaciones')} title="Volver">
                                <ArrowLeft size={20} />
                            </button>
                            <button className="circle-btn edit" onClick={() => navigate(isArriendo ? `/admin/arriendos/editar/${id}` : `/admin/cotizaciones/editar/${id}`)} title="Editar">
                                <Edit3 size={20} />
                            </button>
                        </div>

                        {/* Secundarios Expandibles */}
                        <motion.div 
                            className="expandable-actions"
                            initial={false}
                            animate={{ width: 'auto' }}
                        >
                            <button className="action-icon-btn whatsapp" onClick={handleWhatsAppShare} title="Compartir WhatsApp">
                                <MessageCircle size={18} />
                                <span>WhatsApp</span>
                            </button>
                            
                            <button className="action-icon-btn survey" onClick={() => {
                                const link = `${window.location.origin}/evaluacion/${id}`;
                                navigator.clipboard.writeText(link);
                                Swal.fire({
                                    title: 'Link Copiado',
                                    text: 'El enlace de la encuesta ha sido copiado al portapapeles.',
                                    icon: 'success',
                                    timer: 2000,
                                    showConfirmButton: false,
                                    toast: true,
                                    position: 'top-end'
                                });
                            }} title="Copiar Link de Encuesta">
                                <Star size={18} />
                                <span>Encuesta</span>
                            </button>

                            <button className="action-icon-btn planner" onClick={() => navigate(`/admin/planeador`)} title="Planeador 360">
                                <Briefcase size={18} />
                                <span>360</span>
                            </button>

                            <button className="action-icon-btn pdf" onClick={handleDownloadPDF} title="Descargar PDF">
                                <Download size={18} />
                                <span>PDF</span>
                            </button>

                            <button className="action-icon-btn contrato" onClick={() => window.open(`/admin/cotizaciones/${id}/contrato`, '_blank')} title="Contrato Legal">
                                <FileText size={18} />
                                <span>Contrato</span>
                            </button>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Hoja carta 1 • Portada */}
            <style>
                {`
                @media print {
                    @page { size: letter; margin: 0 !important; }
                    * { 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                    }
                    html, body { 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        width: 100% !important;
                        height: 100% !important;
                        background: #fff !important; 
                    }
                    #root, .quotation-view { 
                        background: transparent !important; 
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                    }
                    .quotation-actions { display: none !important; }
                    .quotation-page {
                        width: 100vw !important;
                        min-height: 100vh !important; /* Altura flexible para evitar solapamientos */
                        height: auto !important;
                        page-break-after: always;
                        overflow: visible !important;
                        position: relative;
                        box-sizing: border-box !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background-color: transparent !important;
                    }
                    .quotation-summary-area {
                        page-break-inside: avoid !important; /* Evita que el mensaje de agradecimiento se separe de los totales */
                    }
                    .quotation-page.contactPage {
                        background-color: var(--color-bg-page, #242424) !important; /* Forza el fondo oscuro */
                    }
                    .quotation-page:last-child { page-break-after: auto; }
                }
                `}
            </style>
            {!isArriendo && (
                <div className="quotation-page page1">
                    <div className="portCont_Corpo">
                        {config?.logo_cuadrado_path && (
                            <img className='port_logo' src={getUploadUrl(config.logo_cuadrado_path)} alt="Logo empresa" />
                        )}
                        <h2>
                            {config?.ceo || 'Luis Archila'}
                        </h2>
                        <p style={{ letterSpacing: '2px', textTransform: 'uppercase', fontSize: '10px', opacity: 0.8 }}>
                            Wedding & Event Planner
                        </p>
                    </div>

                    <div className="portCont_Info">
                        <header className="portInfCoti">
                            <h1>
                                <span>{tituloEvento}</span>
                            </h1>
                            <div className="infoBtnCoti">
                                <span style={{ color: '#ffffff' }}>{isArriendo ? 'Factura de Arriendo' : 'Cotización Oficial'}</span>
                            </div>
                            <p className="font-oswald font-light text-2xl sm:text-3xl text-white/80 tracking-tight">{cliente?.nombre} {cliente?.apellido}</p>
                        </header>

                        <h4>#TeamLuxePlanner</h4>
                        <p>Tu visión, nuestra magia ✨</p>
                    </div>
                </div>
            )}

            {/* Hoja carta 2 • Sobre Nosotros (OCULTO EN ARRIENDOS) */}
            {!isArriendo && (
                <div className="quotation-page nosotros">
                    <div className="nosContIni">
                        <img src="/images/cotizacion/cot_bgInfo.jpg" alt="" className="nosImgEvetn" />
                        <div className="contDiv">
                            <div className="titleArea flex items-start gap-3 mb-4">
                                <span className="dot"></span>
                                <h2 className="titlenos">Sobre Nosotros</h2>
                            </div>
                            <p className="nosInfo">
                                Somos expertos en la organización de eventos con más de 25 años de experiencia, especialistas como Wedding y Event Planner, creando y coordinando todo tipo de eventos, tanto sociales como corporativos a nivel local y nacional. Nos caracteriza un acompañamiento humano y profesional, en el que nos involucramos cuidadosamente en cada detalle para comprender sus sueños y expectativas, transformándolos en experiencias únicas, elegantes y memorables, cuidando cada detalle con responsabilidad, creatividad y pasión. Con el objetivo fiel de dejar siempre en su excelencia.
                            </p>
                        </div>
                    </div>

                    <div className="services-grid">
                        <div className="service-card scroll-reveal active" data-delay="150">
                            <div className="card-img">
                                <img alt="Bodas de Ensueño" src="/images/home/bodas.png" />
                            </div>
                            <div className="card-body">
                                <span className="tag">Planificación</span>
                                <h3>Bodas de Ensueño</h3>
                                <p>Planificación integral con un enfoque romántico y arquitectónico.</p>
                            </div>
                        </div>
                        <div className="service-card scroll-reveal active" data-delay="150">
                            <div className="card-img">
                                <img alt="XV Años" src="/images/home/quince.png" />
                            </div>
                            <div className="card-body">
                                <span className="tag">Celebración</span>
                                <h3>XV Años</h3>
                                <p>Celebramos tu esencia con estilo, tendencia y sofisticación.</p>
                            </div>
                        </div>
                        <div className="service-card scroll-reveal active" data-delay="150">
                            <div className="card-img">
                                <img alt="Eventos Corporativos" src="/images/home/corporativos.png" />
                            </div>
                            <div className="card-body">
                                <span className="tag">Estrategia</span>
                                <h3>Eventos Corporativos</h3>
                                <p>Galas, lanzamientos y encuentros de alto impacto para tu marca.</p>
                            </div>
                        </div>
                    </div>

                    <div className="experiencia">
                        <div className="expeInfo">
                            <p>+25</p>
                            <h2>años de <br /> experiencia</h2>
                        </div>
                        <div className="expeInfo">
                            <p>+100</p>
                            <h2>eventos <br /> realizados</h2>
                        </div>
                        <div className="expeInfo">
                            <p>+500</p>
                            <h2>ideas únicas <br /> &nbsp; </h2>
                        </div>
                        <div className="expeInfo">
                            <p>98%</p>
                            <h2>recomendaciones <br /> &nbsp; </h2>
                        </div>
                    </div>

                    <div className="msjGancho">
                        <img src="/images/cotizacion/msjGancho.svg" alt="" />
                    </div>
                </div>
            )}

            {/* Hoja carta 3 • Collage (OCULTO EN ARRIENDOS) */}
            {!isArriendo && (
                <div className={`quotation-page ${data?.tipo_evento === "Boda" ? "img-boda" : "img-otro"}`}>
                </div>
            )}

            {/* Hoja carta 4 • Cotización */}
            <div className="quotation-page cotizacion">
                <table className="print-wrapper-table">
                    <thead>
                        <tr>
                            <td>
                                <div className="print-header-spacer" style={{ height: '40mm' }}></div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div className="quotation-content-flow">
                                    <div className="quotation-client">
                                        <div className="contInfoCoti">
                                            <div className="contInfoCoti__grid">
                                                <User className="lucide w-4 h-4 text-neutral-500" />
                                                <p><span>Cliente:</span> {cliente?.nombre} {cliente?.apellido}</p>
                                            </div>
                                            <div className="contInfoCoti__grid">
                                                <Phone className="lucide w-4 h-4 text-neutral-500" />
                                                <p><span>Teléfono:</span> {cliente.telefono || "No proporcionado"}</p>
                                            </div>
                                            <div className="contInfoCoti__grid">
                                                <Mail className="lucide w-4 h-4 text-neutral-500" />
                                                <p><span>Email:</span> {cliente.email || "No proporcionado"}</p>
                                            </div>
                                            <div className="contInfoCoti__grid">
                                                <Tag className="lucide w-4 h-4 text-neutral-500" />
                                                <p><span>Tipo:</span> {data.tipo_evento}</p>
                                            </div>
                                            <div className="contInfoCoti__grid">
                                                <FileText className="lucide w-4 h-4 text-neutral-500" />
                                                <p><span>Creado:</span> {formatDate(new Date().toISOString())}</p>
                                            </div>
                                        </div>

                                        <div className="contInfoCoti">
                                            <div className="contInfoCoti__grid">
                                                <Calendar className="lucide w-4 h-4 text-neutral-500" />
                                                <p><span>Fecha:</span> {formatDate(data.fevent)}</p>
                                            </div>
                                            {!isArriendo && (
                                                <div className="contInfoCoti__grid">
                                                    <Clock className="lucide w-4 h-4 text-neutral-500" />
                                                    <p><span>Horario:</span> {formatTime(data.hora_inicio)} | {formatTime(data.hora_fin)}</p>
                                                </div>
                                            )}
                                            {!isArriendo && (
                                                <div className="contInfoCoti__grid">
                                                    <Users className="lucide w-4 h-4 text-neutral-500" />
                                                    <div className="fontInv">
                                                        <p><span>Invitados:</span></p>
                                                        <div className="contSpanNIn"><span className="spanNIn">A</span> {data.num_adultos || "0"}</div>
                                                        <div className="contSpanNIn"><span className="spanNIn">N</span> {data.num_ninos || "0"}</div>
                                                        <div className="contSpanNIn"><span className="spanNIn">T</span> {(data.num_adultos || 0) + (data.num_ninos || 0)}</div>
                                                    </div>
                                                </div>
                                            )}
                                            {!isArriendo && (
                                                <div className="contInfoCoti__grid">
                                                    <Palette className="lucide w-4 h-4 text-neutral-500" />
                                                    <p><span>Tematica:</span> {data.tematica}</p>
                                                </div>
                                            )}
                                            {!isArriendo && (
                                                <div className="contInfoCoti__grid">
                                                    <Droplets className="lucide w-4 h-4 text-neutral-500" />
                                                    <p>
                                                        <span>Paleta:</span>
                                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                                                            {data.paleta_colores ? data.paleta_colores.split(',').map((c, i) => {
                                                                const color = c.trim();
                                                                if (!color.startsWith('#')) return null;
                                                                return <span key={i} className="palette-circle" style={{ backgroundColor: color }}></span>;
                                                            }) : <span className="text-xs text-neutral-400">Ver temática</span>}
                                                        </div>
                                                    </p>
                                                </div>
                                            )}
                                            {isArriendo && (
                                                <>
                                                    <div className="contInfoCoti__grid">
                                                        <Tag className="lucide w-4 h-4 text-neutral-500" />
                                                        <p><span>Ref Arriendo:</span> {data.num_arriendo || 'N/A'}</p>
                                                    </div>
                                                    <div className="contInfoCoti__grid">
                                                        <History className="lucide w-4 h-4 text-neutral-500" />
                                                        <p><span>Vencimiento:</span> {formatDate(data.f_limite || data.fevent)}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                         <div className="infoEmpre">
                                            <div className="redesItemCont">
                                                <div className="redesItemCont">
                                                    <div className="redesItem">
                                                        <a href="https://www.instagram.com/archi.planner/" target="_blank" rel="noopener noreferrer">
                                                            <img 
                                                                src={config?.logo_black_path ? getUploadUrl(config.logo_black_path) : `${window.location.origin}/images/cotizacion/ArchiPlanner-Logo.svg`} 
                                                                alt="Logo ArchiPlanner" 
                                                                style={{ maxHeight: '45px', width: 'auto' }}
                                                            />
                                                        </a>
                                                    </div>
                                                    <div className="redesItem">
                                                        <a href="https://www.instagram.com/annygarridop/" target="_blank" rel="noopener noreferrer">
                                                            <img 
                                                                src={`${window.location.origin}/images/cotizacion/AnnyGarridoName.svg`} 
                                                                alt="Logo Anny Garrido" 
                                                                style={{ maxHeight: '45px', width: 'auto' }}
                                                            />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h3>{isArriendo ? 'Arriendo' : 'Coti.'} #{isArriendo ? (data.num_arriendo || data.num || id) : (num || id)}</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="quotation-items-grid">
                                        {[[], []].map((colItems, colIdx) => {
                                            // Lógica de balanceo simple para distribuir categorías en dos columnas
                                            const entries = Object.entries(groupedDetalles);
                                            const half = Math.ceil(entries.length / 2);
                                            const columnEntries = colIdx === 0
                                                ? entries.slice(0, half)
                                                : entries.slice(half);

                                            return (
                                                <div key={colIdx} className="quotation-column">
                                                    {columnEntries.map(([categoria, items]) => (
                                                        <table key={categoria} className="quotation-table-compact">
                                                            <thead>
                                                                <tr className="category-row">
                                                                    <th colSpan={data.mostrar_precios ? 4 : 2}>
                                                                        {categoria}
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {items.map((item, idx) => (
                                                                    <tr key={idx}>
                                                                        <td className="text-center">{Number(item.cantidad)}</td>
                                                                        <td className="text-left">
                                                                            <span className="item-name">{item.nombre}</span>
                                                                            {item.notas && <span className="item-observation">{item.notas}</span>}
                                                                        </td>
                                                                        {data.mostrar_precios ? (
                                                                            <>
                                                                                <td className="price-cell">$ {formatCurrency(item.precio_u)}</td>
                                                                                <td className="total-cell">$ {formatCurrency(item.subtotal)}</td>
                                                                            </>
                                                                        ) : null}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="quotation-summary-area">
                                        <div className="terms-column">
                                            {isArriendo && data.notas_entrega && (
                                                <div className="rental-notes mb-4">
                                                    <h4 className="terms-title">Notas de Entrega:</h4>
                                                    <p className="text-xs opacity-70 italic">{data.notas_entrega}</p>
                                                </div>
                                            )}
                                            {isArriendo && data.notas_devolucion && (
                                                <div className="rental-notes mb-4">
                                                    <h4 className="terms-title">Notas de Devolución:</h4>
                                                    <p className="text-xs opacity-70 italic">{data.notas_devolucion}</p>
                                                </div>
                                            )}
                                            <h4 className="terms-title">Términos & Condiciones:</h4>
                                            <div className="terms-text">
                                                {displayPolicies.map((line, i) => (
                                                    <p key={i}>• {line}</p>
                                                ))}
                                            </div>
                                            <div className="thanks-message">
                                                <p>¡Gracias por su confianza!</p>
                                            </div>
                                        </div>

                                        <div className="totals-column">
                                            <div className="financial-stack">
                                                <div className="financial-row">
                                                    <span className="label">Subtotal</span>
                                                    <span className="value">$ {formatCurrency(data.total_tipo === 'manual' ? data.monto_final : finalSubtotal)}</span>
                                                </div>
                                                {!!data.aplica_iva && data.total_tipo !== 'manual' && (
                                                    <div className="financial-row">
                                                        <span className="label">IVA (19%)</span>
                                                        <span className="value">$ {formatCurrency(data.iva)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grand-total-highlight">
                                                <span className="total-label">TOTAL</span>
                                                <span className="total-value">$ {formatCurrency(data.monto_final)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>
                                {/* Espaciador para reservar sitio al footer absoluto (REDUCIDO) */}
                                <div style={{ height: '30mm' }}></div>
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* Footer anclado al final de la página .cotizacion */}
                <div className="print-footer-container">
                    {config && (
                        <div className="quotation-footer">
                            {config.city && (
                                <div className="quotation-footer__item">
                                    <MapPin />
                                    <span>{config.city}</span>
                                </div>
                            )}
                            <div className="footer-contact-group">
                                {config.telefono && (
                                    <div className="quotation-footer__item">
                                        <Phone />
                                        <span>{config.telefono}</span>
                                    </div>
                                )}
                                {config.email_contacto && (
                                    <div className="quotation-footer__item">
                                        <Mail />
                                        <span>{config.email_contacto}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <img className="quotation-branding-adorno" src="/images/cotizacion/cot_bgPag.png" alt="" />
                </div>
            </div>

            {/* Hoja carta 5 • Adicionales (OCULTO EN ARRIENDOS) */}
            {!isArriendo && (
                <div className="quotation-page adicionales">
                    <div className="contDiv">
                        <div className="adicionales-header">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-bag w-4 h-4 text-neutral-500">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <path d="M3 6h18"></path>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            <h1>Adicionales</h1>
                        </div>

                        <table className="quotation-table">
                            <thead>
                                <tr>
                                    <th className="text-left">Servicio</th>
                                    <th className="text-left">Descripción</th>
                                    <th className="text-center" style={{ width: '60px' }}>Cant.</th>
                                    <th className="text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAdicionals.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="text-left">{item.nombre}</td>
                                        <td className="text-left">{item.nota || ""}</td>
                                        <td className="text-center">{item.cantidad}</td>
                                        <td className="text-right">$ {formatCurrency(item.precio_u || item.precio || 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer manual para Adicionales */}
                    <div className="print-footer-container">
                        {config && (
                            <div className="quotation-footer">
                                {config.city && (
                                    <div className="quotation-footer__item">
                                        <MapPin />
                                        <span>{config.city}</span>
                                    </div>
                                )}
                                <div className="footer-contact-group">
                                    {config.telefono && (
                                        <div className="quotation-footer__item">
                                            <Phone />
                                            <span>{config.telefono}</span>
                                        </div>
                                    )}
                                    {config.email_contacto && (
                                        <div className="quotation-footer__item">
                                            <Mail />
                                            <span>{config.email_contacto}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <img className="quotation-branding-adorno" src="/images/cotizacion/cot_bgPag.png" alt="" />
                    </div>

                    <img className="bgEfect" src="/images/cotizacion/cot_bgEfect.png" alt="" />
                </div>
            )}

            {/* Hoja carta 6 • Contacto (OCULTO EN ARRIENDOS) */}
            {!isArriendo && (
                <div className="quotation-page contactPage">
                    <div className="contactCont">
                        <div className="titleCont">
                            <h2>Contacto</h2>
                            <p>Trabajemos juntos</p>
                        </div>
                        <div className="contInfo">
                            <div className="infoItem">
                                <Phone />
                                <div>
                                    {config?.nombre_empresa === "ArchiPlanner AG" ? (
                                        <>
                                            <p>{config?.telefono}</p>
                                            <p>315 7071830</p>
                                        </>
                                    ) : (
                                        <>
                                            <p>315 7071830</p>
                                            <p>{config?.telefono}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="infoItem">
                                <Mail />
                                <p>{config?.email_contacto}</p>
                            </div>
                            <div className="infoItem">
                                <MapPin />
                                <p>{config?.city}</p>
                            </div>
                        </div>
                    </div>

                    <div className="redesCont">
                        <div className="redesItemCont">
                            <div className="redesItem">
                                <a href="https://www.instagram.com/archi.planner/" target="_blank" rel="noopener noreferrer">
                                    <img src={`${window.location.origin}/images/cotizacion/ArchiPlanner-Logo.svg`} alt="Logo empresa" />
                                </a>
                            </div>
                            <div className="redesItem">
                                <a href="https://www.instagram.com/annygarridop/" target="_blank" rel="noopener noreferrer">
                                    <img src={`${window.location.origin}/images/cotizacion/AnnyGarridoName.svg`} alt="Logo empresa" />
                                </a>
                            </div>
                        </div>
                        <a href="https://www.instagram.com/explore/search/keyword/?q=%23teamluxeplanner" target="_blank" rel="noopener noreferrer">
                            #TeamLuxePlanner
                        </a>

                    </div>
                </div>
            )}

            {showHistory && (
                <QuotationHistoryPanel 
                    quotationId={id} 
                    onClose={() => setShowHistory(false)} 
                />
            )}
        </div>
    );
};

export default QuotationView;