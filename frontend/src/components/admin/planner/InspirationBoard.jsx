import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Upload, Trash2, Filter, Image as ImageIcon, 
    X, MapPin, Tag, Type, MessageSquare, Save
} from 'lucide-react';
import inspiracionService from '../../../services/inspiracionService';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../../config';

const InspirationBoard = ({ cotId, userRole = 'cliente' }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [filterZone, setFilterZone] = useState('Todas');
    const [previewUrl, setPreviewUrl] = useState(null);

    // Form State
    const [newInspo, setNewInspo] = useState({
        titulo: '',
        categoria: '',
        zona: '',
        descripcion: '',
        foto: null
    });

    const baseZones = [
        'Ceremonia', 'Recepción', 'Mesa de Postres', 
        'Coctel de Bienvenida', 'Zona de Fotos', 'Mesa de Invitados',
        'Zona Lounge', 'Entrada'
    ];

    const baseCategories = [
        'Flores / Floristería', 'Iluminación', 'Mobiliario', 
        'Mantelería', 'Menaje / Cristalería', 'Decoración Techos',
        'Centros de Mesa', 'Papelería'
    ];

    useEffect(() => {
        fetchInspirations();
    }, [cotId]);

    const fetchInspirations = async () => {
        try {
            const data = await inspiracionService.getByEvent(cotId);
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewInspo({ ...newInspo, foto: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!newInspo.foto) return Swal.fire('Error', 'La foto es obligatoria', 'error');
        
        try {
            Swal.fire({ title: 'Subiendo inspiración...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            
            await inspiracionService.save({
                ...newInspo,
                cot_id: cotId,
                subido_por: userRole
            });

            Swal.fire('¡Listo!', 'Inspiración agregada correctamente', 'success');
            setIsAdding(false);
            setNewInspo({ titulo: '', categoria: '', zona: '', descripcion: '', foto: null });
            setPreviewUrl(null);
            fetchInspirations();
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const handleDelete = async (id) => {
        const res = await Swal.fire({
            title: '¿Eliminar inspiración?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            background: '#111', color: '#fff',
            confirmButtonColor: '#b76e79'
        });

        if (res.isConfirmed) {
            await inspiracionService.delete(id);
            fetchInspirations();
        }
    };

    const zonesPresent = ['Todas', ...new Set(items.map(i => i.zona).filter(z => z))];

    const filteredItems = items.filter(i => filterZone === 'Todas' || i.zona === filterZone);

    if (loading) return <div className="p-10 text-center opacity-50">Cargando inspiración...</div>;

    return (
        <div className="inspiration-board-v6">
            {/* Header / Toolbar */}
            <div className="inspo-toolbar">
                <div className="inspo-filters">
                    <Filter size={16} />
                    <div className="zones-row">
                        {zonesPresent.map(z => (
                            <button 
                                key={z} 
                                className={filterZone === z ? 'active' : ''} 
                                onClick={() => setFilterZone(z)}
                            >
                                {z}
                            </button>
                        ))}
                    </div>
                </div>
                <button className="btn-add-inspo" onClick={() => setIsAdding(true)}>
                    <Plus size={18} /> Agregar Inspiración
                </button>
            </div>

            {/* Masonry Grid */}
            <div className="inspo-grid">
                <AnimatePresence>
                    {filteredItems.map((item) => (
                        <motion.div 
                            key={item.id}
                            className="inspo-card"
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="inspo-img-wrap">
                                <img src={`${API_BASE_URL.replace('/api','')}${item.foto_path}`} alt={item.titulo} />
                                <div className="inspo-overlay">
                                    <button className="btn-del" onClick={() => handleDelete(item.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="inspo-tags">
                                    {item.zona && <span className="tag zone">{item.zona}</span>}
                                    {item.categoria && <span className="tag cat">{item.categoria}</span>}
                                </div>
                            </div>
                            <div className="inspo-info">
                                <h3>{item.titulo || 'Sin título'}</h3>
                                {item.descripcion && <p>{item.descripcion}</p>}
                                <div className="inspo-meta">
                                    Subido por: <strong>{item.subido_por === 'cliente' ? 'Cliente' : 'Planner'}</strong>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Modal de Carga */}
            {isAdding && (
                <div className="inspo-modal-overlay">
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inspo-modal"
                    >
                        <div className="modal-header">
                            <h2>Nueva Inspiración</h2>
                            <button onClick={() => setIsAdding(false)}><X size={24} /></button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="upload-section">
                                {!previewUrl ? (
                                    <label className="upload-label">
                                        <Upload size={48} />
                                        <span>Seleccionar Imagen</span>
                                        <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                                    </label>
                                ) : (
                                    <div className="preview-wrap">
                                        <img src={previewUrl} alt="Preview" />
                                        <button className="btn-change" onClick={() => setPreviewUrl(null)}>Cambiar Imagen</button>
                                    </div>
                                )}
                            </div>

                            <div className="form-section">
                                <div className="input-group">
                                    <label><Type size={14}/> Título de la idea</label>
                                    <input 
                                        type="text" placeholder="Ej: Camino de flores blancas"
                                        value={newInspo.titulo} onChange={e => setNewInspo({...newInspo, titulo: e.target.value})}
                                    />
                                </div>

                                <div className="row">
                                    <div className="input-group">
                                        <label><MapPin size={14}/> Zona / Lugar</label>
                                        <select 
                                            value={newInspo.zona} 
                                            onChange={e => setNewInspo({...newInspo, zona: e.target.value})}
                                        >
                                            <option value="">Seleccionar Zona...</option>
                                            {baseZones.map(z => <option key={z} value={z}>{z}</option>)}
                                            <option value="Otra">Otra...</option>
                                        </select>
                                        {newInspo.zona === 'Otra' && (
                                            <input 
                                                className="mt-2" type="text" placeholder="Nombre de la zona"
                                                onBlur={e => setNewInspo({...newInspo, zona: e.target.value})}
                                            />
                                        )}
                                    </div>

                                    <div className="input-group">
                                        <label><Tag size={14}/> Categoría</label>
                                        <select 
                                            value={newInspo.categoria} 
                                            onChange={e => setNewInspo({...newInspo, categoria: e.target.value})}
                                        >
                                            <option value="">Seleccionar Categoría...</option>
                                            {baseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                            <option value="Otra">Otra...</option>
                                        </select>
                                        {newInspo.categoria === 'Otra' && (
                                            <input 
                                                className="mt-2" type="text" placeholder="Nombre de la categoría"
                                                onBlur={e => setNewInspo({...newInspo, categoria: e.target.value})}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label><MessageSquare size={14}/> ¿Por qué te gusta esta idea?</label>
                                    <textarea 
                                        placeholder="Escribe aquí los detalles que más te gustan..."
                                        value={newInspo.descripcion} onChange={e => setNewInspo({...newInspo, descripcion: e.target.value})}
                                    />
                                </div>

                                <button className="btn-submit" onClick={handleSave}>
                                    <Save size={18} /> Guardar Inspiración
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            <style>{`
                .inspiration-board-v6 { padding: 10px; }
                
                .inspo-toolbar { 
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 30px; gap: 20px;
                }
                .inspo-filters { 
                    display: flex; align-items: center; gap: 15px; flex: 1; 
                    background: rgba(255,255,255,0.03); padding: 8px 15px; border-radius: 50px;
                }
                .zones-row { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 2px; }
                .zones-row::-webkit-scrollbar { height: 0; }
                .zones-row button {
                    white-space: nowrap; background: none; border: none; color: rgba(255,255,255,0.4);
                    font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.3s;
                }
                .zones-row button.active { color: #b76e79; }

                .btn-add-inspo {
                    background: #b76e79; color: #fff; border: none; padding: 10px 20px;
                    border-radius: 50px; font-size: 13px; font-weight: 700; cursor: pointer;
                    display: flex; align-items: center; gap: 8px; flex-shrink: 0;
                    box-shadow: 0 4px 15px rgba(183, 110, 121, 0.3);
                }

                .inspo-grid {
                    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 25px;
                }
                .inspo-card {
                    background: rgba(255,255,255,0.02); border-radius: 15px; overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.05); transition: 0.3s;
                }
                .inspo-card:hover { transform: translateY(-5px); border-color: rgba(183, 110, 121, 0.3); }
                
                .inspo-img-wrap { position: relative; width: 100%; aspect-ratio: 4/5; overflow: hidden; }
                .inspo-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
                
                .inspo-overlay {
                    position: absolute; inset: 0; background: rgba(0,0,0,0.4);
                    display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s;
                }
                .inspo-img-wrap:hover .inspo-overlay { opacity: 1; }
                .btn-del { 
                    background: #e74c3c; color: #fff; border: none; padding: 10px; 
                    border-radius: 50%; cursor: pointer; transform: scale(0.8); transition: 0.2s;
                }
                .btn-del:hover { transform: scale(1); }

                .inspo-tags {
                    position: absolute; bottom: 10px; left: 10px; display: flex; flex-wrap: wrap; gap: 5px;
                }
                .tag { font-size: 9px; font-weight: 800; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; }
                .tag.zone { background: #b76e79; color: #fff; }
                .tag.cat { background: rgba(0,0,0,0.5); color: #fff; backdrop-filter: blur(5px); }

                .inspo-info { padding: 15px; }
                .inspo-info h3 { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
                .inspo-info p { font-size: 13px; opacity: 0.6; line-height: 1.4; margin-bottom: 12px; }
                .inspo-meta { font-size: 10px; opacity: 0.4; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; }

                /* MODAL */
                .inspo-modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
                    display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
                }
                .inspo-modal {
                    background: #111; border: 1px solid rgba(255,255,255,0.1); width: 100%; max-width: 900px;
                    border-radius: 20px; overflow: hidden;
                }
                .modal-header {
                    padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05);
                    display: flex; justify-content: space-between; align-items: center;
                }
                .modal-header h2 { font-size: 20px; font-weight: 700; color: #b76e79; }
                .modal-header button { background: none; border: none; color: #fff; cursor: pointer; opacity: 0.5; }

                .modal-body { display: grid; grid-template-columns: 1fr 1fr; }
                .upload-section { background: rgba(255,255,255,0.02); display: flex; align-items: center; justify-content: center; min-height: 400px; }
                .upload-label { 
                    display: flex; flex-direction: column; align-items: center; gap: 15px;
                    cursor: pointer; opacity: 0.4; transition: 0.3s;
                }
                .upload-label:hover { opacity: 0.8; }
                .preview-wrap { width: 100%; height: 100%; position: relative; }
                .preview-wrap img { width: 100%; height: 100%; object-fit: cover; }
                .btn-change {
                    position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
                    background: rgba(0,0,0,0.6); padding: 8px 15px; border-radius: 50px; font-size: 12px;
                }

                .form-section { padding: 30px; display: flex; flex-direction: column; gap: 20px; }
                .input-group { display: flex; flex-direction: column; gap: 8px; }
                .input-group label { font-size: 12px; font-weight: 700; opacity: 0.5; display: flex; align-items: center; gap: 6px; }
                .input-group input, .input-group select, .input-group textarea {
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); 
                    border-radius: 8px; color: #fff; padding: 12px; font-size: 14px;
                }
                .input-group textarea { height: 100px; resize: none; }
                .form-section .row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .btn-submit {
                    background: #b76e79; color: #fff; border: none; padding: 15px;
                    border-radius: 10px; font-weight: 700; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 10px;
                }

                @media (max-width: 800px) {
                    .modal-body { grid-template-columns: 1fr; }
                    .upload-section { min-height: 250px; }
                }
            `}</style>
        </div>
    );
};

export default InspirationBoard;
