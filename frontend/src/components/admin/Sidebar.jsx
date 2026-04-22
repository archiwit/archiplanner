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
    Calendar,
    History,
    Menu,
    ChevronLeft,
    Globe,
    MessageSquare,
    Briefcase,
    Clock,
    User,
    DollarSign,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUploadUrl } from '../../config';
import NotificationBell from '../layout/NotificationBell';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
    const { user, logout, companyConfig } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleMobileItemClick = () => {
        if (window.innerWidth < 768) {
            onToggle();
        }
    };

    const userRol = user?.rol?.toLowerCase() || '';
    
    // Mapeo de roles para consistencia y visualización
    const roleMapping = {
        'admin': 'Administrador',
        'administrador': 'Administrador',
        'asesor': 'Asesor Comercial',
        'asesor_arriendos': 'Asesor de Arriendos',
        'coordinador': 'Coordinador',
        'cliente': 'Cliente'
    };

    const displayRole = roleMapping[userRol] || (user?.rol ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1) : 'Personal Autorizado');
    
    const isAsesorArriendos = userRol === 'asesor_arriendos';
    const isStaff = ['admin', 'administrador', 'superadmin', 'coordinador', 'asesor', 'asesor_arriendos'].includes(userRol);
    const isClient = userRol === 'cliente';


    const hasPerm = (permKey) => {
        if (userRol === 'admin') return true;
        const userPerms = Array.isArray(user?.permisos) 
            ? user.permisos 
            : (user?.permisos ? JSON.parse(user.permisos) : []);
        return userPerms.includes(permKey);
    };

    let categories = [];

    if (isClient) {
        categories = [
            {
                title: 'Mi Cuenta',
                items: [
                    { path: '/client/mis-eventos', icon: <LayoutDashboard size={20} />, label: 'Mi Evento' },
                ]
            }
        ];
    } else if (isStaff) {
        const operationsItems = [
            { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
            hasPerm('clientes') && { path: '/admin/clientes', icon: <Users size={20} />, label: 'Clientes' },
            hasPerm('cotizaciones') && { path: '/admin/cotizaciones', icon: <FileText size={20} />, label: 'Cotizaciones' },
            hasPerm('arriendos') && { path: '/admin/arriendos', icon: <Truck size={20} />, label: 'Arriendos' },
            hasPerm('planeador') && { path: '/admin/planeador', icon: <Clock size={20} />, label: 'Planeador 360°' },
            hasPerm('calendario') && { path: '/admin/calendario', icon: <Calendar size={20} />, label: 'Calendario' },
            hasPerm('plantillas') && { path: '/admin/plantillas', icon: <FileText size={20} />, label: 'Plantillas' },
        ].filter(Boolean);

        const logisticsItems = [
            hasPerm('inventario') && { path: '/admin/servicios', icon: <Package size={20} />, label: 'Inventario' },
            hasPerm('proveedores') && { path: '/admin/proveedores', icon: <Truck size={20} />, label: 'Proveedores' },
        ].filter(Boolean);

        const financeItems = [
            hasPerm('gastos_empresa') && { path: '/admin/gastos-empresa', icon: <DollarSign size={20} />, label: 'Pagos y Gastos' },
        ].filter(Boolean);

        const configItems = [
            hasPerm('empresa') && { path: '/admin/empresa', icon: <Settings size={20} />, label: 'Empresas / Marcas' },
            hasPerm('usuarios') && { path: '/admin/usuarios', icon: <UserCog size={20} />, label: 'Equipo y Accesos' },
        ].filter(Boolean);

        const webItems = [
            hasPerm('web_editor') && { path: '/admin/paginas-v4', icon: <Globe size={20} />, label: 'Páginas del Sitio' },
            hasPerm('web_editor') && { path: '/admin/navegacion', icon: <Menu size={20} />, label: 'Menú y Navegación' },
            hasPerm('web_editor') && { path: '/admin/galeria', icon: <LayoutDashboard size={20} />, label: 'Galería / Proyectos' },
            hasPerm('web_editor') && { path: '/admin/servicios-web', icon: <Briefcase size={20} />, label: 'Servicios de Marca' },
            hasPerm('web_editor') && { path: '/admin/testimonios', icon: <MessageSquare size={20} />, label: 'Testimonios' },
        ].filter(Boolean);

        categories = [
            { title: 'Operaciones', items: operationsItems },
            { title: 'Logística', items: logisticsItems },
            financeItems.length > 0 && { title: 'Administración', items: financeItems },
            { title: 'Configuración', items: configItems },
            webItems.length > 0 && { title: 'Gestión Web', items: webItems },
        ].filter(Boolean);
    } else {
        categories = [
            {
                title: 'Acceso Restringido',
                items: [
                    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard (Limitado)' },
                ]
            }
        ];
    }



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
                    {isCollapsed ? <Menu size={18} /> : (window.innerWidth < 768 ? <X size={18} /> : <ChevronLeft size={18} />)}
                </button>
            </div>

            <div className="sidebar-user-profile">
                <div className="sidebar-user-avatar" onClick={() => navigate('/admin/perfil')}>
                    {user?.foto ? (
                        <img src={getUploadUrl(user.foto)} alt="Avatar" />
                    ) : companyConfig?.logo_cuadrado_path ? (
                        <img src={getUploadUrl(companyConfig.logo_cuadrado_path)} alt="Empresa" />
                    ) : (
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{user?.nombre?.[0] || 'A'}</span>
                    )}
                </div>
                {!isCollapsed && (
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-text-container">
                            <div className="sidebar-user-text" onClick={() => navigate('/admin/perfil')}>
                                <span className="sidebar-user-name">{user?.nombre || 'Admin'}</span>
                                <span className="sidebar-user-role">{displayRole}</span>
                            </div>
                            <NotificationBell />

                        </div>
                    </div>
                )}
            </div>

            <nav className="sidebar-nav">
                {categories
                    .filter(cat => cat.items && cat.items.length > 0)
                    .map((cat, idx) => (
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
                                        onClick={handleMobileItemClick}
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

            <div className="sidebar-footer-row">
                <button 
                    className="action-btn-mini" 
                    onClick={() => navigate('/admin/ayuda')} 
                    title="Ayuda y Atajos"
                >
                    <HelpCircle size={18} />
                </button>
                
                <button 
                    className="action-btn-mini" 
                    onClick={() => window.open('/', '_blank')} 
                    title="Ver Sitio Web"
                >
                    <Globe size={18} />
                </button>

                <button 
                    className="action-btn-mini logout" 
                    onClick={handleLogout} 
                    title="Cerrar Sesión"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
