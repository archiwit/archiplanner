import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, Clock, DollarSign, UserPlus, X, Check, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import alertasService from '../../services/alertasService';
import './NotificationBell.css';

const NotificationBell = () => {
    const auth = useAuth() || {};
    const user = auth.user;
    const [unreadCount, setUnreadCount] = useState(0);
    const [alerts, setAlerts] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const fetchAlerts = async () => {
        if (!user || !alertasService) return;
        try {
            const userId = user.cli_id || user.id;
            const userRol = user.rol;
            if (!userId) return;

            const data = await alertasService.getAll(userId, userRol);
            setAlerts(data || []);
            const count = await alertasService.getUnreadCount(userId, userRol);
            setUnreadCount(count || 0);
        } catch (err) {
            console.warn('[NotificationBell] Service busy or unavailable:', err.message);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAlerts();
            const interval = setInterval(fetchAlerts, 30000); 
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await alertasService.markAsRead(id);
            fetchAlerts();
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await alertasService.markAllAsRead();
            fetchAlerts();
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const getIcon = (tipo) => {
        switch (tipo) {
            case 'nuevo_cliente': return <UserPlus size={16} className="icon-blue" />;
            case 'pago_vencido': return <DollarSign size={16} className="icon-red" />;
            case 'recordatorio': return <Clock size={16} className="icon-yellow" />;
            case 'evento_proximo': return <Bell size={16} className="icon-purple" />;
            case 'arriendo': return <Truck size={16} className="icon-pink" style={{ color: '#B76E79' }} />;
            default: return <Bell size={16} />;
        }
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button 
                className={`bell-button ${unreadCount > 0 ? 'has-unread' : ''}`} 
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <Bell size={20} />
                {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
            </button>

            {showDropdown && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h3>Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button className="mark-all-btn" onClick={markAllAsRead}>Limpiar todo</button>
                        )}
                    </div>
                    <div className="alerts-list">
                        {alerts.length === 0 ? (
                            <div className="empty-alerts">No hay notificaciones</div>
                        ) : (
                            alerts.map(alert => (
                                <div key={alert.id} className={`alert-item ${alert.leida ? 'read' : 'unread'}`}>
                                    <div className="alert-icon">
                                        {getIcon(alert.tipo)}
                                    </div>
                                    <div className="alert-content">
                                        <div className="alert-title">{alert.titulo}</div>
                                        <div className="alert-msg">{alert.mensaje}</div>
                                        <div className="alert-time">{new Date(alert.fecha_creacion).toLocaleString()}</div>
                                    </div>
                                    {!alert.leida && (
                                        <button className="mark-btn" title="Marcar como leída" onClick={(e) => markAsRead(alert.id, e)}>
                                            <Check size={14} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
