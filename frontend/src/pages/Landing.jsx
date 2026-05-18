import { Link } from 'react-router-dom';
import { BookOpen, Settings, Users } from 'lucide-react';

export default function Landing() {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 3rem', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-hover)' }}>
                    <BookOpen size={32} />
                    Liblink
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/onboarding" className="btn btn-secondary">Cadastrar-se</Link>
                    <Link to="/login" className="btn btn-primary">Entrar</Link>
                </div>
            </header>

            <main style={{ padding: '4rem 3rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '4rem' }}>
                    <div>
                        <h1 style={{ fontSize: '3rem', lineHeight: '1.2', marginBottom: '1.5rem' }}>
                            A Biblioteca da Sua Escola Conectada!
                        </h1>
                        <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
                            O Liblink é um sistema web personalizável que simplifica a gestão do acervo e agiliza os empréstimos em bibliotecas escolares.
                        </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {/* Placeholder for illustration */}
                        <div style={{ width: '300px', height: '200px', backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-main)', fontWeight: 'bold', fontSize: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
                            Ilustração
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: '50%' }}>
                            <Settings size={32} color="var(--color-text-main)" />
                        </div>
                        <div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Painel do Administrador<br/>(Controle e Personalização)</h3>
                            <p style={{ fontSize: '0.875rem' }}>Tenha visão geral do acervo, gerencie o acesso da sua equipe e personalize a interface com as cores e a logomarca da sua instituição. O sistema com a cara da sua escola.</p>
                        </div>
                    </div>

                    <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: '50%' }}>
                            <Users size={32} color="var(--color-text-main)" />
                        </div>
                        <div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Interface do Bibliotecário<br/>(Empréstimos e Devoluções)</h3>
                            <p style={{ fontSize: '0.875rem' }}>Uma interface limpa e intuitiva focada no dia a dia. Realize buscas rápidas no catálogo e registre empréstimos e devoluções de alunos em poucos cliques.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
