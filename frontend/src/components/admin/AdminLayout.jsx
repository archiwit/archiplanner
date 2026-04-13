import React from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminLayout = () => {
    const { token, loading, user } = useAuth();
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

    // Global Keyboard Shortcuts
    React.useEffect(() => {
        const handleKeys = (e) => {
            if (e.altKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                navigate('/admin/ayuda');
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [navigate]);

    if (loading) return <div className="loading">Cargando administrador...</div>;
    
    // Strict session check to avoid ghost sessions
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            />
            <main className="admin-content" style={{ padding: '0' }}>
                <div className="admin-container" style={{ padding: '12px' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
