import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BrandingProvider } from './context/BrandingContext';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/admin/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import EventDetail from './pages/EventDetail';
import PublicPageViewV4 from './pages/PublicPageViewV4';





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
import ErrorBoundary from './components/common/ErrorBoundary';





const AdminDashboard = () => {
    const [stats, setStats] = React.useState({ clientes: 0, cotizaciones: 0, servicios: 0, pendientes: 0 });

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await import('./services/api').then(m => m.default.get('/dashboard/stats'));
                setStats(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="admin-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div className="admin-card stats-card">
                <span className="tag">Prospectos</span>
                <h4>{stats.clientes} Clientes</h4>
                <p>En seguimiento actual.</p>
            </div>
            <div className="admin-card stats-card">
                <span className="tag">Propuestas</span>
                <h4>{stats.cotizaciones} Cotizaciones</h4>
                <p>Generadas el último mes.</p>
            </div>
            <div className="admin-card stats-card">
                <span className="tag">Contratados</span>
                <h4>{stats.pendientes} Eventos</h4>
                <p>Próximos a celebrarse.</p>
            </div>
        </div>
    );
};

function App() {
    return (
        <BrandingProvider>
            <AuthProvider>
                <Routes>
                    {/* Public Website */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<PublicPageViewV4 />} />
                        <Route path="/legacy-home" element={<Home />} />
                        <Route path="/servicios" element={<Services />} />
                        <Route path="/galeria" element={<Gallery />} />
                        <Route path="/galeria/:id" element={<EventDetail />} />
                        <Route path="/nosotros" element={<About />} />
                        <Route path="/contacto" element={<Contact />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/p/:slug" element={<PublicPageViewV4 />} />



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
                        <Route path="clientes" element={<AdminClientesTable />} />
                        <Route path="cotizaciones" element={<AdminCotizaciones />} />
                        <Route path="cotizaciones/nueva" element={<AdminCotizacionForm />} />
                        <Route path="cotizaciones/editar/:id" element={<AdminCotizacionForm />} />
                        <Route path="cotizaciones/:id/view" element={<QuotationView />} />
                        <Route path="cotizaciones/:id/contrato" element={<AdminContrato />} />
                        <Route path="plantillas" element={<AdminPlantillas />} />
                        <Route path="servicios" element={<AdminInventario />} />
                        <Route path="proveedores" element={<AdminProveedoresTable />} />
                        <Route path="empresa" element={<AdminEmpresasTable />} />
                        <Route path="empresa/editar/:id" element={<AdminEmpresa />} />
                        <Route path="usuarios" element={<AdminUsuariosTable />} />
                        <Route path="perfil" element={<AdminPerfil />} />
                        <Route path="ayuda" element={<AdminAyuda />} />
                        <Route path="testimonios" element={<AdminTestimonios />} />
                        <Route path="paginas" element={<AdminPaginas />} />
                        <Route path="servicios-web" element={<AdminServiciosWeb />} />
                        <Route path="config-web" element={<AdminCmsWeb />} />
                        <Route path="galeria" element={<AdminGallery />} />
                        <Route path="paginas-v4" element={<AdminPaginasV4 />} />
                        <Route path="builder-v4/:id" element={<VisualBuilderV4 />} />
                    </Route>

                    {/* Isolated Print Route (No Layouts) */}
                    <Route path="/print-quotation/:id" element={<QuotationView isPrintView={true} />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </BrandingProvider>
    );
}

export default App;
