import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, 
    Clock, 
    Image as ImageIcon, 
    ListChecks, 
    TrendingUp, 
    MapPin,
    Users,
    Layout as LayoutIcon,
    Maximize2,
    Minimize2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import financeService from '../../services/financeService';
import itinerarioService from '../../services/itinerarioService';
import itemClaveService from '../../services/itemClaveService';
import invitadoService from '../../services/invitadoService';
import GuestListManager from '../../components/admin/planner/GuestListManager';
import SpatialDesigner from '../../components/admin/planner/SpatialDesigner';
import CountdownTimer from '../../components/ui/CountdownTimer';
import InspirationBoard from '../../components/admin/planner/InspirationBoard';

const AnimatedStatSVG = ({ percentage, color = "var(--color-primary)", label, size = 120 }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="stat-svg-container" style={{ width: size, height: size }}>
            <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <motion.circle 
                    cx="50" cy="50" r={radius} fill="none" 
                    stroke={color} strokeWidth="6"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 2 }}
                    strokeLinecap="round"
                />
            </svg>
            <div className="stat-svg-text">
                <span className="stat-perc">{Math.round(percentage)}%</span>
            </div>
        </div>
    );
};

const ClientDashboard = () => {
    const { id: routeId } = useParams();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('summary');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [events, setEvents] = useState([]);
    const [finance, setFinance] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadPortalData = async (cliId) => {
        try {
            const allEvents = await financeService.getClientEvents(cliId);
            setEvents(allEvents);
            const targetId = routeId || (allEvents.length > 0 ? allEvents[0].id : null);
            if (targetId) {
                const financeData = await financeService.getEventSummary(targetId);
                setFinance(financeData);
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { if (user) loadPortalData(user.cli_id || user.id); }, [user, routeId]);

    // FullScreen status is now managed via callback from SpatialDesigner or manual toggle
    // Removed automatic trigger for planner360 to keep Hero visible initially

    const paletteColors = finance?.activeQuote?.paleta_colores ? finance.activeQuote.paleta_colores.split(',').map(c => c.trim()) : [];
    const eventType = finance?.activeQuote?.tipo_evento || events[0]?.tipo_evento || 'Otro';

    if (loading) return <div className="portal-v6-loading">ARCHIPLANNER</div>;

    return (
        <div className={`portal-v6-root ${isFullScreen ? 'fullscreen-active' : ''}`}>
            
            {/* HERO SECTION - Invisible if Fullscreen */}
            <AnimatePresence>
                {!isFullScreen && (
                    <motion.header 
                        initial={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="portal-v6-hero-pixel"
                    >
                        <div className="hero-left-pixel">
                            <span className="hero-tag-pixel">MI HISTORIA ARCHIPLANNER</span>
                            <h1 className="hero-title-pixel">{finance?.activeQuote?.tematica || (events.length > 0 ? events[0].tematica : 'Cargando...')}</h1>
                            <div className="hero-meta-pixel">
                                <div className="meta-icon-row">
                                    <Calendar size={14} /> <span>{finance?.activeQuote?.fevent ? new Date(finance.activeQuote.fevent).toLocaleDateString() : (events[0]?.fevent ? new Date(events[0].fevent).toLocaleDateString() : '---')}</span>
                                    <span className="meta-dot" />
                                    <MapPin size={14} /> <span>{finance?.activeQuote?.lugar || (events[0]?.lugar || '---')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="hero-right-pixel">
                            <div className="countdown-container-pixel">
                                <span className="countdown-header-title">¿CUANTO FALTA?</span>
                                <div className="countdown-mini-scaler">
                                    <CountdownTimer targetDate={finance?.activeQuote?.fevent} variant="luxe" showTitle={false} />
                                </div>
                            </div>
                            
                            <nav className="hero-nav-pixel">
                                <button className={activeTab === 'summary' ? 'active' : ''} onClick={() => setActiveTab('summary')}>
                                    <TrendingUp size={12} /> Dashboard
                                </button>
                                <button className={activeTab === 'moodboard' ? 'active' : ''} onClick={() => setActiveTab('moodboard')}>
                                    <ImageIcon size={12} /> Moodboard
                                </button>
                                <button className={activeTab === 'itinerary' ? 'active' : ''} onClick={() => setActiveTab('itinerary')}>
                                    <Clock size={12} /> Cronograma
                                </button>
                                <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>
                                    <ListChecks size={12} /> Tareas
                                </button>
                                <button className={activeTab === 'guests' ? 'active' : ''} onClick={() => setActiveTab('guests')}>
                                    <Users size={12} /> Invitados
                                </button>
                                <button className={activeTab === 'planner360' ? 'active' : ''} onClick={() => setActiveTab('planner360')}>
                                    <LayoutIcon size={12} /> Planeador 360
                                </button>
                            </nav>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            {/* Floating Navigation for Fullscreen Mode */}
            {isFullScreen && (
                <div className="fullscreen-controls">
                    <button className="btn-exit-fs" onClick={() => setActiveTab('summary')}>
                        <Minimize2 size={16} /> Salir del Planeador
                    </button>
                    <div className="fs-title">{finance?.activeQuote?.tematica}</div>
                </div>
            )}

            <AnimatePresence mode="wait">
                <motion.main 
                    key={activeTab} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }} 
                    className={`portal-content-pixel ${isFullScreen ? 'content-fs' : ''}`}
                >
                    {activeTab === 'summary' && (
                        <div className="dashboard-grid-pixel">
                            <section className="pixel-card full-bg">
                                <div className="px-card-lbl">INVERSIÓN DEL EVENTO</div>
                                <div className="px-viz-row">
                                    <AnimatedStatSVG percentage={finance?.summary?.completionPercentage || 0} size={110} />
                                    <div className="px-vals">
                                        <div className="px-price">${finance?.summary?.total?.toLocaleString()}</div>
                                        <div className="px-status">Pagado: <span>${finance?.summary?.paid?.toLocaleString()}</span></div>
                                    </div>
                                </div>
                            </section>

                            <section className="pixel-card">
                                <div className="px-card-lbl">PALETA DE COLORES</div>
                                <div className="px-palette">
                                    {paletteColors.map((c, i) => (
                                        <div key={i} className="px-pal-item">
                                            <div className="px-circle" style={{ backgroundColor: c }} />
                                            <code>{c}</code>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="pixel-card wide">
                                <div className="px-card-lbl">HISTORIAL RECIENTE</div>
                                <div className="px-table-wrap">
                                    <table className="px-table">
                                        <thead><tr><th>Fecha</th><th>Concepto</th><th>Monto</th><th>Estado</th></tr></thead>
                                        <tbody>
                                            {finance?.payments?.map((p, i) => (
                                                <tr key={i}><td>{new Date(p.fpago).toLocaleDateString()}</td><td>Abono a Presupuesto</td><td className="bold">${p.monto.toLocaleString()}</td><td><span className={`tag ${p.estado}`}>{p.estado}</span></td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'moodboard' && (
                        <InspirationBoard cotId={routeId || events[0]?.id} userRole="cliente" />
                    )}

                    {activeTab === 'guests' && (
                        <div className="glass-panel p-6">
                            <GuestListManager cotId={routeId || events[0]?.id} eventType={eventType} />
                        </div>
                    )}

                    {activeTab === 'planner360' && (
                        <SpatialDesigner 
                            cotId={routeId || events[0]?.id} 
                            userRol={user?.rol || 'cliente'} 
                            onToggleFullscreen={(val) => setIsFullScreen(val)}
                        />
                    )}
                    {/* ... other tabs ... */}
                </motion.main>
            </AnimatePresence>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

                .portal-v6-root {
                    padding: 30px 60px; min-height: 100vh; color: #fff;
                    background: #111; transition: 0.5s;
                }
                .portal-v6-root.fullscreen-active { padding: 0; background: #000; }

                /* HERO */
                .portal-v6-hero-pixel {
                    display: flex; justify-content: space-between; align-items: flex-start;
                    padding-bottom: 40px; margin-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .hero-left-pixel { flex: 1; }
                .hero-tag-pixel { font-size: 10px; font-weight: 800; letter-spacing: 2.5px; color: #b76e79; margin-bottom: 15px; display: block; }
                .hero-title-pixel { font-family: 'Playfair Display', serif; font-size: 4.5rem; font-weight: 400; margin-bottom: 20px; line-height: 1; }
                .hero-meta-pixel { display: flex; align-items: center; gap: 15px; opacity: 0.5; font-size: 13px; }
                .meta-icon-row { display: flex; align-items: center; gap: 10px; }
                .meta-dot { width: 4px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 50%; }

                .hero-right-pixel { display: flex; flex-direction: column; align-items: flex-end; gap: 15px; }
                .countdown-container-pixel { display: flex; flex-direction: column; align-items: center; gap: 0; }
                .countdown-header-title { font-family: 'Playfair Display', serif; font-style: italic; font-size: 18px; color: rgba(255,255,255,0.6); margin-bottom: 0; display: block; letter-spacing: 2px; text-align: center; line-height: 1; }
                .countdown-mini-scaler { transform: scale(0.65); transform-origin: center top; margin-top: -5px; margin-bottom: -15px; }

                .hero-nav-pixel {
                    display: flex; gap: 4px; padding: 5px; border-radius: 50px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
                }
                .hero-nav-pixel button {
                    background: transparent; border: none; color: rgba(255,255,255,0.4); 
                    font-size: 10px; font-weight: 700; padding: 8px 14px; border-radius: 50px; cursor: pointer; transition: 0.3s;
                    display: flex; align-items: center; gap: 6px;
                }
                .hero-nav-pixel button:hover { color: #fff; background: rgba(255,255,255,0.05); }
                .hero-nav-pixel button.active { background: #b76e79; color: #fff; }

                /* FULLSCREEN CONTROLS */
                .fullscreen-controls {
                    position: fixed; top: 20px; left: 20px; right: 20px; z-index: 1000;
                    display: flex; justify-content: space-between; align-items: center;
                    pointer-events: none;
                }
                .btn-exit-fs {
                    pointer-events: auto; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px);
                    color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 10px 20px;
                    border-radius: 50px; font-size: 12px; font-weight: 700; cursor: pointer;
                    display: flex; align-items: center; gap: 8px;
                }
                .fs-title { 
                    font-family: 'Playfair Display', serif; font-size: 24px; color: #fff; 
                    text-shadow: 0 2px 10px rgba(0,0,0,0.5); font-style: italic;
                }
                .fullscreen-fixed-canvas { position: fixed; inset: 0; z-index: 100; }

                /* DASHBOARD GRID */
                .dashboard-grid-pixel { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
                .pixel-card { background: rgba(255,255,255,0.02); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.04); }
                .pixel-card.wide { grid-column: span 2; }
                .px-card-lbl { font-size: 10px; letter-spacing: 1.5px; opacity: 0.3; margin-bottom: 25px; }
                .px-viz-row { display: flex; align-items: center; gap: 30px; }
                .stat-svg-container { position: relative; }
                .stat-svg-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; }
                .px-price { font-size: 2.5rem; font-weight: 800; }
                .px-status { font-size: 14px; color: #b76e79; font-weight: 700; }
                .px-palette { display: flex; gap: 20px; }
                .px-pal-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
                .px-circle { width: 50px; height: 50px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.1); }
                .px-pal-item code { font-size: 10px; opacity: 0.4; }

                .px-table { width: 100%; border-collapse: collapse; }
                .px-table th { text-align: left; opacity: 0.3; font-size: 11px; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .px-table td { padding: 15px 10px; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.02); }
                .tag { font-size: 10px; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.05); }
                .tag.completado { color: #5FDC7F; }

                .portal-v6-loading {
                    height: 100vh; display: flex; align-items: center; justify-content: center;
                    letter-spacing: 10px; font-weight: 900; color: #b76e79; background: #000;
                }

                @media (max-width: 1000px) {
                    .portal-v6-hero-pixel { flex-direction: column; align-items: flex-start; gap: 30px; }
                    .hero-right-pixel { align-items: flex-start; }
                    .dashboard-grid-pixel { grid-template-columns: 1fr; }
                    .pixel-card.wide { grid-column: span 1; }
                }
            `}</style>
        </div>
    );
};

export default ClientDashboard;
