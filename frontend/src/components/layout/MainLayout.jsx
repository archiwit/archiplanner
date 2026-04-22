import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import Navbar from './Navbar';
import Footer from './Footer';
import PremiumLoader from '../common/PremiumLoader';

const MainLayout = () => {
    const { loading: authLoading } = useAuth();
    const { loading: brandingLoading } = useBranding();

    const loading = authLoading || brandingLoading;

    if (loading) return <PremiumLoader />;

    return (
        <div className="main-layout">
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
