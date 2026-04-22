import React from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import Sidebar from './Sidebar';
import PremiumLoader from '../common/PremiumLoader';
import pushService from '../../services/pushService';
import { Menu } from 'lucide-react';

const AdminLayout = () => {
    const { token, loading, user } = useAuth();
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(window.innerWidth < 768);

    // Register Service Worker and Subscribe for Push Notifications
    React.useEffect(() => {
        const setupNotifications = async () => {
            if (user && user.id) {
                // Register Service Worker
                if ('serviceWorker' in navigator) {
                    try {
                        await navigator.serviceWorker.register('/service-worker.js');
                        console.log('Service Worker registered successfully');
                        
                        // Attempt to subscribe
                        await pushService.subscribeUser(user.id);
                    } catch (err) {
                        console.error('Service Worker registration failed:', err);
                    }
                }
            }
        };

        setupNotifications();
    }, [user]);

    // Global Keyboard Shortcuts & Events
    React.useEffect(() => {
        const handleKeys = (e) => {
            if (e.altKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                navigate('/admin/ayuda');
            }
        };

        const handleToggleSidebar = () => {
            setIsSidebarCollapsed(prev => !prev);
        };

        window.addEventListener('keydown', handleKeys);
        window.addEventListener('toggle-admin-sidebar', handleToggleSidebar);

        return () => {
            window.removeEventListener('keydown', handleKeys);
            window.removeEventListener('toggle-admin-sidebar', handleToggleSidebar);
        };
    }, [navigate]);

    const isMobile = window.innerWidth < 768;

    const { loading: brandingLoading } = useBranding();
    if (loading || brandingLoading) return <PremiumLoader />;
    
    // Strict session check to avoid ghost sessions
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Minimalist Floating Menu Trigger (v4.5) */}
            {isMobile && (
                <button 
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="admin-mobile-menu-trigger"
                >
                    <Menu size={22} />
                </button>
            )}

            <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            />
            <main className="admin-content" style={{ padding: '0', flex: 1 }}>
                <div className="admin-container" style={{ padding: '16px' }}>
                    <Outlet />
                </div>
            </main>

            <style>{`
                @media (max-width: 768px) {
                    .admin-layout {
                        padding-top: 0px !important;
                    }
                    
                    .admin-content {
                        margin-left: 0 !important;
                        width: 100% !important;
                    }

                    /* Ensure sidebar behaves as overlay when expanded on mobile */
                    .admin-layout:not(.sidebar-collapsed) .admin-sidebar {
                        transform: translateX(0);
                        z-index: 2000;
                        width: 280px !important;
                        box-shadow: 0 0 50px rgba(0,0,0,0.8);
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
