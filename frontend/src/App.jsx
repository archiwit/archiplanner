import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BrandingProvider } from './context/BrandingContext';

// Layouts (Static)
// Layouts (Lazy)
const MainLayout = React.lazy(() => import('./components/layout/MainLayout'));
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));

import ScrollToTop from './components/common/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Fallback Loader for Suspense
const SuspenseLoader = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0c0c0d' }}>
        <div style={{ color: '#fff', fontSize: '14px', letterSpacing: '4px', textTransform: 'uppercase', animation: 'pulse 1.5s infinite' }}>
            Cargando...
        </div>
        <style>{`@keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }`}</style>
    </div>
);

// Public Pages (Lazy)
const Home = React.lazy(() => import('./pages/Home'));
const Gallery = React.lazy(() => import('./pages/Gallery'));
const Login = React.lazy(() => import('./pages/Login'));
const EventDetail = React.lazy(() => import('./pages/EventDetail'));
const PublicPageViewV4 = React.lazy(() => import('./pages/PublicPageViewV4'));
const SatisfactionSurvey = React.lazy(() => import('./pages/SatisfactionSurvey'));

// Admin Pages (Lazy)
const AdminEmpresa = React.lazy(() => import('./pages/admin/AdminEmpresa'));
const AdminInventario = React.lazy(() => import('./pages/admin/AdminInventario'));
const AdminEmpresasTable = React.lazy(() => import('./pages/admin/AdminEmpresasTable'));
const AdminUsuariosTable = React.lazy(() => import('./pages/admin/AdminUsuariosTable'));
const AdminClientesTable = React.lazy(() => import('./pages/admin/AdminClientesTable'));
const AdminProveedoresTable = React.lazy(() => import('./pages/admin/AdminProveedoresTable'));
const AdminPerfil = React.lazy(() => import('./pages/admin/AdminPerfil'));
const AdminCotizaciones = React.lazy(() => import('./pages/admin/AdminCotizaciones'));
const AdminCotizacionForm = React.lazy(() => import('./pages/admin/AdminCotizacionForm'));
const AdminPlantillas = React.lazy(() => import('./pages/admin/AdminPlantillas'));
const QuotationView = React.lazy(() => import('./pages/admin/QuotationView'));
const AdminContrato = React.lazy(() => import('./pages/admin/AdminContrato'));
const AdminAyuda = React.lazy(() => import('./pages/admin/AdminAyuda'));
const AdminTestimonios = React.lazy(() => import('./pages/admin/AdminTestimonios'));
const AdminPaginas = React.lazy(() => import('./pages/admin/AdminPaginas'));
const AdminServiciosWeb = React.lazy(() => import('./pages/admin/AdminServiciosWeb'));
const AdminCmsWeb = React.lazy(() => import('./pages/admin/AdminCmsWeb'));
const AdminGallery = React.lazy(() => import('./pages/admin/AdminGallery'));
const AdminPaginasV4 = React.lazy(() => import('./pages/admin/AdminPaginasV4'));
const VisualBuilderV4 = React.lazy(() => import('./pages/admin/VisualBuilderV4'));
const AdminNavigation = React.lazy(() => import('./pages/admin/AdminNavigation'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCalendar = React.lazy(() => import('./pages/admin/AdminCalendar'));
const AdminEventPlanner = React.lazy(() => import('./pages/admin/AdminEventPlanner'));
const AdminArriendos = React.lazy(() => import('./pages/admin/AdminArriendos'));
const AdminGastosEmpresa = React.lazy(() => import('./pages/admin/AdminGastosEmpresa'));

// Client Pages (Lazy)
const ClientDashboard = React.lazy(() => import('./pages/client/ClientDashboard'));

function App() {
    console.log('App.jsx: Renderizando componente raíz...');
    
    // Remover el preloader en cuanto React esté listo, sin esperar otras descargas
    React.useEffect(() => {
        if (window.hideArchiLoader) {
            window.hideArchiLoader();
        }
    }, []);
    
    // Roles permitidos para administración general (Eventos, Usuarios, Configuración)
    const STAFF = ['admin', 'coordinador', 'asesor'];
    // Roles permitidos para arriendos
    const RENTAL_ROLES = [...STAFF, 'asesor_arriendos'];

    return (
        <ErrorBoundary>
            <BrandingProvider>
                <AuthProvider>
                    <ScrollToTop />
                    <Suspense fallback={<SuspenseLoader />}>
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
                            
                            {/* Standalone Print View */}
                            <Route path="/print-quotation/:id" element={<QuotationView isPrintView={true} />} />

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


                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </Suspense>
                </AuthProvider>
            </BrandingProvider>
        </ErrorBoundary>
    );
}

export default App;
