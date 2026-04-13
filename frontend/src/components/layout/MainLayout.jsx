import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
    const { loading } = useAuth();

    if (loading) return (
        <div className="loading-screen" style={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'var(--color-bg)',
            color: 'var(--color-primary)'
        }}>
            <div className="logo" style={{fontSize: '32px'}}>Archi<span>Planner</span></div>
        </div>
    );

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
