import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Save, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Globe, 
    Info, 
    Upload, 
    CheckCircle, 
    AlertCircle,
    Loader2,
    Edit2,
    Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL, UPLOADS_URL } from '../../config';
import '../style/AdminEmpresa.css';

const AdminEmpresa = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { companyConfig, setCompanyConfig } = useAuth();
    const [fetchedConfig, setFetchedConfig] = useState(null);
    const [formData, setFormData] = useState({
        nombre_empresa: '',
        ceo: '',
        email_contacto: '',
        telefono: '',
        city: '',
        ig_url: '',
        fb_url: '',
        tt_url: '',
        li_url: '',
        x_url: '',
        web_url: '',
        color_primario: '#FF8484',
        color_secundario: '#2C2C2C',
        color_terciario: '#5fdcc7',
        color_fondo: '#121212',
        logo_cuadrado_path: '',
        logo_horizontal_path: ''
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    
    const fileInputHorizontal = useRef(null);
    const fileInputCuadrado = useRef(null);

    useEffect(() => {
        const fetchSpecific = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const res = await axios.get(`${API_BASE_URL}/configuraciones/${id}`);
                setFetchedConfig(res.data);
                setFormData({
                    nombre_empresa: res.data.nombre_empresa || '',
                    ceo: res.data.ceo || '',
                    email_contacto: res.data.email_contacto || '',
                    telefono: res.data.telefono || '',
                    city: res.data.city || '',
                    ig_url: res.data.ig_url || '',
                    fb_url: res.data.fb_url || '',
                    tt_url: res.data.tt_url || '',
                    li_url: res.data.li_url || '',
                    x_url: res.data.x_url || '',
                    web_url: res.data.web_url || '',
                    color_primario: res.data.color_primario || '#FF8484',
                    color_secundario: res.data.color_secundario || '#2C2C2C',
                    color_terciario: res.data.color_terciario || '#5fdcc7',
                    color_fondo: res.data.color_fondo || '#121212',
                    logo_cuadrado_path: res.data.logo_cuadrado_path || '',
                    logo_horizontal_path: res.data.logo_horizontal_path || ''
                });
            } catch (err) {
                console.error("Error al cargar empresa:", err);
                setStatus({ type: 'error', message: 'No se pudo cargar la configuración de la empresa' });
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSpecific();
        } else if (companyConfig) {
            // Fallback to active one if no ID (though we should always have one in /editar/:id)
            setFetchedConfig(companyConfig);
            setFormData({
                nombre_empresa: companyConfig.nombre_empresa || '',
                ceo: companyConfig.ceo || '',
                email_contacto: companyConfig.email_contacto || '',
                telefono: companyConfig.telefono || '',
                city: companyConfig.city || '',
                ig_url: companyConfig.ig_url || '',
                fb_url: companyConfig.fb_url || '',
                tt_url: companyConfig.tt_url || '',
                li_url: companyConfig.li_url || '',
                x_url: companyConfig.x_url || '',
                web_url: companyConfig.web_url || '',
                color_primario: companyConfig.color_primario || '#FF8484',
                color_secundario: companyConfig.color_secundario || '#2C2C2C',
                color_terciario: companyConfig.color_terciario || '#5fdcc7',
                color_fondo: companyConfig.color_fondo || '#121212',
                logo_cuadrado_path: companyConfig.logo_cuadrado_path || '',
                logo_horizontal_path: companyConfig.logo_horizontal_path || ''
            });
        }
    }, [id, companyConfig]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageClick = (ref) => {
        if (ref.current) ref.current.click();
    };

    const handleFileChange = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('logo', file);
        uploadData.append('type', type);
        if (id) uploadData.append('id', id);

        try {
            setLoading(true);
            const res = await axios.put(`${API_BASE_URL}/config/logo`, uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data.success) {
                const updatedPath = res.data.path;
                const pathKey = type === 'horizontal' ? 'logo_horizontal_path' : 'logo_cuadrado_path';
                
                setFetchedConfig(prev => ({ ...prev, [pathKey]: updatedPath }));
                
                // CRITICAL: Update formData too so the next handleSubmit doesn't overwrite with NULL
                setFormData(prev => ({ ...prev, [pathKey]: updatedPath }));
                
                // If this is the active company, update global context
                if (!id || companyConfig?.id === parseInt(id)) {
                    setCompanyConfig(prev => ({ ...prev, [pathKey]: updatedPath }));
                }
                setStatus({ type: 'success', message: 'Logo actualizado correctamente' });
            }
        } catch (err) {
            console.error('Error al subir logo:', err);
            setStatus({ type: 'error', message: 'Error al subir el logo' });
        } finally {
            setLoading(false);
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const apiPath = id ? `${API_BASE_URL}/configuraciones/${id}` : `${API_BASE_URL}/config`;
            const res = await axios.put(apiPath, formData);
            if (res.data.success) {
                // If it's the active one, update the global branding
                if (!id || companyConfig?.id === parseInt(id)) {
                    setCompanyConfig(prev => ({ ...prev, ...formData }));
                }
                setStatus({ type: 'success', message: 'Configuración guardada exitosamente' });
            }
        } catch (err) {
            console.error('Error al guardar config:', err);
            setStatus({ type: 'error', message: 'Error al guardar los cambios' });
        } finally {
            setLoading(false);
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        }
    };

    return (
        <div className="admin-empresa-container">
            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Procesando...</p>
                </div>
            )}

            <div className="admin-empresa-header">
                <h2>Configuración de Empresa</h2>
                <button 
                    type="submit" 
                    form="empresa-form" 
                    className="btn-save"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Guardar Cambios
                </button>
            </div>

            {status.message && (
                <div className={`status-alert ${status.type}`} style={{
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    background: status.type === 'success' ? 'rgba(95, 220, 199, 0.1)' : 'rgba(255, 132, 132, 0.1)',
                    color: status.type === 'success' ? '#5fdcc7' : '#ff8484',
                    border: `1px solid ${status.type === 'success' ? '#5fdcc7' : '#ff8484'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {status.message}
                </div>
            )}

            <div className="admin-empresa-grid">
                {/* Columna Izquierda: Branding */}
                <div className="branding-column">
                    <div className="empresa-card">
                        <div className="logo-upload-section">
                            <h3>Logo Horizontal (Header/Landing)</h3>
                            <div 
                                className="logo-display horizontal" 
                                onClick={() => handleImageClick(fileInputHorizontal)}
                            >
                                {fetchedConfig?.logo_horizontal_path ? (
                                    <img src={`${UPLOADS_URL}${fetchedConfig.logo_horizontal_path}`} alt="Logo Horizontal" />
                                ) : (
                                    <div className="placeholder-icon">
                                        <Plus size={40} />
                                        <span>Click para subir</span>
                                    </div>
                                )}
                                <div className="logo-overlay">
                                    <Edit2 size={24} />
                                    <span>Cambiar Logo</span>
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputHorizontal} 
                                style={{ display: 'none' }} 
                                onChange={(e) => handleFileChange(e, 'horizontal')}
                                accept="image/*"
                            />
                        </div>

                        <div className="logo-upload-section" style={{ marginTop: '30px' }}>
                            <h3>Logo Cuadrado (Icono/Footer)</h3>
                            <div 
                                className="logo-display" 
                                onClick={() => handleImageClick(fileInputCuadrado)}
                            >
                                {fetchedConfig?.logo_cuadrado_path ? (
                                    <img src={`${UPLOADS_URL}${fetchedConfig.logo_cuadrado_path}`} alt="Logo Cuadrado" />
                                ) : (
                                    <div className="placeholder-icon">
                                        <Plus size={40} />
                                        <span>Click para subir</span>
                                    </div>
                                )}
                                <div className="logo-overlay">
                                    <Edit2 size={24} />
                                    <span>Cambiar Icono</span>
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputCuadrado} 
                                style={{ display: 'none' }} 
                                onChange={(e) => handleFileChange(e, 'cuadrado')}
                                accept="image/*"
                            />
                        </div>
                    </div>

                    <div className="empresa-card">
                        <h3>Paleta de Colores</h3>
                        <div className="colors-row">
                            <div className="input-container">
                                <label>Primario</label>
                                <input 
                                    type="color" 
                                    name="color_primario" 
                                    value={formData.color_primario} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className="input-container">
                                <label>Secundario</label>
                                <input 
                                    type="color" 
                                    name="color_secundario" 
                                    value={formData.color_secundario} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className="input-container">
                                <label>Terciario</label>
                                <input 
                                    type="color" 
                                    name="color_terciario" 
                                    value={formData.color_terciario} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className="input-container">
                                <label>Fondo</label>
                                <input 
                                    type="color" 
                                    name="color_fondo" 
                                    value={formData.color_fondo} 
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Información */}
                <div className="info-column">
                    <form id="empresa-form" onSubmit={handleSubmit} className="empresa-card">
                        <section className="form-section">
                            <h3><Info size={20} /> Información General</h3>
                            <div className="form-grid">
                                <div className="input-container full-width">
                                    <label>Nombre de la Empresa</label>
                                    <div className="input-with-icon">
                                        <span className="prefix-icon"><Globe size={18} /></span>
                                        <input 
                                            type="text" 
                                            name="nombre_empresa" 
                                            value={formData.nombre_empresa} 
                                            onChange={handleChange} 
                                            placeholder="Ej. Archi Planner"
                                        />
                                    </div>
                                </div>
                                <div className="input-container">
                                    <label>CEO / Fundador</label>
                                    <div className="input-with-icon">
                                        <span className="prefix-icon"><User size={18} /></span>
                                        <input 
                                            type="text" 
                                            name="ceo" 
                                            value={formData.ceo} 
                                            onChange={handleChange} 
                                            placeholder="Nombre del CEO"
                                        />
                                    </div>
                                </div>
                                <div className="input-container">
                                    <label>Sitio Web</label>
                                    <div className="input-with-icon">
                                        <span className="prefix-icon"><Globe size={18} /></span>
                                        <input 
                                            type="url" 
                                            name="web_url" 
                                            value={formData.web_url} 
                                            onChange={handleChange} 
                                            placeholder="https://tudominio.com"
                                        />
                                    </div>
                                </div>
                                <div className="input-container">
                                    <label>Email de Contacto</label>
                                    <div className="input-with-icon">
                                        <span className="prefix-icon"><Mail size={18} /></span>
                                        <input 
                                            type="email" 
                                            name="email_contacto" 
                                            value={formData.email_contacto} 
                                            onChange={handleChange} 
                                            placeholder="hola@empresa.com"
                                        />
                                    </div>
                                </div>
                                <div className="input-container">
                                    <label>Teléfono</label>
                                    <div className="input-with-icon">
                                        <span className="prefix-icon"><Phone size={18} /></span>
                                        <input 
                                            type="text" 
                                            name="telefono" 
                                            value={formData.telefono} 
                                            onChange={handleChange} 
                                            placeholder="+57 300 000 0000"
                                        />
                                    </div>
                                </div>
                                <div className="input-container full-width">
                                    <label>Ubicación / Ciudad</label>
                                    <div className="input-with-icon">
                                        <span className="prefix-icon"><MapPin size={18} /></span>
                                        <input 
                                            type="text" 
                                            name="city" 
                                            value={formData.city} 
                                            onChange={handleChange} 
                                            placeholder="Ciudad, País"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="form-section" style={{ marginTop: '30px' }}>
                            <h3><Globe size={20} /> Redes Sociales</h3>
                            <div className="form-grid">
                                <div className="input-container">
                                    <label>Instagram URL</label>
                                    <div className="input-with-icon">
                                        <span className="prefix-icon"><Plus size={18} /></span>
                                        <input 
                                            type="url" 
                                            name="ig_url" 
                                            value={formData.ig_url} 
                                            onChange={handleChange} 
                                            placeholder="https://instagram.com/perfil"
                                        />
                                    </div>
                                </div>
                                <div className="input-container">
                                    <label>Facebook URL</label>
                                    <div className="input-with-icon">
                                        <span className="prefix-icon"><Plus size={18} /></span>
                                        <input 
                                            type="url" 
                                            name="fb_url" 
                                            value={formData.fb_url} 
                                            onChange={handleChange} 
                                            placeholder="https://facebook.com/perfil"
                                        />
                                    </div>
                                </div>
                                <div className="input-container">
                                    <label>TikTok URL</label>
                                    <div className="input-with-icon">
                                        <span className="prefix-icon"><Plus size={18} /></span>
                                        <input 
                                            type="url" 
                                            name="tt_url" 
                                            value={formData.tt_url} 
                                            onChange={handleChange} 
                                            placeholder="https://tiktok.com/@perfil"
                                        />
                                    </div>
                                </div>
                                <div className="input-container">
                                    <label>LinkedIn URL</label>
                                    <div className="input-with-icon">
                                        <span className="prefix-icon"><Plus size={18} /></span>
                                        <input 
                                            type="url" 
                                            name="li_url" 
                                            value={formData.li_url} 
                                            onChange={handleChange} 
                                            placeholder="https://linkedin.com/company/perfil"
                                        />
                                    </div>
                                </div>
                                <div className="input-container">
                                    <label>Red-X (Twitter) URL</label>
                                    <div className="input-with-icon">
                                        <span className="prefix-icon"><Plus size={18} /></span>
                                        <input 
                                            type="url" 
                                            name="x_url" 
                                            value={formData.x_url} 
                                            onChange={handleChange} 
                                            placeholder="https://x.com/perfil"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminEmpresa;
