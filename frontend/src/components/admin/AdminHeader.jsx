import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, LogOut, ChevronRight, LayoutDashboard, Calendar, FileText } from 'lucide-react';
import NotificationBell from '../layout/NotificationBell';
import './AdminHeader.css';

const AdminHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Breadcrumb logic
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('calendar')) return 'Calendario Administrativo';
        if (path.includes('cotizaciones')) return 'Gestión de Cotizaciones';
        if (path.includes('clientes')) return 'Cartera de Clientes';
        if (path.includes('pagos')) return 'Control de Pagos';
        if (path.includes('gastos')) return 'Control de Gastos';
        if (path.includes('configuracion')) return 'Configuración de Sistema';
        return 'Panel de Control';
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header className="admin-header">
            <div className="header-left">
                <div className="breadcrumb">
                    <LayoutDashboard size={14} className="text-muted" />
                    <ChevronRight size={14} className="separator" />
                    <span className="current-page">{getPageTitle()}</span>
                </div>
            </div>

            <div className="header-right">
                <button 
                    className="header-action-btn" 
                    onClick={() => window.open('/', '_blank')}
                    title="Ver Sitio Web"
                >
                    <Globe size={18} />
                </button>
                
                <div className="vertical-divider"></div>
                
                <NotificationBell />
                
                <div className="vertical-divider"></div>

                <div className="user-profile-brief">
                    <div className="user-info">
                        <span className="user-name">{user.nombre || 'Administrador'}</span>
                        <span className="user-role">{user.rol || 'Admin'}</span>
                    </div>
                </div>

                <button 
                    className="logout-header-btn" 
                    onClick={handleLogout}
                    title="Cerrar Sesión"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
};

export default AdminHeader;
