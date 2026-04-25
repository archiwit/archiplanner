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
                                            <div className="redesItemCont premium-logo-box">
                                                <div className="redesItem">
                                                    <svg xmlns="http://www.w3.org/2000/svg" id="svg-archiplanner" data-name="ArchiPlanner Logo" viewBox="0 0 1079.99 893.36">
                                                        <defs>
                                                            <style>
                                                                {`
                                                                    .cls-ap-1 { fill: #323232; stroke-width: 0px; }
                                                                    .cls-ap-2 { fill: #e44c49; stroke-width: 0px; }
                                                                `}
                                                            </style>
                                                        </defs>
                                                        <g id="svg-ap-body">
                                                            <g id="svg-ap-main">
                                                                <g>
                                                                    <g>
                                                                        <circle className="cls-ap-1" cx="539.42" cy="325.74" r="25.85" />
                                                                        <circle className="cls-ap-1" cx="539.42" cy="204.57" r="29.08" transform="translate(251.08 704.26) rotate(-80.78)" />
                                                                        <circle className="cls-ap-1" cx="539.42" cy="446.91" r="22.62" />
                                                                        <g>
                                                                            <path className="cls-ap-1" d="M773.32,226c-64.15-40.07-130.65-76.03-199.01-107.59,3.27-1.51,6.5-2.99,9.64-4.43,65.19,33.38,128.47,70.81,189.38,112.01h-.01Z" />
                                                                            <path className="cls-ap-1" d="M763.05,78.99c-.45-4.53-1.31-10.08-2.16-14.57-2.77-14.49-7.22-28.56-13.47-42.03-3.43-7.39-11.79-11.06-19.42-8.16-63.78,22.2-126.22,48.44-186.89,78.55,0-.04-.04-.04-.04-.04l-11.47,5.83h-.12c-31.63,16-62.76,33.01-93.37,51.09-30.56,18.04-60.6,37.09-90.02,57.17-2.9,1.96-6.77.49-7.79-2.94-3.06-10.32-5.67-20.77-7.79-31.3-9.39-45.99-9.79-93.9-1.31-140.05.53-3.1,3.55-5.02,6.49-4.16,34.64,10.28,68.96,21.63,102.96,34.03,24.69,8.98,53.05,20.77,77.57,31.01l12.98-6.45c-24.89-11.47-61.21-27.46-85.94-37.54-38.52-15.71-77.61-30.03-117.07-43.01-4.77-1.59-9.96,1.43-11.1,6.53-4.16,17.83-7.06,35.99-8.69,54.27-4.73,55.09,1.92,111.65,20.85,163.39.16.45.37.9.65,1.31,2.9,4.04,8.37,5.18,12.57,2.49,31.05-20.24,62.72-39.38,94.92-57.37,21.75-12.16,43.74-23.79,65.98-34.89,20.28-10.12,40.77-19.79,61.41-29.01,3.47-1.55,6.94-3.1,10.41-4.61,4.2-1.84,8.41-3.67,12.61-5.47,44.23-18.97,89.24-35.91,134.87-50.72,2.53-.82,5.22.49,6.28,2.98,3.47,8.12,6.2,16.57,8.16,25.14,4.98,21.75,4.9,44.68.04,66.47-.78,3.55-4.65,5.26-7.67,3.43-32.65-19.99-66.47-37.83-101.16-53.33-1.59-.61-3.06-.57-4.24-.08-2.16.9-3.55,3.18-3.55,5.55,0,1.88.94,3.84,3.1,5.06,39.26,20.4,76.76,44.15,112.67,70.06.24.16.49.33.78.45,4.73,2.2,10.28-.24,12.28-5.26,2.65-5.71,5.06-11.55,7.14-17.55,8.37-24.28,11.34-50.64,8.57-76.27h-.02Z" />
                                                                        </g>
                                                                        <path className="cls-ap-1" d="M830.04,189.67c18.76-27.43,35.66-52.15,53.38-78.06-40.26-36.96-86.1-70.74-130.62-111.61,34.2,65.33,36.16,123.35,2.84,196.9,33.48,24.74,37.57,55.18,37.57,55.18-4-3.23-14.95-11.95-27.03-20.2-8.27-5.64-14.52-9.33-21.49-12.63h0c-2.04,3.88-4.17,7.81-6.39,11.79-24.49-13.96-24.17-13.78-47.83-27.27-45.95,140.55-91.06,278.55-138.44,423.46,125.28-124.5,245.48-243.95,366.73-364.45-30.54-25.17-59.4-48.96-88.71-73.12h-.01Z" />
                                                                        <path className="cls-ap-1" d="M527.86,627.24c-16.44-50.29-104.04-318.52-133.69-409.36-23.53,13.12-41.29,26.27-66.76,40.46-10.99-24.06-35.18-81.21-37.41-136.28-2.1-51.94,8.68-93.33,17.06-117.93-43.08,39.59-70.72,71.02-110.53,107.6,18.21,26.54,35.2,51.31,53.52,78.02-29.78,24.5-58.83,48.39-88.82,73.06,31.32,31.13,273.66,272.05,366.61,364.43h.02Z" />
                                                                        <path className="cls-ap-1" d="M597.8,54.92c-10.2-20.53-30.77-34.56-54.49-34.56s-45.58,14.93-55.42,36.53c17.96,7.61,35.88,15.68,53.5,24.08,18.54-9.15,37.37-17.84,56.41-26.04h0Z" />
                                                                    </g>
                                                                    <g>
                                                                        <g>
                                                                            <path className="cls-ap-1" d="M818.83,805.61c0-4.26-3.46-7.72-7.72-7.72h0c-4.26,0-7.72,3.46-7.72,7.72v37.47l-56.3-148.98c-1-3.1-3.91-5.33-7.34-5.33h0c-4.16,0-7.56,3.3-7.71,7.43v82.76c0,4.26,3.46,7.72,7.72,7.72h0c4.26,0,7.72-3.46,7.72-7.72v-40.18l56.43,149.33c1.51,3.99,5.96,6,9.95,4.49h0c3.25-1.23,5.18-4.41,4.98-7.71v-79.28h0Z" />
                                                                            <path className="cls-ap-1" d="M1003.2,877.92h-86.12c-6.42,0-9.41,3.46-9.41,7.72h0c0,4.26,2.99,7.72,9.41,7.72h86.12c6.42,0,11.63-3.46,11.63-7.72h0c0-4.26-5.21-7.72-11.63-7.72Z" />
                                                                            <path className="cls-ap-1" d="M977.88,717.84h-62.21c-4.76,0-8.62,3.29-8.62,7.34h0c0,4.05,3.86,7.34,8.62,7.34h62.21c4.76,0,8.62-3.29,8.62-7.34h0c0-4.05-3.86-7.34-8.62-7.34Z" />
                                                                            <path className="cls-ap-1" d="M890.19,696.96c0-4.26-3.46-7.72-7.72-7.72h0c-4.26,0-7.72,3.46-7.72,7.72v146.38l-56.3-148.98c-1-3.1-3.91-5.33-7.34-5.33h0c-4.16,0-7.56,3.3-7.71,7.43v79.4c0,4.26,3.46,7.72,7.72,7.72h0c4.26,0,7.72-3.46,7.72-7.72v-36.83l56.43,149.33c1.51,3.99,5.96,6,9.95,4.49h0c3.25-1.23,5.18-4.41,4.98-7.71v-188.19h0Z" />
                                                                            <path className="cls-ap-1" d="M968.64,800.97h-38.47c-4.26,0-7.72-3.46-7.72-7.72v-38.69c0-4.27-3.45-7.74-7.7-7.74h0c-4.25,0-7.7,3.46-7.7,7.74l.5,131.14c.01,3.94,2.98,7.5,6.92,7.65,1,.04,2.02-.12,3.02-.5h0c3.24-1.23,5.17-4.42,4.96-7.73v-60.97c0-4.26,3.46-7.72,7.72-7.72h38.47c4.25,0,7.7-3.46,7.7-7.74h0c0-4.27-3.45-7.74-7.7-7.74v.02Z" />
                                                                            <path className="cls-ap-1" d="M707.98,877.47h-71.24v-180.94c0-4.27-3.46-7.73-7.73-7.73h0c-4.27,0-7.73,3.46-7.73,7.73v185.08c0,.75.05,1.48.15,2.19v.02c-.09.45-.14.91-.14,1.38,0,3.32,2.27,6.16,5.46,7.25.27.12.56.22.84.3.46.13.93.19,1.42.19.1,0,.21,0,.3-.01h78.67c2.3,0,4.4-.86,5.91-2.27,1.51-1.4,2.45-3.33,2.45-5.47,0-4.26-3.74-7.73-8.36-7.73h0Z" />
                                                                            <path className="cls-ap-1" d="M681.09,692.97c-1.14-2.54-3.66-4.18-6.45-4.18h0c-5.11,0-8.53,5.25-6.47,9.92l57.12,129.5h-46.44c-4.03,0-7.29,3.26-7.29,7.29h0c0,4.03,3.26,7.29,7.29,7.29h52.56l20.41,45.61c1.24,2.78,4,4.56,7.04,4.56h0c5.59,0,9.33-5.77,7.04-10.87l-84.83-189.13h.02Z" />
                                                                            <path className="cls-ap-1" d="M533.37,688.86h-59.57c-4.27,0-7.73,3.46-7.73,7.73v188.69c0,4.27,3.46,7.73,7.73,7.73s7.73-3.46,7.73-7.73v-180.96h51.76c.34,0,.67-.02,1-.07,31.14.53,56.24,27.82,56.24,61.42s-25.56,61.4-57.11,61.43h-15.7c-3.36,0-6.19,2.2-7.14,5.25h0c-.22.71-.33,1.45-.33,2.22,0,2.06.83,3.93,2.19,5.28,1.35,1.35,3.22,2.19,5.29,2.19h15.7c39.27-.03,71.1-34.31,71.1-76.59s-31.86-76.6-71.15-76.6h0Z" />
                                                                            <path className="cls-ap-1" d="M1020.45,821.87c-2.59-2.81-.81-7.31,2.99-7.7,38.12-3.91,56.82-31.18,56.55-61.93-.29-31.79-22.75-63.58-67.08-63.58h-96.01c-5.45,0-9.87,3.33-9.87,7.43s4.42,7.44,9.87,7.44l96.01-.29c33.83,0,50.16,24.79,49.87,48.7-.29,28.58-16.04,48.7-51.62,48.7h-8.48c-4.59,0-8.31,3.72-8.31,8.31v3.55c0,1.94.73,3.81,2.04,5.24l66.45,72.59c1.44,1.57,3.48,2.47,5.61,2.47,6.63,0,10.09-7.89,5.59-12.76l-53.62-58.17h.01Z" />
                                                                        </g>
                                                                        <g>
                                                                            <path className="cls-ap-2" d="M423.17,688.79h0c-4.27,0-7.73,3.46-7.73,7.73v188.69c0,4.27,3.46,7.73,7.73,7.73h0c4.27,0,7.73-3.46,7.73-7.73v-188.69c0-4.27-3.46-7.73-7.73-7.73Z" />
                                                                            <path className="cls-ap-2" d="M13.53,692.96c-1.14-2.54-3.66-4.18-6.45-4.18h0c-5.11,0-8.53,5.25-6.47,9.92l57.12,129.48H7.33c-4.03,0-7.29,3.26-7.29,7.29h0c0,4.03,3.26,7.29,7.29,7.29h56.52l20.41,45.6c1.24,2.78,4,4.56,7.04,4.56h0c5.59,0,9.33-5.77,7.04-10.87L13.53,692.96Z" />
                                                                            <path className="cls-ap-2" d="M132.6,814.31c38.18-3.88,56.91-31.16,56.64-61.94-.29-31.79-22.75-63.58-67.08-63.58H52.34c-3.87,0-7.01,3.14-7.01,7.01v.57c0,3.87,3.14,7.01,7.01,7.01h69.81c33.83,0,50.16,24.79,49.87,48.7-.29,28.58-16.04,48.7-51.62,48.7h-8.48c-4.59,0-8.31,3.72-8.31,8.31v3.55c0,1.94.73,3.81,2.04,5.24l66.45,72.59c1.44,1.57,3.48,2.47,5.61,2.47h0c6.63,0,10.09-7.89,5.59-12.76l-53.62-58.17c-2.57-2.78-.86-7.31,2.91-7.69h0Z" />
                                                                            <path className="cls-ap-2" d="M373.59,688.79h-1.73c-3.87,0-7.01,3.14-7.01,7.01v90.11h-109.45c-3.87,0-7.01,3.14-7.01,7.01v.27c0,3.87,3.14,7.01,7.01,7.01h109.45v85.73c0,3.87,3.14,7.01,7.01,7.01h1.73c3.87,0,7.01-3.14,7.01-7.01v-190.13c0-3.87-3.14-7.01-7.01-7.01Z" />
                                                                            <path className="cls-ap-2" d="M296.18,723.5c2.66,2.26,6.59,2.32,9.25.07l.1-.09c3.23-2.73,3.25-7.66,0-10.38-19.58-16.39-44.13-24.59-68.44-24.59-21.16,0-39.17,4.57-53.99,12.41,2.07,1.68,4.04,3.49,5.9,5.43,1.55,1.61,3,3.3,4.37,5.05,12.21-5.86,26.79-9.19,43.72-9.19,21.12,0,42.24,6.95,59.09,21.29h0Z" />
                                                                            <path className="cls-ap-2" d="M306.01,857.78l-.32-.29c-2.59-2.39-6.61-2.53-9.32-.27-16.88,14.12-38.21,21.28-59.29,21.28-15.25,0-28.58-2.72-39.99-7.56l3.03,3.21c3.67,3.89,4.65,9.28,2.63,14.15,10.34,2.88,21.78,4.45,34.32,4.45,24.42,0,49.07-8.27,68.7-24.81,3.15-2.65,3.24-7.39.22-10.18l.02.02Z" />
                                                                        </g>
                                                                    </g>
                                                                </g>
                                                            </g>
                                                        </g>
                                                    </svg>
                                                </div>
                                                <div className="redesItem">
                                                    <svg xmlns="http://www.w3.org/2000/svg" id="svg-annygarrido" data-name="Anny Garrido Logo" viewBox="0 0 1080 1287.32">
                                                        <defs>
                                                            <style>
                                                                {`
                                                                    .cls-ag-1 { fill: #111111; stroke-width: 0px; }
                                                                `}
                                                            </style>
                                                        </defs>
                                                        <g id="svg-ag-body">
                                                            <g id="svg-ag-main">
                                                                <path className="cls-ag-1" d="M116.19,1236.64c0-14.52,5.64-26.16,16.92-34.92,11.28-8.76,27.52-14.06,48.72-15.9,1.26-.1,2.37-.2,3.34-.29,2.32-.1,4.04-.29,5.15-.58,1.11-.29,2.03-.92,2.76-1.89.73-.97,1.67-2.52,2.83-4.65.48-.97,1.06-2.03,1.74-3.2,16.07-27.98,30.23-49.76,42.48-65.35,12.25-15.59,21.32-23.38,27.23-23.38h.15c.19,0,.58.05,1.16.15.58.1,1.18.36,1.82.8.63.44,1.18,1.14,1.67,2.11.48.97.73,2.28.73,3.92,0,3.87-1.84,12.63-5.52,26.28-3.68,13.65-7.46,27.06-11.33,40.23-2.03,7.36-3.75,13.53-5.15,18.52-1.4,4.98-2.11,7.86-2.11,8.64,0,.29.19.48.58.58.39.1.87.19,1.45.29.97.1,1.91.34,2.83.73.92.39,1.38,1.21,1.38,2.47,0,.29-.07.6-.22.94-.15.34-.32.6-.51.8-.49.58-1.02.87-1.6.87h-.29c-1.45,0-2.47-.1-3.05-.29-.39-.1-.73-.14-1.02-.14-.68,0-1.86,2.61-3.56,7.84-1.69,5.23-3.46,11.5-5.3,18.81-1.84,7.31-3.41,14.47-4.72,21.49-1.31,7.02-1.96,12.32-1.96,15.9,0,1.74.12,3.12.36,4.14.24,1.02.51,1.76.8,2.25.29.48.58.82.87,1.02.29.29.53.58.73.87.19.29.29.73.29,1.31,0,1.16-.92,1.84-2.76,2.03h-.44c-.87,0-1.55-.39-2.03-1.16-1.36-1.74-2.03-4.99-2.03-9.73,0-7.94,1.11-17.14,3.34-27.59,2.23-10.46,4.36-19.46,6.39-27.01,1.65-6.3,2.47-9.97,2.47-11.04,0-.19-1.5-.49-4.5-.87-3-.39-6.61-.8-10.82-1.23-4.21-.44-8.28-.8-12.2-1.09-3.92-.29-6.8-.44-8.64-.44-5.62,0-9.51.94-11.69,2.83s-4.43,5.11-6.75,9.66c-13.27,24.3-23.23,41.19-29.91,50.68-6.68,9.49-13.46,14.23-20.33,14.23-3,0-6.03-1.04-9.08-3.12-3.05-2.08-5.59-5.33-7.62-9.73-2.03-4.41-3.05-10-3.05-16.77ZM119.24,1237.08c.1,8.23,1.76,14.71,5.01,19.46,3.24,4.74,7.09,7.11,11.55,7.11,2.9,0,6.58-2.52,11.04-7.55,4.45-5.04,9.12-11.21,14.01-18.52,4.89-7.31,9.51-14.62,13.87-21.93,4.36-7.31,7.94-13.48,10.75-18.52v-.29l.29-.29c0-.1.05-.15.15-.15v-.14c.1-.2.19-.34.29-.44v-.15c0-.1.05-.14.14-.14,1.74-3.29,2.76-5.23,3.05-5.81.1,0,.15-.05.15-.15,0-.39-.49-.58-1.45-.58-7.26,0-14.91.77-22.94,2.32-8.04,1.55-15.52,4.16-22.44,7.84-6.92,3.68-12.56,8.59-16.92,14.74-4.36,6.15-6.53,13.87-6.53,23.16ZM197.37,1182.91c0,.97.8,1.57,2.4,1.82,1.6.24,4.28.36,8.06.36,19.94.68,30.79,1.35,32.53,2.03h.87c.39,0,.8-.17,1.23-.51.44-.34.7-.8.8-1.38,7.74-28.95,13.89-50.44,18.44-64.48,2.32-7.26,4.11-13.16,5.37-17.72,1.26-4.55,1.89-8.08,1.89-10.6,0-2.13-.58-3.2-1.74-3.2h-.15c-3.1,0-7.48,3.05-13.14,9.15-5.66,6.1-11.72,13.6-18.15,22.51-6.44,8.91-12.56,17.94-18.37,27.08s-10.6,17.04-14.38,23.67c-3.78,6.63-5.66,10.38-5.66,11.25Z" />
                                                                <path className="cls-ag-1" d="M327.04,1182.91c.1,0,.15.05.15.14v.15h-.15c-.29.48-1.21,1.89-2.76,4.21-2.03,2.9-4.6,6.19-7.7,9.88-3.1,3.68-6.39,6.94-9.88,9.8-3.49,2.85-6.68,4.28-9.58,4.28-2.32,0-3.8-.85-4.43-2.54-.63-1.69-.94-3.27-.94-4.72,0-4.55,1.09-9.8,3.27-15.76s4.23-11.06,6.17-15.32c1.55-3.39,2.32-5.37,2.32-5.95,0-.39-.19-.58-.58-.58-1.65,0-4.43,1.89-8.35,5.66-3.92,3.78-8.01,7.89-12.27,12.34-3.49,3.68-6.58,6.85-9.29,9.51-2.71,2.66-4.55,3.99-5.52,3.99-1.74,0-2.61-1.11-2.61-3.34v-.73c0-2.52.56-5.54,1.67-9.08,1.11-3.53,2.44-6.65,3.99-9.37,1.55-2.71,3-4.07,4.36-4.07,1.45,0,2.18.53,2.18,1.6,0,.49-.32,1.45-.94,2.9-.63,1.45-1.33,3.1-2.11,4.94-1.16,2.42-2.18,4.74-3.05,6.97-.87,2.23-1.31,3.82-1.31,4.79v.14c.29,0,1.16-.73,2.61-2.18s3.29-3.29,5.52-5.52c4.65-4.84,9.63-9.73,14.96-14.67,5.32-4.94,9.1-7.41,11.33-7.41.97.1,1.77.46,2.4,1.09.63.63.94,1.43.94,2.4,0,1.26-.46,3.27-1.38,6.03-.92,2.76-2.06,5.83-3.41,9.22-1.65,4.45-3.2,8.86-4.65,13.21s-2.18,7.84-2.18,10.46c0,1.16.15,1.96.44,2.4.29.44.6.73.94.87.34.14.6.22.8.22,2.81,0,6.17-1.99,10.09-5.95,3.92-3.97,7.62-7.99,11.11-12.05,1.94-2.32,3.61-4.24,5.01-5.74,1.4-1.5,2.35-2.25,2.83-2.25Z" />
                                                                <path className="cls-ag-1" d="M385.27,1182.91c.1,0,.15.05.15.14v.15h-.15c-.29.48-1.21,1.89-2.76,4.21-2.03,2.9-4.6,6.19-7.7,9.88-3.1,3.68-6.39,6.94-9.88,9.8-3.49,2.85-6.68,4.28-9.58,4.28-2.32,0-3.8-.85-4.43-2.54-.63-1.69-.94-3.27-.94-4.72,0-4.55,1.09-9.8,3.27-15.76s4.23-11.06,6.17-15.32c1.55-3.39,2.32-5.37,2.32-5.95,0-.39-.19-.58-.58-.58-1.65,0-4.43,1.89-8.35,5.66-3.92,3.78-8.01,7.89-12.27,12.34-3.49,3.68-6.58,6.85-9.29,9.51-2.71,2.66-4.55,3.99-5.52,3.99-1.74,0-2.61-1.11-2.61-3.34v-.73c0-2.52.56-5.54,1.67-9.08,1.11-3.53,2.44-6.65,3.99-9.37,1.55-2.71,3-4.07,4.36-4.07,1.45,0,2.18.53,2.18,1.6,0,.49-.32,1.45-.94,2.9-.63,1.45-1.33,3.1-2.11,4.94-1.16,2.42-2.18,4.74-3.05,6.97-.87,2.23-1.31,3.82-1.31,4.79v.14c.29,0,1.16-.73,2.61-2.18s3.29-3.29,5.52-5.52c4.65-4.84,9.63-9.73,14.96-14.67,5.32-4.94,9.1-7.41,11.33-7.41.97.1,1.77.46,2.4,1.09.63.63.94,1.43.94,2.4,0,1.26-.46,3.27-1.38,6.03-.92,2.76-2.06,5.83-3.41,9.22-1.65,4.45-3.2,8.86-4.65,13.21s-2.18,7.84-2.18,10.46c0,1.16.15,1.96.44,2.4.29.44.6.73.94.87.34.14.6.22.8.22,2.81,0,6.17-1.99,10.09-5.95,3.92-3.97,7.62-7.99,11.11-12.05,1.94-2.32,3.61-4.24,5.01-5.74,1.4-1.5,2.35-2.25,2.83-2.25Z" />
                                                                <path className="cls-ag-1" d="M447.86,1182.91h.22s.07.05.07.14c0,.29-.73.94-2.18,1.96s-3.34,2.35-5.66,3.99c-5.13,3.39-10.51,7.26-16.12,11.62-5.62,4.36-9.1,8.13-10.46,11.33-4.74,14.91-9.42,27.13-14.01,36.67-4.6,9.53-8.91,16.97-12.92,22.29-4.02,5.32-7.57,9.15-10.67,11.47-3.1,2.32-5.59,3.73-7.48,4.21-1.89.48-2.98.73-3.27.73h-.44c-.97,0-1.89-.34-2.76-1.02-1.55-1.65-2.32-3.49-2.32-5.52v-.44c0-6.58,4.04-15.95,12.13-28.1,8.08-12.15,18.61-24.37,31.58-36.67,1.74-1.55,3.12-3,4.14-4.36,1.02-1.36,2.06-3.46,3.12-6.32,1.06-2.86,2.61-7.38,4.65-13.58,1.74-5.23,3.22-9.7,4.43-13.43,1.21-3.73,1.82-5.69,1.82-5.88v-.14c-.39,0-2.23,1.94-5.52,5.81-3,3.39-6.61,7.28-10.82,11.69-4.21,4.4-8.4,8.32-12.56,11.76-4.16,3.44-7.55,5.15-10.17,5.15s-4.07-2.32-4.07-6.97c0-2.61.85-6.12,2.54-10.53,1.69-4.41,3.58-8.4,5.66-11.98,2.08-3.58,3.65-5.37,4.72-5.37s1.6.49,1.6,1.45c0,.78-.39,2.13-1.16,4.07-.78,1.94-1.69,4.16-2.76,6.68-1.36,3.2-2.64,6.36-3.85,9.51-1.21,3.15-1.82,5.64-1.82,7.48,0,1.16.44,1.79,1.31,1.89,2.13,0,5.78-2.49,10.96-7.48,5.18-4.99,10.28-10.19,15.32-15.61,3.1-3.29,5.76-6.07,7.99-8.35,2.23-2.27,3.63-3.41,4.21-3.41.48,0,.92.1,1.31.29.1.1.19.14.29.14.87.49,1.31,1.21,1.31,2.18v.29c0,.78-.41,2.61-1.23,5.52-.82,2.9-1.79,6.15-2.9,9.73-1.11,3.58-2.2,6.92-3.27,10.02-.68,2.23-1.26,4.09-1.74,5.59-.49,1.5-.73,2.3-.73,2.4v.14c.1,0,1.26-.87,3.49-2.61,2.71-1.94,6.05-4.33,10.02-7.19,3.97-2.86,7.72-5.45,11.25-7.77,3.53-2.32,5.78-3.49,6.75-3.49ZM365.52,1283.54c4.55-.29,9.2-3.7,13.94-10.24,4.74-6.53,9.2-14.11,13.36-22.73,4.16-8.62,7.5-16.29,10.02-23.02,2.52-6.73,3.82-10.53,3.92-11.4h-.15c-.29,0-2.66,2.27-7.12,6.82-4.45,4.55-9.49,10.21-15.1,16.99-5.61,6.78-10.6,13.77-14.96,20.98-4.36,7.21-6.53,13.53-6.53,18.95,0,2.32.87,3.53,2.61,3.63Z" />
                                                                <path className="cls-ag-1" d="M573.76,1091.13c5.61,0,10.21,1.5,13.8,4.5,3.58,3,6.34,6.63,8.28,10.89,1.94,4.26,3.29,8.33,4.07,12.2.68,3.49,1.02,6.24,1.02,8.28v.73c0,5.23-.87,9.22-2.61,11.98s-3.34,4.14-4.79,4.14c-1.16,0-1.84-.87-2.03-2.61,0-1.16.34-2.37,1.02-3.63.48-1.06.94-2.49,1.38-4.28.44-1.79.65-4.28.65-7.48,0-1.55-.24-4.04-.73-7.48-.49-3.43-1.5-6.97-3.05-10.6s-3.8-6.73-6.75-9.29c-2.95-2.56-6.9-3.85-11.84-3.85-9,0-18.69,4.26-29.04,12.78-10.36,8.52-20.09,19.41-29.19,32.67-9.1,13.27-16.56,27.4-22.36,42.4-5.81,15.01-8.71,29.04-8.71,42.11,0,12,2.64,21.47,7.91,28.39,5.28,6.92,12.56,10.38,21.85,10.38,7.45,0,15.03-1.91,22.73-5.74,7.7-3.83,15.08-8.71,22.15-14.67,7.07-5.95,13.48-12.32,19.24-19.1,5.76-6.78,10.43-13.24,14.01-19.39,3.58-6.15,5.71-11.35,6.39-15.61l-4.36-.14c-3-.1-6.49-.14-10.46-.14-6.88,0-11.69.17-14.45.51-2.76.34-4.72.65-5.88.94-.68.19-1.33.34-1.96.44-.63.1-1.38.14-2.25.14-.97,0-1.72-.12-2.25-.36-.53-.24-.9-.53-1.09-.87-.19-.34-.29-.65-.29-.94,0-.97,2.3-1.79,6.9-2.47,4.6-.68,9.82-1.23,15.68-1.67,5.86-.44,11.06-.73,15.61-.87,4.55-.14,6.87-.22,6.97-.22,1.16,0,2.18.22,3.05.65.87.44,1.31,1.09,1.31,1.96s-.7,3.63-2.11,8.28c-1.4,4.65-3.07,10.17-5.01,16.55-3,9.49-5.81,18.76-8.42,27.81-2.61,9.05-3.92,14.84-3.92,17.35,0,.29.05.48.15.58.1.1.34.19.73.29.58.19,1.04.51,1.38.94.34.44.51.99.51,1.67,0,1.07-.34,1.98-1.02,2.76-.68.77-1.6,1.21-2.76,1.31-.78,0-1.33-.32-1.67-.94-.34-.63-.53-1.36-.58-2.18-.05-.82-.07-1.43-.07-1.82,0-4.16.94-10.43,2.83-18.81,1.89-8.37,3.6-15.66,5.15-21.85,1.26-4.65,1.89-7.17,1.89-7.55-.1,0-.58.63-1.45,1.89-1.45,2.03-3.85,5.2-7.19,9.51-3.34,4.31-7.48,9.1-12.42,14.38-4.94,5.28-10.51,10.33-16.7,15.18-6.2,4.84-12.85,8.86-19.97,12.05-7.11,3.2-14.5,4.79-22.15,4.79-6.1,0-11.69-1.5-16.77-4.5-5.08-3-9.15-7.6-12.2-13.8-3.05-6.2-4.57-14.09-4.57-23.67,0-13.75,3.15-28.46,9.44-44.15,6.29-15.68,14.33-30.37,24.11-44.07,9.78-13.7,20.26-24.91,31.44-33.62s21.66-13.07,31.44-13.07Z" />
                                                                <path className="cls-ag-1" d="M690.95,1182.91h.29c.1,0,.19.05.29.14.1.1.14.24.14.44s-1.77,1.23-5.3,3.12c-3.54,1.89-7.82,3.73-12.85,5.52-5.03,1.79-9.87,2.69-14.52,2.69-5.03,0-8.66-1.28-10.89-3.85-2.23-2.57-3.34-6.37-3.34-11.4,0-1.07-.44-1.6-1.31-1.6h-.15c-1.07,0-2.45.7-4.14,2.11-1.69,1.41-3.03,3.17-3.99,5.3-1.26,2.61-2.18,3.92-2.76,3.92-.1,0-.17-.05-.22-.15-.05-.1-.07-.29-.07-.58,0-.39.05-.73.15-1.02v-.8c0-.05-.05-.07-.15-.07-.19,0-.61.24-1.23.73-.63.48-1.38,1.11-2.25,1.89-1.84,1.55-3.83,3.1-5.95,4.65-2.13,1.55-3.82,2.32-5.08,2.32-.97,0-1.79-.39-2.47-1.16-.58-.68-.87-1.41-.87-2.18v-.44c0-2.03.99-4.72,2.98-8.06,1.98-3.34,4.36-6.34,7.12-9,2.76-2.66,5.35-3.99,7.77-3.99,1.65,0,2.76.53,3.34,1.6.58,1.07.97,2.08,1.16,3.05.1.39.19.7.29.94.1.24.19.36.29.36.29,0,.87-.34,1.74-1.02.87-.58,1.79-1.16,2.76-1.74.97-.58,1.94-.87,2.9-.87,1.55,0,2.59.65,3.12,1.96.53,1.31.99,2.88,1.38,4.72.29,1.74.77,3.51,1.45,5.3.68,1.79,1.77,3.29,3.27,4.5,1.5,1.21,3.8,1.82,6.9,1.82,3.97,0,8.04-.75,12.2-2.25,4.16-1.5,7.84-2.98,11.04-4.43,3.49-1.65,5.81-2.47,6.97-2.47ZM627.93,1184.8c1.84-1.45,3.14-2.56,3.92-3.34.68-.68,1.02-1.35,1.02-2.03v-.29c0-.58-.05-1.11-.14-1.6-.1-.19-.2-.34-.29-.44-.1-.1-.24-.14-.44-.14-.87,0-1.94.58-3.2,1.74-1.26,1.16-2.49,2.52-3.7,4.07-1.21,1.55-2.23,2.98-3.05,4.28-.82,1.31-1.24,2.11-1.24,2.4,0,.1.05.14.15.14.58,0,2.9-1.6,6.97-4.79Z" />
                                                                <path className="cls-ag-1" d="M689.06,1201.35c0,.1.05.14.15.14.19,0,1.02-.94,2.47-2.83,1.45-1.89,3.24-4.33,5.37-7.33,3-4.26,6.27-8.76,9.8-13.5,3.53-4.74,6.83-8.83,9.87-12.27,3.05-3.43,5.3-5.15,6.75-5.15.87,0,1.4.87,1.6,2.61,0,.39-.05.87-.14,1.45-.1.87-.14,2.37-.14,4.5,0,5.52,1.21,9.83,3.63,12.92,2.42,3.1,5.47,4.65,9.15,4.65,2.52,0,5.03-.31,7.55-.94,2.52-.63,4.69-1.23,6.53-1.82,1.74-.58,2.9-.87,3.48-.87.87,0,1.35.24,1.45.73,0,.39-1.19.99-3.56,1.82-2.37.82-5.2,1.6-8.49,2.32-3.29.73-6.24,1.09-8.86,1.09-3.97,0-7.14-.9-9.51-2.69-2.37-1.79-4.07-4.04-5.08-6.75-1.02-2.71-1.52-5.37-1.52-7.99,0-2.23.29-4.26.87-6.1-.39,0-1.82,1.65-4.28,4.94-2.47,3.29-5.35,7.31-8.64,12.05-4.75,6.68-9.34,13-13.8,18.95-4.45,5.95-7.26,8.93-8.42,8.93-.19,0-.44-.05-.73-.14-.29-.1-.53-.24-.73-.44-.58-.58-.87-1.65-.87-3.2,0-2.61.8-6.58,2.4-11.91,1.6-5.33,3.39-10.21,5.37-14.67,1.98-4.45,3.56-6.68,4.72-6.68h.29c.48.1.87.32,1.16.65.29.34.44.7.44,1.09v.29c0,1.07-.56,3.24-1.67,6.53-1.11,3.29-2.3,6.68-3.56,10.17-.87,2.42-1.6,4.5-2.18,6.24-.58,1.74-.87,2.81-.87,3.2Z" />
                                                                <path className="cls-ag-1" d="M752.96,1201.35c0,.1.05.14.15.14.19,0,1.02-.94,2.47-2.83,1.45-1.89,3.24-4.33,5.37-7.33,3-4.26,6.27-8.76,9.8-13.5,3.53-4.74,6.83-8.83,9.87-12.27,3.05-3.43,5.3-5.15,6.75-5.15.87,0,1.4.87,1.6,2.61,0,.39-.05.87-.14,1.45-.1.87-.14,2.37-.14,4.5,0,5.52,1.21,9.83,3.63,12.92,2.42,3.1,5.47,4.65,9.15,4.65,2.52,0,5.03-.31,7.55-.94,2.52-.63,4.69-1.23,6.53-1.82,1.74-.58,2.9-.87,3.48-.87.87,0,1.35.24,1.45.73,0,.39-1.19.99-3.56,1.82-2.37.82-5.2,1.6-8.49,2.32-3.29.73-6.24,1.09-8.86,1.09-3.97,0-7.14-.9-9.51-2.69-2.37-1.79-4.07-4.04-5.08-6.75-1.02-2.71-1.52-5.37-1.52-7.99,0-2.23.29-4.26.87-6.1-.39,0-1.82,1.65-4.28,4.94-2.47,3.29-5.35,7.31-8.64,12.05-4.75,6.68-9.34,13-13.8,18.95-4.45,5.95-7.26,8.93-8.42,8.93-.19,0-.44-.05-.73-.14-.29-.1-.53-.24-.73-.44-.58-.58-.87-1.65-.87-3.2,0-2.61.8-6.58,2.4-11.91,1.6-5.33,3.39-10.21,5.37-14.67,1.98-4.45,3.56-6.68,4.72-6.68h.29c.48.1.87.32,1.16.65.29.34.44.7.44,1.09v.29c0,1.07-.56,3.24-1.67,6.53-1.11,3.29-2.3,6.68-3.56,10.17-.87,2.42-1.6,4.5-2.18,6.24-.58,1.74-.87,2.81-.87,3.2Z" />
                                                                <path className="cls-ag-1" d="M857.22,1182.91h.36s.07.05.07.14c0,.19-1.21,1.36-3.63,3.49-2.42,2.13-5.45,4.52-9.08,7.19-3.63,2.66-7.38,5.03-11.25,7.11-3.87,2.08-7.21,3.12-10.02,3.12h-.87c-.87,0-1.65-.1-2.32-.29-3.78-1.45-5.66-4.55-5.66-9.29,0-2.42.46-5.18,1.38-8.28.92-3.1,2.08-5.83,3.49-8.21,1.4-2.37,2.78-3.56,4.14-3.56.58.1,1.07.34,1.45.73.39.39.58.87.58,1.45,0,1.07-.63,2.86-1.89,5.37-.87,1.94-1.74,4.04-2.61,6.32-.87,2.27-1.31,4.52-1.31,6.75s.6,3.61,1.82,4.43c1.21.82,2.78,1.24,4.72,1.24,3.1,0,6.85-1.43,11.25-4.28,4.4-2.86,8.4-5.69,11.98-8.49,4.07-3.29,6.53-4.94,7.41-4.94ZM826.14,1167.37c-1.16-.58-1.74-1.4-1.74-2.47v-.87c0-1.26.58-2.27,1.74-3.05.68-.39,1.35-.58,2.03-.58.58,0,1.16.14,1.74.44,1.26.87,1.89,1.99,1.89,3.34,0,.97-.36,1.82-1.09,2.54s-1.57,1.09-2.54,1.09c-.68,0-1.36-.14-2.03-.44Z" />
                                                                <path className="cls-ag-1" d="M921.84,1182.91c.29,0,.58.05.87.14.1.1.14.17.14.22v.22c0,.39-1.74,3.36-5.23,8.93-3.49,5.57-7.67,11.84-12.56,18.81-4.89,6.97-9.68,13.14-14.38,18.52-4.7,5.37-8.21,8.06-10.53,8.06-.97,0-1.89-.19-2.76-.58-1.94-1.45-2.9-4.5-2.9-9.15v-.73c0-8.42,2.2-19.1,6.61-32.02,4.4-12.92,9.49-25.82,15.25-38.7,5.76-12.88,10.99-23.91,15.68-33.11,4.7-9.2,7.57-14.57,8.64-16.12-.87.87-3.56,4.79-8.06,11.76-4.5,6.97-9.58,14.96-15.25,23.96-5.66,9-10.65,17.11-14.96,24.32-4.31,7.21-6.46,11.16-6.46,11.84,0,.29.1.73.29,1.31,0,.39.05.78.14,1.16.1.39.15.73.15,1.02v.29c0,.1-.05.19-.15.29h-.14c-.1.1-.2.15-.29.15-.2,0-.39-.15-.58-.44-.19-.29-.34-.58-.44-.87-.1-.29-.19-.51-.29-.65-.1-.14-.19-.22-.29-.22s-.49.58-1.16,1.74c-1.16,2.03-2.86,4.67-5.08,7.91-2.23,3.24-4.57,6.24-7.04,9s-4.62,4.14-6.46,4.14c-1.74,0-2.61-2.08-2.61-6.24,0-3,.61-6.44,1.82-10.31,1.21-3.87,3.07-7.24,5.59-10.09,2.52-2.85,5.66-4.28,9.44-4.28h.87c1.55,0,2.9.78,4.07,2.32.19,0,1.09-1.33,2.69-3.99,1.6-2.66,3.7-6.22,6.32-10.67,4.55-7.74,9.73-16.41,15.54-25.99,5.81-9.59,11.28-18.03,16.41-25.34,5.13-7.31,8.76-10.96,10.89-10.96.48.1.89.36,1.23.8.34.44.51.94.51,1.52,0,.68-2.28,5.81-6.83,15.39-4.84,9.97-10.51,22.24-16.99,36.81-6.49,14.57-12.3,29-17.43,43.27-5.13,14.28-7.7,25.49-7.7,33.62,0,3.29.68,4.94,2.03,4.94,2.13,0,5.47-2.76,10.02-8.28,4.55-5.52,9.27-11.76,14.16-18.73,4.89-6.97,8.98-12.97,12.27-18.01,3.1-4.65,4.74-6.97,4.94-6.97ZM857.51,1199.17c.39-.1,1.33-1.04,2.83-2.83,1.5-1.79,3.12-3.97,4.86-6.53,1.74-2.57,3.27-4.99,4.57-7.26s2.01-3.94,2.11-5.01c-.1-.39-.32-.7-.65-.94-.34-.24-.7-.36-1.09-.36-1.65,0-3.49,1.33-5.52,3.99-2.03,2.66-3.78,5.73-5.23,9.22s-2.18,6.53-2.18,9.15c0,.39.1.58.29.58Z" />
                                                                <path className="cls-ag-1" d="M962.5,1182.62c.87,0,1.31.2,1.31.58,0,.19-.24.46-.73.8-.49.34-1.31.65-2.47.94-1.16.29-2.81.44-4.94.44-4.94,0-8.93-.75-11.98-2.25-3.05-1.5-5.25-2.83-6.61-3.99-.78-.68-1.31-1.02-1.6-1.02-.1.1-.17.17-.22.22-.05.05-.07.12-.07.22.48,1.36.77,2.81.87,4.36,0,5.42-1.6,10.14-4.79,14.16-3.2,4.02-6.3,6.03-9.29,6.03s-4.69-2.37-4.79-7.12c.1-3.87,1.07-7.77,2.9-11.69s4.07-6.85,6.68-8.79c0-.1.05-.15.15-.15.58-.48.99-.82,1.23-1.02.24-.19.36-.44.36-.73v-.14c0-.19.02-.51.07-.94.05-.44.17-.82.36-1.16.19-.34.48-.51.87-.51,1.06,0,2.66,1.07,4.79,3.2,2.13,1.94,4.91,3.99,8.35,6.17,3.43,2.18,7.57,3.27,12.42,3.27,2.32,0,3.97-.2,4.94-.58.77-.19,1.5-.29,2.18-.29ZM923.44,1200.48c1.07,0,2.4-.82,3.99-2.47,1.6-1.65,3.02-3.87,4.28-6.68,1.26-2.81,1.89-5.91,1.89-9.29v-.73c0-.48-.1-1.04-.29-1.67-.19-.63-.46-1.18-.8-1.67-.34-.48-.85-.73-1.52-.73-.87,0-2.06,1.24-3.56,3.7-1.5,2.47-2.83,5.28-3.99,8.42-1.16,3.14-1.74,5.78-1.74,7.91s.58,3.1,1.74,3.19Z" />
                                                            </g>
                                                            <g id="Capa_1-2" data-name="Capa 1-2">
                                                                <path className="cls-ag-1" d="M1063.58,702.31h-352.57l-147.02-301.77c41.98-18.12,88.19-28.14,136.71-28.14,87.82,0,168.1,32.86,229.21,86.91,6.48,5.73,16.32,5.35,22.44-.77h0c6.73-6.73,6.33-17.73-.8-24.04-66.89-59.15-154.76-95.06-250.85-95.06-53.67,0-104.81,11.23-151.14,31.44L373.39,9.25c-2.76-5.67-8.49-9.25-14.8-9.25s-12.05,3.58-14.8,9.25L1.66,711.56c-3.98,8.18-.57,18.05,7.61,22.02,8.16,3.98,18.05.59,22.02-7.61L358.59,54.07l161.38,331.29,14.43,29.63,138.74,284.8,1.22,2.52,11.53,23.67c2.85,5.86,8.73,9.27,14.82,9.27h345.95c-4.28,91.09-43.91,173.09-105.49,232.58-62.34,60.21-147.14,97.32-240.46,97.32s-186.04-40.64-249.08-105.89c-56.64-58.67-92.83-137.21-96.9-224.01-.25-5.46-.4-10.94-.4-16.47s.14-11.01.4-16.47c3.81-81.4,35.86-155.52,86.53-212.79,5.67-6.42,5.5-16.1-.56-22.16l-.52-.52c-6.57-6.57-17.31-6.2-23.47.75-55.89,63.12-91.12,144.91-94.98,234.72-.23,5.46-.36,10.94-.36,16.47s.12,11.01.36,16.47c4.12,95.89,44.01,182.67,106.62,247.29,69,71.22,165.59,115.57,272.35,115.57s195.45-40.8,263.76-106.97c67.53-65.44,110.88-155.71,115.19-255.88.23-5.39.35-10.81.35-16.26v-.38c0-9.03-7.4-16.31-16.42-16.31v-.02Z" />
                                                            </g>
                                                        </g>
                                                    </svg>

                                                </div>
                                                <div className="redesItem">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                                                </div>
                                                <div className="redesItem">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                                </div>
                                                <div className="redesItem">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
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