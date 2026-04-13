import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    FileText, 
    Package, 
    Settings, 
    Bell, 
    LogOut,
    Truck,
    UserCog,
    HelpCircle,
    History,
    Menu,
    ChevronLeft,
    Globe,
    MessageSquare,
    Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UPLOADS_URL } from '../../config';

const Sidebar = ({ isCollapsed, onToggle }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const categories = [
        {
            title: 'Operaciones',
            items: [
                { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
                { path: '/admin/clientes', icon: <Users size={20} />, label: 'Clientes' },
                { path: '/admin/cotizaciones', icon: <FileText size={20} />, label: 'Cotizaciones' },
                { path: '/admin/plantillas', icon: <FileText size={20} />, label: 'Plantillas' },
            ]
        },
        {
            title: 'Logística',
            items: [
                { path: '/admin/servicios', icon: <Package size={20} />, label: 'Inventario' },
                { path: '/admin/proveedores', icon: <Truck size={20} />, label: 'Proveedores' },
            ]
        },
        {
            title: 'Configuración',
            items: [
                { path: '/admin/alertas', icon: <Bell size={20} />, label: 'Alertas' },
                { path: '/admin/empresa', icon: <Settings size={20} />, label: 'Empresas / Marcas' },
                ...(user?.rol === 'admin' ? [{ path: '/admin/usuarios', icon: <UserCog size={20} />, label: 'Equipo y Accesos' }] : []),
            ]
        },
        {
            title: 'Gestión Web',
            items: [
                { path: '/admin/paginas-v4', icon: <Globe size={20} />, label: 'Páginas del Sitio' },
                { path: '/admin/galeria', icon: <LayoutDashboard size={20} />, label: 'Galería / Proyectos' },
                { path: '/admin/servicios-web', icon: <Briefcase size={20} />, label: 'Servicios de Marca' },
                { path: '/admin/testimonios', icon: <MessageSquare size={20} />, label: 'Testimonios' },
            ]
        }
    ];

    return (
        <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-brand">
                <div className="logo">
                    {isCollapsed ? <span>A</span> : <>Archi<span>Admin</span></>}
                </div>
                <button 
                    className="sidebar-toggle-mini" 
                    onClick={onToggle}
                    title={isCollapsed ? "Expandir" : "Contraer"}
                >
                    {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <div className="sidebar-user-profile" onClick={() => navigate('/admin/perfil')}>
                <div className="sidebar-user-avatar">
                    {user?.foto ? (
                        <img src={`${UPLOADS_URL}${user.foto}`} alt="Avatar" />
                    ) : (
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{user?.nombre?.[0] || 'A'}</span>
                    )}
                </div>
                {!isCollapsed && (
                    <div className="sidebar-user-info">
                        <span className="sidebar-user-name">{user?.nombre || 'Admin'}</span>
                        <span className="sidebar-user-role">{user?.rol || 'Administrador'}</span>
                    </div>
                )}
            </div>

            <nav className="sidebar-nav">
                {categories.map((cat, idx) => (
                    <div key={idx} className="sidebar-category-group">
                        <div className="sidebar-category-header">{cat.title}</div>
                        <ul>
                            {cat.items.map((item) => (
                                <li key={item.path}>
                                    <NavLink 
                                        to={item.path} 
                                        end={item.path === '/admin'}
                                        className={({ isActive }) => isActive ? 'active' : ''}
                                        title={isCollapsed ? item.label : ''}
                                    >
                                        {item.icon}
                                        {!isCollapsed && <span>{item.label}</span>}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer-actions">
                <button 
                    className="action-btn" 
                    onClick={() => navigate('/admin/ayuda')} 
                    title="Ayuda y Atajos"
                    style={{ background: 'rgba(255,132,132,0.1)', color: 'var(--color-primary)' }}
                >
                    <HelpCircle size={20} />
                </button>
                <button className="action-btn" onClick={handleLogout} title="Cerrar Sesión">
                    <LogOut size={20} />
                    {!isCollapsed && <span style={{ marginLeft: '8px', fontSize: '12px' }}>Salir</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
