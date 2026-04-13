import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import paginasV4Service from '../../services/paginasV4Service';
import DynamicTableManager from '../../components/ui/DynamicTableManager';
import Swal from 'sweetalert2';
import { 
    Plus, Edit3, Copy, Trash2, Eye, FileText, CheckCircle, 
    Clock, Home, Star, Globe, Info, ExternalLink, Search, Palette, EyeOff, Layout, Filter, Settings
} from 'lucide-react';

const AdminPaginasV4 = () => {
    const [paginas, setPaginas] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPaginas();
    }, []);

    const fetchPaginas = async () => {
        setLoading(true);
        try {
            const data = await paginasV4Service.getAll();
            setPaginas(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching paginas:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error de Conexión',
                text: 'No se pudieron cargar las páginas.',
                background: '#121212',
                color: '#fff',
                confirmButtonColor: '#ff8484'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (formData) => {
        setLoading(true);
        try {
            const res = await paginasV4Service.create(formData);
            if (res.success) {
                await fetchPaginas();
                Swal.fire({
                    title: '¡Página Creada!',
                    text: 'Redirigiendo al constructor visual v4...',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#121212',
                    color: '#fff'
                });
                setTimeout(() => navigate(`/admin/builder-v4/${res.id}`), 2000);
            }
            return true;
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || 'Error al crear página', 'error');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (item, formData) => {
        setLoading(true);
        try {
            await paginasV4Service.update(item.id, formData);
            await fetchPaginas();
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Cambios guardados con éxito',
                showConfirmButton: false,
                timer: 3000,
                background: '#121212',
                color: '#fff'
            });
            return true;
        } catch (err) {
            Swal.fire('Error', 'No se pudo actualizar la página', 'error');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleDuplicate = async (id) => {
        const result = await Swal.fire({
            title: '¿Duplicar página?',
            text: "Se creará una copia exacta de este diseño.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ff8484',
            cancelButtonColor: '#333',
            confirmButtonText: 'Sí, duplicar',
            cancelButtonText: 'Cancelar',
            background: '#121212',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await paginasV4Service.duplicate(id);
                fetchPaginas();
                Swal.fire('¡Duplicado!', 'La página se ha duplicado con éxito.', 'success');
            } catch (err) {
                Swal.fire('Error', 'No se pudo duplicar.', 'error');
            }
        }
    };

    const handleDelete = async (row) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Eliminarás permanentemente "${row.nombre}". No podrás deshacer esta acción.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#333',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#121212',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await paginasV4Service.delete(row.id);
                setPaginas(paginas.filter(p => p.id !== row.id));
                Swal.fire('¡Eliminado!', 'Página borrada correctamente.', 'success');
            } catch (err) {
                Swal.fire('Error', 'Error al eliminar.', 'error');
            }
        }
    };

    const handleSetHomepage = async (id) => {
        try {
            await paginasV4Service.setHomepage(id);
            fetchPaginas();
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Página de inicio actualizada',
                showConfirmButton: false,
                timer: 3000,
                background: '#121212',
                color: '#fff'
            });
        } catch (err) {
            Swal.fire('Error', 'No se pudo establecer como inicio.', 'error');
        }
    };

    const columns = [
        {
            key: 'nombre',
            label: 'Página',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="td-icon-box" style={{ marginRight: '12px' }}>
                        <FileText size={16} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{row.nombre}</div>
                        <div style={{ fontSize: '10px', opacity: 0.5 }}>{row.descripcion || 'Sin descripción'}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'slug',
            label: 'URL / Slug',
            render: (row) => <code className="slug-tag-premium">/p/{row.slug}</code>
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (row) => (
                <span className={`tag-v4 ${row.estado || 'borrador'}`}>
                    {row.estado === 'publicado' ? <CheckCircle size={10} style={{ marginRight: '4px' }} /> : <Clock size={10} style={{ marginRight: '4px' }} />}
                    {(row.estado || 'borrador').toUpperCase()}
                </span>
            )
        },
        {
            key: 'is_homepage',
            label: 'Inicio',
            render: (row) => (
                row.is_homepage ? (
                    <span className="home-indicator active" title="Página Principal">
                        <Home size={18} />
                    </span>
                ) : (
                    <button className="btn-icon-minimal" onClick={() => handleSetHomepage(row.id)} title="Marcar como Inicio">
                        <Star size={18} />
                    </button>
                )
            )
        },
        {
            key: 'visibilidad',
            label: 'Visibilidad',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`visibility-dot ${row.is_visible ? 'visible' : 'hidden'}`}></span>
                    <span style={{ fontSize: '10px' }}>{row.is_visible ? 'Pública' : 'Privada'}</span>
                </div>
            )
        }
    ];

    const formFields = [
        // TAB 1: GENERAL
        { name: 'nombre', label: 'Nombre de la Página', type: 'text', required: true, tab: 'general', fullWidth: true },
        { name: 'slug', label: 'URL Amigable (Slug)', type: 'text', required: true, tab: 'general', fullWidth: true },
        { name: 'descripcion', label: 'Descripción Interna', type: 'textarea', tab: 'general', fullWidth: true, rows: 3 },

        // TAB 2: SEO
        { name: 'seo_title', label: 'Meta Título (SEO)', type: 'text', tab: 'seo', fullWidth: true },
        { name: 'seo_description', label: 'Meta Descripción (SEO)', type: 'textarea', tab: 'seo', fullWidth: true, rows: 4 },

        // TAB 3: CONFIGURACIÓN
        { name: 'estado', label: 'Estado de Publicación', type: 'select', tab: 'config', options: [
            { value: 'borrador', label: 'Borrador' },
            { value: 'publicado', label: 'Publicado' }
        ], required: true },
        { name: 'is_visible', label: 'Visibilidad en Menú', type: 'select', tab: 'config', options: [
            { value: 1, label: 'Visible' },
            { value: 0, label: 'Oculta' }
        ], required: true },
        { name: 'is_homepage', label: 'Establecer como Inicio (Home)', type: 'select', tab: 'config', options: [
            { value: 1, label: 'Sí' },
            { value: 0, label: 'No' }
        ], required: true },
    ];

    const formTabs = [
        { id: 'general', label: 'Información General' },
        { id: 'seo', label: 'SEO & Meta Tags' },
        { id: 'config', label: 'Configuración' }
    ];

    const customActions = (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button className="t-action-btn-v4 primary" title="Diseñador Visual V4" onClick={() => navigate(`/admin/builder-v4/${row.id}`)}>
                <Palette size={16} />
            </button>
            <button className="t-action-btn-v4" title="Duplicar Página" onClick={() => handleDuplicate(row.id)}>
                <Copy size={16} />
            </button>
            <button className="t-action-btn-v4" title="Ver en Pantalla Completa" onClick={() => window.open(`/p/${row.slug}`, '_blank')}>
                <ExternalLink size={16} />
            </button>
        </div>
    );

    return (
        <div className="admin-page-container fade-in" style={{ padding: '40px 60px', width: '100%' }}>
            <div style={{ marginBottom: '50px', textAlign: 'left' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3.5rem', marginBottom: '10px', color: '#fff', lineHeight: '1' }}>
                    Gestión de Contenido <span style={{ color: '#ff8484' }}>V4</span>
                </h1>
                <p style={{ color: '#555', fontSize: '1.1rem', letterSpacing: '2px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    Editorial Web Builder & SEO <span style={{ width: '100px', height: '1px', background: 'rgba(255,132,132,0.2)' }}></span>
                </p>
            </div>

            <DynamicTableManager
                title="Páginas ArchiBuilder"
                data={paginas}
                columns={columns.filter(c => !c.hidden)}
                formFields={formFields}
                tabs={formTabs}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
                customActions={customActions}
            />

            <style dangerouslySetInnerHTML={{ __html: `
                .td-icon-box {
                    background: rgba(255, 132, 132, 0.1);
                    color: #ff8484;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                }
                .slug-tag-premium {
                    background: rgba(255,255,255,0.03);
                    padding: 4px 10px;
                    border-radius: 6px;
                    color: #ff8484;
                    font-size: 11px;
                    border: 1px solid rgba(255,132,132,0.1);
                }
                .tag-v4 {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 10px;
                    font-weight: 800;
                }
                .tag-v4.borrador { background: rgba(255, 132, 132, 0.1); color: #ff8484; }
                .tag-v4.publicado { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
                .home-indicator.active { color: #ff8484; filter: drop-shadow(0 0 5px rgba(255,132,132,0.3)); }
                
                .t-action-btn-v4 {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    color: #666;
                    padding: 8px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex; align-items: center; justify-content: center;
                }
                .t-action-btn-v4:hover {
                    background: rgba(255,255,255,0.08);
                    color: #fff;
                    transform: translateY(-2px);
                    border-color: rgba(255,255,255,0.1);
                }
                .t-action-btn-v4.primary {
                    color: #ff8484;
                    background: rgba(255, 132, 132, 0.05);
                    border-color: rgba(255, 132, 132, 0.1);
                }
                .t-action-btn-v4.primary:hover {
                    background: #ff8484;
                    color: #000;
                    box-shadow: 0 5px 15px rgba(255, 132, 132, 0.3);
                }

                .visibility-dot { width: 8px; height: 8px; border-radius: 50%; }
                .visibility-dot.visible { background: #22c55e; box-shadow: 0 0 10px rgba(34, 197, 94, 0.5); }
                .visibility-dot.hidden { background: #444; }
            `}} />
        </div>
    );
};

export default AdminPaginasV4;
