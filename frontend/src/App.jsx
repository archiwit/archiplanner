import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BrandingProvider } from './context/BrandingContext';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/admin/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Gallery from './pages/Gallery';
// import Contact from './pages/Contact';
import Login from './pages/Login';
import EventDetail from './pages/EventDetail';
import PublicPageViewV4 from './pages/PublicPageViewV4';
import SatisfactionSurvey from './pages/SatisfactionSurvey';

// Admin Pages
import AdminEmpresa from './pages/admin/AdminEmpresa';
import AdminInventario from './pages/admin/AdminInventario';
import AdminEmpresasTable from './pages/admin/AdminEmpresasTable';
import AdminUsuariosTable from './pages/admin/AdminUsuariosTable';
import AdminClientesTable from './pages/admin/AdminClientesTable';
import AdminProveedoresTable from './pages/admin/AdminProveedoresTable';
import AdminPerfil from './pages/admin/AdminPerfil';
import AdminCotizaciones from './pages/admin/AdminCotizaciones';
import AdminCotizacionForm from './pages/admin/AdminCotizacionForm';
import AdminPlantillas from './pages/admin/AdminPlantillas';
import QuotationView from './pages/admin/QuotationView';
import AdminContrato from './pages/admin/AdminContrato';
import AdminAyuda from './pages/admin/AdminAyuda';
import AdminTestimonios from './pages/admin/AdminTestimonios';
import AdminPaginas from './pages/admin/AdminPaginas';
import AdminServiciosWeb from './pages/admin/AdminServiciosWeb';
import AdminCmsWeb from './pages/admin/AdminCmsWeb';
import AdminGallery from './pages/admin/AdminGallery';
import AdminPaginasV4 from './pages/admin/AdminPaginasV4';
import VisualBuilderV4 from './pages/admin/VisualBuilderV4';
import AdminNavigation from './pages/admin/AdminNavigation';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminEventPlanner from './pages/admin/AdminEventPlanner';
import AdminArriendos from './pages/admin/AdminArriendos';
import AdminGastosEmpresa from './pages/admin/AdminGastosEmpresa';
import ClientDashboard from './pages/client/ClientDashboard';
import ErrorBoundary from './components/common/ErrorBoundary';


import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
    console.log('App.jsx: Renderizando componente raíz...');
    
    // Roles permitidos para administración general (Eventos, Usuarios, Configuración)
    const STAFF = ['admin', 'coordinador', 'asesor'];
    // Roles permitidos para arriendos
    const RENTAL_ROLES = [...STAFF, 'asesor_arriendos'];

    return (
        <ErrorBoundary>
            <BrandingProvider>
                <AuthProvider>
                    <Routes>
                        {/* Public Website */}
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<PublicPageViewV4 />} />
                            <Route path="/servicios" element={<PublicPageViewV4 slugOverride="servicios" />} />
                            <Route path="/nosotros" element={<PublicPageViewV4 slugOverride="nosotros" />} />
                            <Route path="/galeria" element={<Gallery />} />
                            <Route path="/galeria/:id" element={<EventDetail />} />
                            <Route path="/contacto" element={<PublicPageViewV4 slugOverride="contacto" />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/p/:slug" element={<PublicPageViewV4 />} />
                            <Route path="/privacidad" element={<PublicPageViewV4 slugOverride="privacidad" />} />
                            <Route path="/proteccion" element={<PublicPageViewV4 slugOverride="proteccion" />} />
                            <Route path="/evaluacion/:id" element={<SatisfactionSurvey />} />
                        </Route>

                        {/* Administration Area */}
                        <Route 
                            path="/admin" 
                            element={
                                <ErrorBoundary>
                                    <AdminLayout />
                                </ErrorBoundary>
                            }
                        >
                            <Route index element={<AdminDashboard />} />
                            <Route path="clientes" element={<ProtectedRoute permission="clientes"><AdminClientesTable /></ProtectedRoute>} />
                            <Route path="cotizaciones" element={<ProtectedRoute permission="cotizaciones"><AdminCotizaciones /></ProtectedRoute>} />
                            <Route path="cotizaciones/nueva" element={<ProtectedRoute permission="cotizaciones"><AdminCotizacionForm /></ProtectedRoute>} />
                            <Route path="cotizaciones/editar/:id" element={<ProtectedRoute permission="cotizaciones"><AdminCotizacionForm /></ProtectedRoute>} />
                            
                            <Route path="arriendos" element={<ProtectedRoute permission="arriendos"><AdminArriendos /></ProtectedRoute>} />
                            <Route path="arriendos/nuevo" element={<ProtectedRoute permission="arriendos"><AdminCotizacionForm claseOverride="arriendo" /></ProtectedRoute>} />
                            <Route path="arriendos/editar/:id" element={<ProtectedRoute permission="arriendos"><AdminCotizacionForm claseOverride="arriendo" /></ProtectedRoute>} />

                            <Route path="cotizaciones/:id/view" element={<QuotationView />} />
                            <Route path="cotizaciones/:id/contrato" element={<AdminContrato />} />
                            <Route path="plantillas" element={<ProtectedRoute permission="plantillas"><AdminPlantillas /></ProtectedRoute>} />
                            <Route path="servicios" element={<ProtectedRoute permission="inventario"><AdminInventario /></ProtectedRoute>} />
                            <Route path="proveedores" element={<ProtectedRoute permission="proveedores"><AdminProveedoresTable /></ProtectedRoute>} />
                            <Route path="gastos-empresa" element={<ProtectedRoute permission="gastos_empresa"><AdminGastosEmpresa /></ProtectedRoute>} />

                            <Route path="empresa" element={<ProtectedRoute permission="empresa"><AdminEmpresasTable /></ProtectedRoute>} />
                            <Route path="empresa/editar/:id" element={<ProtectedRoute permission="empresa"><AdminEmpresa /></ProtectedRoute>} />
                            <Route path="usuarios" element={<ProtectedRoute permission="usuarios"><AdminUsuariosTable /></ProtectedRoute>} />
                            <Route path="perfil" element={<AdminPerfil />} />
                            <Route path="ayuda" element={<AdminAyuda />} />
                            <Route path="testimonios" element={<AdminTestimonios />} />
                            <Route path="paginas" element={<ProtectedRoute permission="web_editor"><AdminPaginas /></ProtectedRoute>} />
                            <Route path="servicios-web" element={<ProtectedRoute permission="web_editor"><AdminServiciosWeb /></ProtectedRoute>} />
                            <Route path="config-web" element={<ProtectedRoute permission="web_editor"><AdminCmsWeb /></ProtectedRoute>} />
                            <Route path="galeria" element={<AdminGallery />} />
                            <Route path="paginas-v4" element={<ProtectedRoute permission="web_editor"><AdminPaginasV4 /></ProtectedRoute>} />
                            <Route path="navegacion" element={<ProtectedRoute permission="web_editor"><AdminNavigation /></ProtectedRoute>} />
                            <Route path="calendario" element={<ProtectedRoute permission="calendario"><AdminCalendar /></ProtectedRoute>} />
                            <Route path="planeador" element={<ProtectedRoute permission="planeador"><AdminEventPlanner /></ProtectedRoute>} />
                            <Route path="builder-v4/:id" element={<ProtectedRoute allowedRoles={['admin']}><VisualBuilderV4 /></ProtectedRoute>} />
                        </Route>


                        {/* Client Portal V4 */}
                        <Route 
                            path="/client" 
                            element={
                                <ErrorBoundary>
                                    <AdminLayout />
                                </ErrorBoundary>
                            }
                        >
                            <Route index element={<ClientDashboard />} />
                            <Route path="mis-eventos" element={<ClientDashboard isListView={true} />} />
                            <Route path="evento/:id" element={<ClientDashboard />} />
                            <Route path="perfil" element={<AdminPerfil />} />
                        </Route>

                        {/* Isolated Print Route (No Layouts) */}
                        <Route path="/print-quotation/:id" element={<QuotationView isPrintView={true} />} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </AuthProvider>
            </BrandingProvider>
        </ErrorBoundary>
    );
}

export default App;
