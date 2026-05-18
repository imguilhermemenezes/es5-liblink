import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user, school } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get('/dashboard');
                setData(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const { stats, recent_loans } = data || {};
    const overdueLoans = recent_loans ? recent_loans.filter(l => l.status === 'active' && new Date(l.due_date) < new Date()) : [];

    return (
        <div>
            <h2 className="mb-4">Dashboard - {school?.name || 'Biblioteca'}</h2>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <p>Carregando dados...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : (
                <>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="card text-center">
                            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Total de Livros</p>
                            <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '2.5rem', color: 'var(0, 0, 0)' }}>{stats.total_books || 0}</h3>
                        </div>
                        <div className="card text-center">
                            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Livros Disponíveis</p>
                            <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '2.5rem', color: 'var(0, 0, 0)' }}>{stats.available_books || 0}</h3>
                        </div>
                        <div className="card text-center">
                            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Empréstimos Ativos</p>
                            <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '2.5rem', color: 'var(0, 0, 0)' }}>{stats.active_loans || 0}</h3>
                        </div>
                        <div className="card text-center">
                            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Livros Atrasados</p>
                            <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '2.5rem', color: 'var(0,0,0)' }}>{stats.overdue_loans || 0}</h3>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: user.role === 'admin' ? '1fr 1fr' : '1fr', gap: '2rem', marginBottom: '2rem' }}>
                        {/* Registro de Atrasos */}
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Registro de Atrasos</h3>
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                                    <thead style={{ backgroundColor: 'var(--color-background)' }}>
                                        <tr>
                                            <th style={{ padding: '0.75rem 1rem' }}>Aluno</th>
                                            <th>Livro</th>
                                            <th>Dias de Atraso</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {overdueLoans.length > 0 ? overdueLoans.map(loan => {
                                            const days = Math.floor((new Date() - new Date(loan.due_date)) / (1000 * 60 * 60 * 24));
                                            return (
                                                <tr key={loan.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                                                    <td style={{ padding: '0.75rem 1rem' }}>{loan.student?.name}</td>
                                                    <td>{loan.book?.title}</td>
                                                    <td style={{ color: 'var(--color-danger)' }}>{days} dias</td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center' }}>Nenhum atraso registrado.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Histórico de Atividades (Apenas Gestor) */}
                        {user.role === 'admin' && (
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Histórico de Atividades</h3>
                                <div className="card">
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {recent_loans?.slice(0, 5).map(loan => (
                                            <li key={loan.id} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                                                O bibliotecário {loan.user?.name} registrou um {loan.status === 'active' ? 'empréstimo' : 'devolução'} de "{loan.book?.title}" para {loan.student?.name}.
                                            </li>
                                        ))}
                                        {(!recent_loans || recent_loans.length === 0) && <li>Sem atividades recentes.</li>}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Configurações do Sistema */}
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Configurações do Sistema</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div className="card" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.15)' }}>
                            <h4>Regras de Tempo</h4>
                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Prazo de Empréstimo: {school?.max_loan_days} dias</p>
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>Limite de Livros: {school?.max_books_per_student}</p>
                        </div>
                        <div className="card" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.15)' }}>
                            <h4>Regras de Penalidade</h4>
                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>
                                Multas: {school?.penalty_fine_per_day > 0 ? `R$ ${parseFloat(school.penalty_fine_per_day).toFixed(2).replace('.', ',')} por dia de atraso` : 'Sem cobrança de multa'}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>
                                {school?.penalty_block_loans ? 'Aluno fica impedido de novos empréstimos se houver atrasos.' : 'Aluno não é bloqueado por atrasos.'}
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
