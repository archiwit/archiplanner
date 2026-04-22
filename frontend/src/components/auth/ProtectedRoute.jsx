import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import AccessDenied from './AccessDenied';

/**
 * Filtra el acceso a rutas basado en el rol del usuario logueado.
 * @param {Array} allowedRoles - Roles permitidos para esta ruta
 * @param {React.ReactNode} children - Componente a renderizar si se permite el acceso
 */
const ProtectedRoute = ({ children, allowedRoles = [], permission = null }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Mientras carga la sesión, podemos mostrar un spinner o nada
    if (loading) return null;

    if (!user) {
        // Redirigir al login si no hay sesión
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // El administrador (Super Usuario) siempre tiene acceso total
    const isAdmin = user.rol === 'admin';

    // Si hay roles definidos y el rol del usuario no está en la lista (y no es admin)
    if (!isAdmin && allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
        console.warn(`[RBAC] Acceso denegado a ${location.pathname} para el rol: ${user.rol}`);
        return <AccessDenied />;
    }

    // Si hay una restricción de permiso específico (y no es admin)
    if (!isAdmin && permission) {
        const userPerms = Array.isArray(user?.permisos) 
            ? user.permisos 
            : (user?.permisos ? JSON.parse(user.permisos) : []);
        
        if (!userPerms.includes(permission)) {
            console.warn(`[Permisos] Acceso denegado a ${location.pathname}. Falta permiso: ${permission}`);
            return <AccessDenied />;
        }
    }

    return children;
};


export default ProtectedRoute;
