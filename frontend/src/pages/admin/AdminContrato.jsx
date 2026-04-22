import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Printer, ArrowLeft, FileText, Globe, Phone, Mail, MapPin } from 'lucide-react';
import { numeroALetras } from '../../services/numberToWords';
import { UPLOADS_URL } from '../../config';
import { parseDateSafe } from '../../utils/dateUtils';
import '../style/QuotationContract.css';

const AdminContrato = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [globalDeposito, setGlobalDeposito] = useState(0);
    const [pagos, setPagos] = useState([]);

    useEffect(() => {
        const fetchData = async () => {

            setLoading(true);
            try {
                const cotiRes = await api.get(`/cotizaciones/${id}`);
                setData(cotiRes.data);
                const coti = cotiRes.data;

                try {
                    let confId = coti.conf_id || (coti.configuracion ? coti.configuracion.id : null);
                    if (confId) {
                        const confRes = await api.get(`/configuraciones/${confId}`);
                        setConfig(Array.isArray(confRes.data) ? confRes.data[0] : confRes.data);
                    } else {
                        const confRes = await api.get('/configuraciones');
                        setConfig(Array.isArray(confRes.data) ? confRes.data[0] : confRes.data);
                    }
                } catch (e) {
                    if (coti.configuracion) setConfig(coti.configuracion);
                }

                // Obtener valor estándar de depósito desde el catálogo global
                try {
                    const artRes = await api.get('/articulos');
                    const arts = Array.isArray(artRes.data) ? artRes.data : [];
                    const depItem = arts.find(a =>
                        (a.nombre || '').toLowerCase().includes('deposito') ||
                        (a.nombre || '').toLowerCase().includes('depósito')
                    );
                    if (depItem) {
                        setGlobalDeposito(Number(depItem.precio_u || depItem.precio || 0));
                    }
                } catch (errArt) {
                    console.error("Error cargando artículos del catálogo:", errArt);
                }

                // Obtener abonos reales realizados
                try {
                    const pagosRes = await api.get(`/pagos/cotizacion/${id}`);
                    setPagos(pagosRes.data || []);
                } catch (errPagos) {
                    console.error("Error cargando pagos:", errPagos);
                }
            } catch (err) {
                console.error('Error crítico cargando contrato:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

    }, [id]);

    if (loading) return <div className="contract-loading">Generando Contrato Legal...</div>;
    if (!data || !config) return <div className="contract-empty">No se pudo cargar la información del contrato.</div>;

    const { cliente, detalles } = data;
    const formatCurrency = (val) => Number(val || 0).toLocaleString('es-CO');

    const formatTimeToAMPM = (timeStr) => {
        if (!timeStr) return '';
        if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr; // Already formatted
        const parts = timeStr.split(':');
        let h = parseInt(parts[0]);
        const m = parts[1] || '00';
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12;
        return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
    };

    const mesesEsp = [
        'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
        'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];

    // Procesamiento de fechas inicio
    const fechaE = parseDateSafe(data.fevent);
    const diaE = fechaE ? fechaE.getDate().toString().padStart(2, '0') : '--';
    const mesE = fechaE ? mesesEsp[fechaE.getMonth()] : '----------';
    const añoE = fechaE ? fechaE.getFullYear() : '----';

    // Procesamiento de fechas fin
    const fechaF = data.fevent_fin ? parseDateSafe(data.fevent_fin) : fechaE;
    const diaF = fechaF ? fechaF.getDate().toString().padStart(2, '0') : diaE;
    const mesF = fechaF ? mesesEsp[fechaF.getMonth()] : mesE;
    const añoF = fechaF ? fechaF.getFullYear() : añoE;

    const hoy = new Date();
    const diaH = hoy.getDate().toString().padStart(2, '0');
    const mesH = mesesEsp[hoy.getMonth()];
    const añoH = hoy.getFullYear();

    const getDeposito = () => {
        if (globalDeposito > 0) return globalDeposito;
        if (!detalles) return 0;
        const item = detalles.find(i =>
            i.nombre.toLowerCase().includes('deposito') ||
            i.nombre.toLowerCase().includes('depósito')
        );
        return item ? Number(item.precio_u || item.subtotal || item.precio || 0) : 0;
    };
    const montoDeposito = getDeposito();

    const anticipoReal = Math.max(
        (pagos || [])
            .filter(p => p.estado === 'completado')
            .reduce((acc, p) => acc + Number(p.monto), 0),
        Number(data.anticipo || 0)
    );

    const saldoReal = Number(data.monto_final || 0) - anticipoReal;

    const handlePrint = () => {
        const headerHtml = document.querySelector('.contract-header-v3').outerHTML;
        const bodyHtml = document.querySelector('.contract-body-v3').innerHTML;
        const footerHtml = document.querySelector('.contract-footer-v3').outerHTML;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Contrato Legal - ArchiPlanner</title>
                    <link href="https://fonts.googleapis.com/css2?family=Mrs+Saint+Delafield&family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
                    <style>
                        body { margin: 0; padding: 0; background: #fff !important; font-family: 'Roboto', sans-serif; }
                        
                        /* Layout Table System */
                        .report-container { width: 100%; border-collapse: collapse; }
                        .report-header-spacer { height: 2.5cm; }
                        .report-footer-spacer { height: 2.8cm; }

                        /* Fixed Layer */
                        .fixed-header { 
                            position: fixed; top: 0; left: 0; right: 0; height: 2.5cm; 
                            background: white; z-index: 1000; 
                            display: flex; align-items: center; justify-content: center;
                            box-sizing: border-box; 
                        }
                        .fixed-header-inner { width: 21.59cm; padding: 0 1.5cm; }

                        .fixed-footer { 
                            position: fixed; bottom: 0; left: 0; right: 0; height: 2.8cm; 
                            background: white; z-index: 1000; 
                            display: flex; align-items: center; justify-content: center;
                            box-sizing: border-box; 
                        }
                        .fixed-footer-inner { width: 21.59cm; padding: 0 1.5cm; }

                        /* Content Cell */
                        .report-content { 
                            padding: 0 1.5cm; 
                            width: 21.59cm; 
                            vertical-align: top;
                        }
                        .content-wrapper { width: 100%; margin: 0 auto; }

                        /* Professional Styles */
                        .contract-header-v3 { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #111; padding-bottom: 10px; width: 100%; margin: 0; }
                        .header-brand-text { font-family: 'Mrs Saint Delafield', cursive; font-size: 32px; color: #111; margin: 0; }
                        .header-brand-logo img { max-height: 60px; width: auto; filter: brightness(0); }
                        
                        .main-title { text-align: center; font-size: 14pt; font-weight: 700; margin: 25px 0; text-transform: uppercase; text-decoration: underline; }
                        .legal-intro p, .legal-clauses-v3 p, .legal-closure p { font-size: 11pt; line-height: 1.6; text-align: justify; margin-bottom: 14px; }
                        .dynamic-field { font-weight: 700; text-decoration: underline; }
                        
                        .contract-items-table-v3 { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 10pt; }
                        .contract-items-table-v3 th { background: #f9f9f9; padding: 12px; border-bottom: 2px solid #111; text-align: left; text-transform: uppercase; }
                        .contract-items-table-v3 td { padding: 10px; border-bottom: 1px solid #eee; }
                        
                        .signatures-block-v3 { display: flex; justify-content: space-between; margin-top: 50px; page-break-inside: avoid; }
                        .signature-box { width: 42%; text-align: center; }
                        .sign-line { border-top: 2px solid #000; margin-bottom: 12px; }
                        .sign-name { font-weight: 700; text-transform: uppercase; }

                        .contract-footer-v3 { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #111; padding-top: 15px; width: 100%; }
                        .footer-company-info { display: flex; flex-direction: column; font-size: 9pt; }
                        .footer-item { display: flex; align-items: center; gap: 5px; margin-bottom: 3px; }

                        @media print {
                            @page { size: letter; margin: 0; }
                            body { -webkit-print-color-adjust: exact; }
                            .fixed-header, .fixed-footer { background: white !important; }
                        }
                    </style>
                </head>
                <body>
                    <div class="fixed-header">
                        <div class="fixed-header-inner">${headerHtml}</div>
                    </div>
                    <div class="fixed-footer">
                        <div class="fixed-footer-inner">${footerHtml}</div>
                    </div>

                    <table class="report-container">
                        <thead>
                            <tr><th class="report-header-spacer"></th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td align="center">
                                    <div class="report-content">
                                        <div class="content-wrapper">
                                            ${bodyHtml}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr><td class="report-footer-spacer"></td></tr>
                        </tfoot>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="admin-contract-container">
            <div className="contract-actions no-print">
                <button
                    onClick={() => navigate(`/admin/cotizaciones/editar/${id}`)}
                    className="btn-admin-secondary btn-minimal"
                >
                    <ArrowLeft size={16} /> Volver
                </button>
                <button
                    onClick={handlePrint}
                    className="btn-admin-primary btn-minimal"
                >
                    <Printer size={16} /> Imprimir Contrato
                </button>
            </div>

            <div className="contract-sheet letter-size premium-roboto">
                <header className="contract-header-v3">
                    <div className="header-brand-text">Contrato</div>
                    <div className="header-brand-logo">
                        <img
                            src={
                                config?.logo_black_path
                                    ? getUploadUrl(config.logo_black_path)
                                    : (config?.logo_horizontal_path
                                        ? getUploadUrl(config.logo_horizontal_path)
                                        : (config?.logo_cuadrado_path
                                            ? getUploadUrl(config.logo_cuadrado_path)
                                            : '/placeholder.png'))
                            }
                            alt="Logo"
                        />
                    </div>
                </header>

                <main className="contract-body-v3">
                    <h2 className="main-title">CONTRATO DE PRESTACIÓN DE SERVICIOS</h2>

                    <section className="legal-intro">
                        <p>
                            Entre los suscritos; <span className="dynamic-field">{cliente?.nombre || ''} {cliente?.apellido || ''}</span>,
                            identificado con cédula de ciudadanía número <span className="dynamic-field">{cliente?.documento || '____________________'}</span>,
                            expedida en <span className="dynamic-field">{cliente?.ciudad_cedula || '____________________'}</span> quien para efectos de este contrato se denominará EL CONTRATANTE por una parte,
                            y <span className="dynamic-field">{config?.ceo || 'LUIS MANUEL ARCHILA CASTILLO'}</span>, identificado con número <span className="dynamic-field">{config?.cedula || '1.414.685'}</span>,
                            expedida en <span className="dynamic-field">{config?.ciudad_expedicion || 'Bogotá'}</span> quien para efectos de este contrato se denominará EL CONTRATISTA,
                            hemos convenido celebrar el presente contrato de prestación de servicios y alquiler de un salón social, mobiliario, decoración y servicio de catering, el cual se regirá por las siguientes cláusulas:
                        </p>
                    </section>

                    <section className="legal-clauses-v3">
                        <p><strong>PRIMERA. - OBJETO DEL CONTRATO:</strong> Prestar los servicios de alquiler de un salón social, mobiliario, decoración y servicio de catering; para la preparación, organización, montaje y acompañamiento de un evento de encuentro social.</p>

                        <p><strong>SEGUNDA. - ALCANCE DEL OBJETO:</strong> EL CONTRATISTA se compromete el día <span className="dynamic-field">{diaE}</span> del mes de <span className="dynamic-field">{mesE}</span> del año <span className="dynamic-field">{añoE}</span> a prestar el servicio del evento.</p>

                        <p><strong>PARÁGRAFO 1. - HORARIO DE PRESTACION DE SERVICIOS:</strong>  La prestación de servicios se limitará estrictamente al horario del evento, desde las <span className="dynamic-field">{formatTimeToAMPM(data.hora_inicio) || '04:00 PM'} </span> del <span className="dynamic-field">{fechaE.toLocaleDateString()}</span> hasta las <span className="dynamic-field">{formatTimeToAMPM(data.hora_fin) || '02:00 AM'}</span> del <span className="dynamic-field">{fechaF.toLocaleDateString()}</span>. En ningún caso podrá prorrogarse este horario debido a que es contrario a las normas y leyes vigentes para el funcionamiento y uso de los salones sociales y el incumplimiento de este horario podría derivar de multas y sanciones para el establecimiento.</p>

                        <p><strong>PARÁGRAFO 2. - ESTADO DE LOS ELEMENTOS Y MATERIALES ALQUILADOS:</strong> Los elementos, materiales y utensilios se entregarán contados y se verificará el estado en el que se entregan, de igual forma al momento de ser retornados se realizará conteo y verificación del estado a fin de conservar los mismos, de encontrarse algún daño, avería o pérdida de dichos elementos, materiales y utensilios se reportará al titular del contrato de fin de realizar el pago de los mismos. Lo cual incluye los siguientes materiales y servicios, de acuerdo con las siguientes condiciones:</p>

                        <table className="contract-items-table-v3">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>CANT</th>
                                    <th>ITEM</th>
                                    <th>OBSERVACIÓN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(detalles || []).map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="text-center">{Math.floor(item.cantidad)}</td>
                                        <td>{item.nombre}</td>
                                        <td>{item.notas || ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <p><strong>TERCERA. - LUGAR DE EJECUCIÓN:</strong> El contrato se ejecutará en las instalaciones de <span className="dynamic-field">{data.lugar || ''}</span>.</p>

                        <p><strong>QUARTA. - VALOR DEL CONTRATO Y FORMA DE PAGO:</strong> El contrato tendrá un valor total de <span className="dynamic-field">$ {formatCurrency(data.monto_final)} ({numeroALetras(data.monto_final)})</span> M/C. Anticipo: <span className="dynamic-field">$ {formatCurrency(anticipoReal)} ({numeroALetras(anticipoReal)})</span>, el cual fue usado para apartar la fecha. Dejando un saldo por valor de <span className="dynamic-field">$ {formatCurrency(saldoReal)} ({numeroALetras(saldoReal)})</span>, el cual debe ser cancelado en su totalidad 8 días antes del evento.</p>

                        <p><strong>PARÁGRAFO 1.:</strong> Es obligatorio realizar el anticipo del contrato debido a que con este se inicia la obligación contractual entre las partes y a su vez se realiza para apartar la fecha del evento y disponer de lugar , las personas y los demás elementos necesarios para el cumplimiento del contrato y la realización del evento ; Por lo tanto en caso tal de fuerza mayor o caso fortuito que imposibilite la realización del evento se debe comunicar de manera inmediata al contratista para no perder el monto pagado de dicho anticipo y/o los dineros pagados ; De igual forma es obligación del CONTRATANTE de demostrar esta exclusión de responsabilidad, en caso de que se demuestre que el incumplimiento se deriva de un caso de fuerza mayor y/o un caso fortuito se realizará una nueva programación de la fecha del evento ; En ningún caso se realizará retorno o reembolso de dinero.</p>

                        <p><strong>QUINTA. - CLÁUSULA PENAL:</strong> En caso de incumplimiento presentado por cualquiera de las partes en cualquiera de las obligaciones estipuladas en el presente contrato, la una cancelará a la otra parte a título de pena el equivalente al 50% del valor total del contrato. Este valor podrá ser cobrado por la vía ejecutiva. El pago de las sumas antes señaladas no extingue las obligaciones emanadas del contrato, ni exime a las partes de indemnizar los perjuicios causados.</p>

                        <p><strong>SEXTA. - AUSENCIA DE RELACIÓN LABORAL:</strong> El presente contrato será ejecutado por EL CONTRATISTA con absoluta autonomía e independencia y, en desarrollo del mismo, no se generará vínculo laboral alguno entre EL CONTRATANTE y EL CONTRATISTA o sus dependientes o subcontratistas o cualquier otro tipo de personal a su cargo.</p>

                        <p><strong>SÉPTIMA. - MODIFICACIONES EN LAS CANTIDADES:</strong> Las cantidades estipuladas podrán ser modificadas una semana antes del día del evento como último plazo.</p>

                        <p><strong>OCTAVA. - EXCLUSIÓN DE RESPONSABILIDADES:</strong> EL CONTRATANTE excluye de todos los daños y perjuicios contractuales, extracontractuales, daño emergente y/o lucros cesantes que no puedan ser atribuidos bajo responsabilidad expresa y tácita del contratante y que no se encuentren derivadas de la realización y ejecución del presente contrato.</p>

                        <p><strong>PARÁGRAFO 1.:</strong> Las actuaciones, comportamientos y/o actos de los invitados, asistentes y/o familiares del CONTRATANTE; Dentro del desarrollo del sitio del evento y/o fuera del sitio del contrato serán responsabilidad única y exclusivamente de quien las realice y en su defecto del CONTRATANTE porque son situación y comportamientos que no se encuentran bajo el control y supervisión del contratista.</p>

                        <p><strong>NOVENA. - DEPOSITO POR DAÑOS Y PERJUICIOS:</strong> EL CONTRATANTE debe dejar un depósito que será reembolsado al mismo a la recepción y verificación de los elementos y el salón con el único y exclusivo fin de establecer una garantía ante los posibles daños por un monto de <span className="dynamic-field">$ {formatCurrency(montoDeposito)} ({numeroALetras(montoDeposito)})</span>.</p>

                        <p><strong>DÉCIMA. - SUPERVISIÓN:</strong> El CONTRATANTE o su representante supervisarán la ejecución del servicio encomendado, y podrá formular las observaciones del caso, para ser analizadas conjuntamente con El CONTRATISTA.</p>


                        <p><strong>DÉCIMA PRIMERA. - TERMINACIÓN:</strong> El presente contrato terminará por acuerdo entre las partes y unilateralmente por el incumplimiento de las obligaciones derivadas del contrato, entre las cuales se menciona, el deber de cumplir con los requerimientos de salud ocupacional y seguridad industrial.</p>

                        <p><strong>DÉCIMA SEGUNDA. - INDEPENDENCIA:</strong> El CONTRATISTA actuará por su cuenta, con autonomía y sin que exista relación laboral, ni subordinación con El CONTRATANTE. Sus derechos se limitarán por la naturaleza del contrato, a exigir el cumplimiento de las obligaciones del CONTRATANTE y el pago oportuno de su remuneración fijada en este documento.</p>

                        <p><strong>DÉCIMA TERCERA. - CESIÓN:</strong> El CONTRATISTA no podrá ceder parcial ni totalmente la ejecución del presente contrato a un tercero, sin la previa, expresa y escrita autorización del CONTRATANTE.</p>

                        <p><strong>DÉCIMA QUARTA. - EL CONTRATISTA:</strong> Podrá subcontratar al personal necesario que, bajo su responsabilidad, siempre y cuando garantice el cumplimiento de la afiliación y pago de la seguridad social, entiéndase por esto salud, pensión, riesgos laborales, cumplir con los requerimientos de salud ocupacional y seguridad industrial; quien ayudará a cumplir a cabalidad el objeto del presente contrato.</p>

                        <p><strong>DÉCIMA QUINTA. - DOMICILIO:</strong> Para todos los efectos legales, se fija como domicilio contractual a la ciudad de BUCARAMANGA en la dirección <span className="dynamic-field">{config?.city || config?.direccion || 'Crr. 17F, #58A - 49'}</span>.
                        </p>

                        <p><strong>DÉCIMA SEXTA. - </strong> En caso de fallecimiento del CONTRATISTA, dará lugar a la finalización del contrato hasta el día de la muerte. No formará parte dicho contrato de la masa sucesoral del CONTRATISTA.</p>

                        <p><strong>DÉCIMA SÉPTIMA. -</strong> Se anexa cotización con el listado de productos y servicios que se prestarán en dicha actividad.</p>
                    </section>

                    <section className="legal-closure">
                        <p>Las partes suscriben el presente documento a los <span className="dynamic-field">{diaH}</span> días del mes de <span className="dynamic-field">{mesH}</span> de <span className="dynamic-field">{añoH}</span>, en la ciudad de Bucaramanga, Santander.</p>
                    </section>

                    <div className="signatures-block-v3">
                        <div className="signature-box">
                            <div className="sign-line"></div>
                            <p className="sign-name">{cliente?.nombre} {cliente?.apellido}</p>
                            <p className="sign-id">C.C. {cliente?.documento} - {cliente?.ciudad_cedula}</p>
                            <p className="sign-role">EL CONTRATANTE</p>
                        </div>
                        <div className="signature-box">
                            <div className="sign-line"></div>
                            <p className="sign-name">{config?.ceo || "LUIS MANUEL ARCHILA CASTILLO"}</p>
                            <p className="sign-id">C.C. {config?.cedula || "1.414.685"} - {config?.ciudad_expedicion || "Bogotá"}</p>
                            <p className="sign-role">EL CONTRATISTA</p>
                        </div>
                    </div>
                </main>

                <footer className="contract-footer-v3">
                    <div className="footer-company-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div className="footer-item">
                            <MapPin size={12} style={{ marginRight: '5px' }} />
                            <span>{config?.city || config?.direccion || 'Bucaramanga, Santander'}</span>
                        </div>
                        <div className="footer-item">
                            <Globe size={12} style={{ marginRight: '5px' }} />
                            <span>{config?.web || 'ArchiPlanner'}</span>
                        </div>
                    </div>

                    <div className="footer-company-info">
                        <div className="footer-item">
                            <Phone size={12} style={{ marginRight: '5px' }} />
                            <span>{config?.telefono || '315 707 1830'}</span>
                        </div>
                        <div className="footer-item">
                            <Mail size={12} style={{ marginRight: '5px' }} />
                            <span>{config?.email_contacto || 'hola@archiplanner.com'}</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AdminContrato;
