import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Home, Users, Settings, LogOut, BookDown, GraduationCap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function ProtectedLayout() {
    const { user, school, logout } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" />;
    }

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header" style={{ justifyContent: 'center', height: '160px', flexDirection: 'column' }}>
                    {school?.logo_url ? (
                        <img src={school.logo_url} alt="Logo da Escola" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '0.5rem', borderRadius: '50%' }} />
                    ) : (
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#D1D5DB', borderRadius: '50%', marginBottom: '0.5rem' }}></div>
                    )}
                    <div className="sidebar-logo" style={{ color: 'var(--color-primary-hover)' }}>Liblink</div>
                </div>
                
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
                        <Home size={20} /> Dashboard
                    </Link>
                    <Link to="/books" className={`nav-item ${isActive('/books')}`}>
                        <BookOpen size={20} /> Acervo
                    </Link>
                    <Link to="/loans" className={`nav-item ${isActive('/loans')}`}>
                        <BookDown size={20} /> Empréstimos
                    </Link>
                    
                    {user.role === 'admin' && (
                        <>
                            <Link to="/team" className={`nav-item ${isActive('/team')}`}>
                                <Users size={20} /> Bibliotecários
                            </Link>
                            <Link to="/settings" className={`nav-item ${isActive('/settings')}`}>
                                <Settings size={20} /> Configurações
                            </Link>
                        </>
                    )}
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                        <strong>{user.name}</strong><br/>
                        <span style={{ color: 'var(--color-text-muted)' }}>{user.role === 'admin' ? 'Gestor' : 'Bibliotecário'}</span>
                    </div>
                    <button onClick={logout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                        <LogOut size={20} /> Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="page-content" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
