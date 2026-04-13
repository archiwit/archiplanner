import React, { useState, useEffect } from 'react';
import { 
    Save, 
    RefreshCw, 
    Layout, 
    Smartphone, 
    Mail, 
    ArrowRight,
    Sparkles,
    Globe,
    AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { API_BASE_URL } from '../../config';
import { AdminInput, AdminTextarea } from '../../components/ui/AdminFormFields';

const AdminPaginas = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchContent(activeTab);
    }, [activeTab]);

    const fetchContent = async (page) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/web-content/${page}`);
            const data = await res.json();
            
            // Normalizar datos (evitar el bug de description vs descripcion)
            const normalized = { ...data };
            if (data.hero_description && !data.hero_descripcion) {
                normalized.hero_descripcion = data.hero_description;
            }
            
            setContent(normalized);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching web content:', err);
            setLoading(false);
        }
    };

    const handleInputChange = (key, value) => {
        setContent({ ...content, [key]: value });
    };

    const handleSave = async () => {
        setSaving(true);
        const contentsArray = Object.keys(content).map(key => {
            const [seccion, ...claveParts] = key.split('_');
            const clave = claveParts.join('_');
            return { seccion, clave, valor: content[key] };
        });

        try {
            const res = await fetch(`${API_BASE_URL}/web-content`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pagina: activeTab, contents: contentsArray })
            });

            if (res.ok) {
                // Notificación visual en lugar de alert
                const notify = document.createElement('div');
                notify.className = 'admin-toast success';
                notify.innerText = '✨ Contenido actualizado con éxito';
                document.body.appendChild(notify);
                setTimeout(() => notify.remove(), 3000);
            }
        } catch (err) {
            console.error('Error saving web content:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-container">
            <header className="admin-header-premium">
                <div className="header-info">
                    <h1>Gestión de Contenido Web</h1>
                    <p style={{ color: 'var(--color-text-dim)', marginTop: '8px' }}>
                        Edita los textos principales de las páginas Home y Contacto.
                    </p>
                </div>
                <Button onClick={handleSave} className="btn-primary" disabled={saving || loading}>
                    {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} 
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </header>

            <div className="admin-tabs-premium">
                <button 
                    className={activeTab === 'home' ? 'active' : ''} 
                    onClick={() => setActiveTab('home')}
                >
                    <Layout size={18} /> Home
                </button>
                <button 
                    className={activeTab === 'contacto' ? 'active' : ''} 
                    onClick={() => setActiveTab('contacto')}
                >
                    <Mail size={18} /> Contacto
                </button>
            </div>

            <div className="tab-content-premium">
                {/* Advanced Editor Shortcut */}
                <div className="admin-info-card" style={{ marginBottom: '30px', borderLeft: '4px solid var(--color-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Sparkles className="text-primary" size={24} />
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0 }}>¿Buscas editar imágenes o secciones?</h4>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.7 }}>
                                Para gestionar Call To Actions (CTAs), el orden de la página o cargar nuevas fotos, utiliza el Editor Avanzado.
                            </p>
                        </div>
                        <Link to="/admin/config-web" className="btn-table-edit" style={{ width: 'auto', padding: '0 15px', borderRadius: '8px', fontSize: '12px', gap: '8px' }}>
                            Ir al Editor <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="admin-empty-state">
                        <RefreshCw className="animate-spin" size={48} opacity={0.2} />
                        <h3>Cargando textos...</h3>
                    </div>
                ) : (
                    <div className="admin-grid-premium">
                        {activeTab === 'home' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                <section className="admin-card-premium">
                                    <header className="section-header-compact">
                                        <h3>Sección Hero (Principal)</h3>
                                        <Globe size={16} opacity={0.5} />
                                    </header>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <AdminInput 
                                            label="Título Hero (Editorial)"
                                            name="hero_titulo"
                                            value={content['hero_titulo']}
                                            onChange={(e) => handleInputChange('hero_titulo', e.target.value)}
                                            placeholder="Usa <br /> para saltos de línea"
                                        />
                                        <AdminTextarea 
                                            label="Descripción Hero"
                                            name="hero_descripcion"
                                            rows="4"
                                            value={content['hero_descripcion']}
                                            onChange={(e) => handleInputChange('hero_descripcion', e.target.value)}
                                        />
                                    </div>
                                </section>

                                <section className="admin-card-premium">
                                    <header className="section-header-compact">
                                        <h3>Sección Método (PULSE)</h3>
                                        <AlertCircle size={16} opacity={0.5} />
                                    </header>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <AdminInput 
                                            label="Tag Superior (Ej: El Método ArchiPlanner)"
                                            name="metodo_tag"
                                            value={content['metodo_tag']}
                                            onChange={(e) => handleInputChange('metodo_tag', e.target.value)}
                                        />
                                        <AdminInput 
                                            label="Título de la Sección"
                                            name="metodo_titulo"
                                            value={content['metodo_titulo']}
                                            onChange={(e) => handleInputChange('metodo_titulo', e.target.value)}
                                        />
                                        <AdminInput 
                                            label="Frase de Cierre (Footer Transición)"
                                            name="footer_cierre"
                                            value={content['footer_cierre']}
                                            onChange={(e) => handleInputChange('footer_cierre', e.target.value)}
                                        />
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'contacto' && (
                            <section className="admin-card-premium" style={{ maxWidth: '800px' }}>
                                <header className="section-header-compact">
                                    <h3>Cabecera de Contacto</h3>
                                    <Mail size={16} opacity={0.5} />
                                </header>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <AdminInput 
                                        label="Título Principal"
                                        name="info_titulo"
                                        value={content['info_titulo']}
                                        onChange={(e) => handleInputChange('info_titulo', e.target.value)}
                                    />
                                    <AdminTextarea 
                                        label="Descripción / Introducción"
                                        name="info_descripcion"
                                        rows="5"
                                        value={content['info_descripcion']}
                                        onChange={(e) => handleInputChange('info_descripcion', e.target.value)}
                                    />
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPaginas;
