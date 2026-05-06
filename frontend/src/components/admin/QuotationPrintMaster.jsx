import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FileDown, X, Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import api from '../../services/api';
import './QuotationPrintMaster.css';

const PageItem = ({ id, label, sub, active, onToggle }) => (
    <div className={`page-select-item ${active ? 'active' : ''}`} onClick={onToggle}>
        <input type="checkbox" checked={active} readOnly />
        <div className="page-select-info">
            <span>{label}</span>
            <small>{sub}</small>
        </div>
    </div>
);

const QuotationPrintMaster = ({ data, renderPages }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPages, setSelectedPages] = useState({
        portada: true,
        nosotros: true,
        galeria: true,
        cotizacion: true,
        adicionales: true,
        contacto: true
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const canvasRef = useRef(null);

    const togglePage = (id) => {
        setSelectedPages(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const generatePDF = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        setProgress(5);

        try {
            // 1. Nombre de archivo con formato estricto: YYMMDD • TIPO • NUM • CLIENTE
            const date = new Date(data.fevent || data.fcoti || new Date());
            const yy = date.getFullYear().toString().slice(-2);
            const mm = (date.getMonth() + 1).toString().padStart(2, '0');
            const dd = date.getDate().toString().padStart(2, '0');
            
            const getTipoAbbr = (t) => {
                const upper = (t || '').toUpperCase();
                if (upper.includes('QUINCEAÑOS') || upper.includes('QUINCE AÑOS')) return 'XV';
                if (upper.includes('BODA')) return 'BODA';
                if (upper.includes('ARRIENDO')) return 'ARR';
                return 'EVENTO';
            };

            const tipo = getTipoAbbr(data.tipo_evento_nombre || data.tipo_evento || 'EVENTO');
            const num = data.num || 'SN';
            const clienteStr = (data.cliente_nombre || '').toUpperCase();
            const fileName = `${yy}${mm}${dd} • ${tipo} • ${num} • ${clienteStr}`.trim();

            // 2. Preparar el lienzo
            const container = document.getElementById('virtual-pdf-canvas');
            if (!container) throw new Error("Lienzo no encontrado");

            // Forzar carga de estilos y fuentes
            await new Promise(resolve => setTimeout(resolve, 1500));
            setProgress(15);

            const pages = container.querySelectorAll('.quotation-page');
            if (pages.length === 0) throw new Error("No hay páginas seleccionadas");

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'letter'
            });

            // 3. Captura secuencial
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const exportScale = isMobile ? 2 : 3;
            
            console.log(`Iniciando captura PDF - Modo ${isMobile ? 'Móvil' : 'Escritorio'} - Escala: ${exportScale}`);

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                setProgress(20 + Math.round((i / pages.length) * 60));

                const canvas = await html2canvas(page, {
                    scale: exportScale, 
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#050505',
                    logging: false,
                    width: 816, 
                    windowWidth: 816,
                    imageTimeout: 30000, // Aumentado para móviles
                    onclone: (clonedDoc) => {
                        // Forzar visibilidad absoluta en el clon
                        const clonedCanvas = clonedDoc.getElementById('virtual-pdf-canvas');
                        if (clonedCanvas) clonedCanvas.style.left = '0';
                    }
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.90); // Ligeramente más comprimido para ahorrar memoria
                
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, 0, 216, 279, undefined, 'FAST');
                
                // Pequeño respiro para el recolector de basura en móviles
                if (isMobile) await new Promise(r => setTimeout(r, 100));
            }

            setProgress(90);
            const pdfBlob = pdf.output('blob');
            pdf.save(`${fileName}.pdf`);

            // 4. Auto-archivado en el servidor
            const formData = new FormData();
            formData.append('file', pdfBlob, `${fileName}.pdf`);
            try {
                await api.post(`/documents/upload/${data.id}/cotizacion`, formData);
            } catch (err) { console.error('Archive error:', err); }

            setProgress(100);
            Swal.fire({ title: '¡Listo!', text: 'Documento generado con éxito', icon: 'success', timer: 2000, showConfirmButton: false });
            setIsOpen(false);

        } catch (error) {
            console.error('PDF Error:', error);
            Swal.fire('Error', 'No se pudo completar la exportación.', 'error');
        } finally {
            setIsGenerating(false);
            setProgress(0);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c19b2e] text-black font-bold rounded-full transition-all shadow-lg hover:scale-105"
            >
                <Download className="w-5 h-5" />
                <span>Exportar PDF Premium</span>
            </button>

            {isOpen && (
                <div className="print-master-overlay">
                    <div className="print-config-modal animate-premium">
                        {!isGenerating ? (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold gradient-gold-text">Exportación de Fidelidad</h2>
                                    <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">
                                        <X size={24} />
                                    </button>
                                </div>
                                <p className="text-sm text-white/60 mb-6">El documento se generará en formato Carta (Letter) con alta resolución.</p>

                                <div className="pages-selection-list">
                                    <PageItem id="portada" label="Página 1: Portada & Info" sub="Cabecera editorial y datos clave" active={selectedPages.portada} onToggle={() => togglePage('portada')} />
                                    <PageItem id="cotizacion" label="Página 2: Presupuesto" sub="Detalle de servicios y totales" active={selectedPages.cotizacion} onToggle={() => togglePage('cotizacion')} />
                                    <PageItem id="adicionales" label="Página 3: Adicionales" sub="Sugerencias y contacto final" active={selectedPages.adicionales} onToggle={() => togglePage('adicionales')} />
                                </div>

                                <div className="print-modal-actions mt-8">
                                    <button className="print-modal-btn cancel" onClick={() => setIsOpen(false)}>Cerrar</button>
                                    <button className="print-modal-btn generate" onClick={generatePDF}>
                                        <FileDown size={20} />
                                        Comenzar Exportación
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="print-loader">
                                <div className="print-spinner"></div>
                                <h3 className="text-lg font-bold mt-4">Procesando Páginas...</h3>
                                <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-[#D4AF37] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                                <p className="text-xs text-white/40 mt-4 uppercase tracking-widest">Renderizando Alta Fidelidad (300 DPI)</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Canvas oculto para renderizado */}
            {ReactDOM.createPortal(
                <div id="virtual-pdf-canvas" className="virtual-pdf-canvas" ref={canvasRef}>
                    {renderPages(selectedPages)}
                </div>,
                document.body
            )}
        </>
    );
};

export default QuotationPrintMaster;
