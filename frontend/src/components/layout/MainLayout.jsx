import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import Navbar from './Navbar';
import Footer from './Footer';
import PremiumLoader from '../common/PremiumLoader';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = () => {
    const { loading: authLoading } = useAuth();
    const { loading: brandingLoading } = useBranding();
    const location = useLocation();

    const loading = authLoading || brandingLoading;

    if (loading) return <PremiumLoader />;

    return (
        <div className="main-layout" style={{ overflowX: 'hidden' }}>
            <Navbar />
            <AnimatePresence mode="wait">
                <motion.main
                    key={location.pathname}
                    initial={{ opacity: 0, filter: 'blur(5px)', scale: 1.01 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                    exit={{ opacity: 0, filter: 'blur(20px)', scale: 0.98 }}
                    transition={{ 
                        duration: 0.5, 
                        ease: [0.22, 1, 0.36, 1],
                        filter: { duration: 0.2 } // Snap to focus quickly on entrance
                    }}
                    style={{ 
                        width: '100%', 
                        minHeight: '100vh',
                        background: '#0a0a0a',
                        position: 'relative'
                    }}
                >
                    <Outlet />
                </motion.main>
            </AnimatePresence>
            <Footer />
        </div>
    );
};

export default MainLayout;
