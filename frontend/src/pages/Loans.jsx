import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

export default function Loans() {
    const [loans, setLoans] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [newLoan, setNewLoan] = useState({ book_id: '', student_name: '', student_class: '' });
    const [bookSearch, setBookSearch] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSearchingBooks, setIsSearchingBooks] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchLoans(1, search);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const fetchLoans = async (page = 1, searchQuery = '') => {
        setLoading(true);
        try {
            const res = await api.get(`/loans?page=${page}&search=${searchQuery}`);
            setLoans(res.data.data);
            setCurrentPage(res.data.current_page);
            setLastPage(res.data.last_page);
        } catch (e) {
            toast.error('Erro ao carregar empréstimos.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchBooks = async () => {
        setIsSearchingBooks(true);
        try {
            const res = await api.get(`/books?search=${bookSearch}&per_page=10`);
            setBooks(res.data.data.filter(b => b.available_quantity > 0));
        } catch (e) {
            toast.error('Erro ao buscar livros.');
            console.error(e);
        } finally {
            setIsSearchingBooks(false);
        }
    };

    const handleCreateLoan = async (e, force = false) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/loans', { ...newLoan, force });
            toast.success('Empréstimo registrado com sucesso!');
            setShowModal(false);
            setNewLoan({ book_id: '', student_name: '', student_class: '' });
            fetchLoans(currentPage, search);
        } catch (e) {
            if (e.response?.status === 409 && e.response?.data?.requires_confirmation) {
                toast((t) => (
                    <div>
                        <p>{e.response.data.message}</p>
                        <div className="flex gap-2 justify-end mt-2">
                            <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => toast.dismiss(t.id)}>Cancelar</button>
                            <button className="btn btn-primary" style={{ backgroundColor: 'var(--color-warning)', padding: '0.2rem 0.5rem', fontSize: '0.8rem', color: 'var(--color-text-main)' }} onClick={() => {
                                toast.dismiss(t.id);
                                handleCreateLoan(null, true);
                            }}>Forçar Empréstimo</button>
                        </div>
                    </div>
                ), { duration: Infinity });
            } else {
                toast.error(e.response?.data?.message || 'Erro ao registrar empréstimo.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReturn = (id) => {
        toast((t) => (
            <div>
                <p>Confirmar devolução deste livro?</p>
                <div className="flex gap-2 justify-end mt-2">
                    <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => toast.dismiss(t.id)}>Cancelar</button>
                    <button className="btn btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            await api.post(`/loans/${id}/return`);
                            toast.success('Livro devolvido com sucesso!');
                            fetchLoans(currentPage, search);
                        } catch (e) {
                            toast.error('Erro ao devolver.');
                        }
                    }}>Confirmar</button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2>Gestão de Empréstimos e Devoluções</h2>
                <div className="flex gap-4">
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-text-muted)' }} />
                        <input
                            placeholder="Buscar Empréstimo (Aluno, Livro)"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '2.5rem', width: '300px' }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Novo Empréstimo</button>
                </div>
            </div>

            <div className="card">
                <h3 className="mb-4">Tabela de Livros (Histórico e Ativos)</h3>
                {loans.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead style={{ backgroundColor: 'var(--color-background)' }}>
                            <tr>
                                <th style={{ padding: '0.75rem' }}>Capa</th>
                                <th>Livro</th>
                                <th>Aluno</th>
                                <th>Data Realização</th>
                                <th>Prazo Final</th>
                                <th>Status</th>
                                <th>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loans.map(loan => (
                                <tr key={loan.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '0.75rem' }}>
                                        {loan.book?.cover_url ? (
                                            <img src={loan.book.cover_url} alt="Capa" style={{ width: '30px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                        ) : (
                                            <div style={{ width: '30px', height: '40px', backgroundColor: 'var(--color-border)', borderRadius: '4px' }}></div>
                                        )}
                                    </td>
                                    <td>{loan.book?.title}</td>
                                    <td>{loan.student?.name} <span style={{ color: 'var(--color-text-muted)' }}>({loan.student?.classroom})</span></td>
                                    <td>{new Date(loan.loan_date).toLocaleDateString()}</td>
                                    <td>{new Date(loan.due_date).toLocaleDateString()}</td>
                                    <td>
                                        {loan.status === 'active' ? (
                                            <span style={{ backgroundColor: 'var(--color-warning)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>Pendente</span>
                                        ) : (
                                            <span style={{ backgroundColor: 'var(--color-success)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>Devolvido</span>
                                        )}
                                    </td>
                                    <td>
                                        {loan.status === 'active' ? (
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600 }}
                                                onClick={() => handleReturn(loan.id)}
                                            >
                                                Confirmar Devolução
                                            </button>
                                        ) : (
                                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Nenhum empréstimo encontrado.</p>
                )}
                {!loading && lastPage > 1 && (
                    <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={(page) => fetchLoans(page, search)} />
                )}
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <p>Carregando empréstimos...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '700px', padding: '2rem' }}>
                        <h3 className="mb-4">Registrar Novo Empréstimo</h3>
                        <form onSubmit={handleCreateLoan}>
                            <div className="form-group">
                                <label>Selecionar Livro</label>
                                <div className="flex gap-2" style={{ marginBottom: '0.5rem' }}>
                                    <input
                                        placeholder="Pesquisar por título ou autor..."
                                        value={bookSearch}
                                        onChange={e => setBookSearch(e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <button type="button" className="btn btn-secondary" onClick={fetchBooks} disabled={isSearchingBooks}>
                                        {isSearchingBooks ? 'Buscando...' : 'Buscar'}
                                    </button>
                                </div>
                                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)' }}>
                                    {books.map(b => (
                                        <div
                                            key={b.id}
                                            onClick={() => setNewLoan({ ...newLoan, book_id: b.id })}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid var(--color-border)',
                                                backgroundColor: newLoan.book_id == b.id ? 'var(--color-primary)' : 'transparent',
                                                color: newLoan.book_id == b.id ? 'var(--color-text-main)' : 'var(--color-text-main)',
                                                fontWeight: newLoan.book_id == b.id ? '600' : 'normal',
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            {b.title} <span style={{ color: newLoan.book_id == b.id ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}>- {b.author} ({b.available_quantity} disp.)</span>
                                        </div>
                                    ))}
                                    {books.length === 0 && (
                                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Digite um termo e clique em Buscar para listar os livros.</div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div className="form-group">
                                    <label>Nome do Aluno</label>
                                    <input required value={newLoan.student_name} onChange={e => setNewLoan({ ...newLoan, student_name: e.target.value })} placeholder="Nome completo do aluno" />
                                </div>
                                <div className="form-group">
                                    <label>Turma / Classe</label>
                                    <input required value={newLoan.student_class} onChange={e => setNewLoan({ ...newLoan, student_class: e.target.value })} placeholder="Ex: 8º Ano A" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Registrando...' : 'Emprestar Livro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
