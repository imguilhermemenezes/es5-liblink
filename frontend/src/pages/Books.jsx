import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

export default function Books() {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Pagination & Search States
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [isbnSearch, setIsbnSearch] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [bookForm, setBookForm] = useState({
        isbn: '', title: '', author: '', genre: '', total_quantity: 1, cover_url: '', created_at: ''
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchBooks(1, searchQuery);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchBooks = async (page = 1, search = '') => {
        setLoading(true);
        try {
            const res = await api.get(`/books?page=${page}&search=${search}`);
            setBooks(res.data.data);
            setCurrentPage(res.data.current_page);
            setLastPage(res.data.last_page);
        } catch (e) {
            toast.error('Erro ao carregar livros.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchISBN = async () => {
        if (!isbnSearch) return;
        setIsSearching(true);
        try {
            const res = await api.get(`/books/search/${isbnSearch}`);
            setBookForm({
                ...bookForm,
                isbn: res.data.isbn,
                title: res.data.title,
                author: res.data.author,
                genre: res.data.genre || '',
                cover_url: res.data.cover_url || ''
            });
            toast.success('Livro encontrado!');
        } catch (e) {
            toast.error('Livro não encontrado no Google Books. Preencha manualmente.');
        } finally {
            setIsSearching(false);
        }
    };

    const [editId, setEditId] = useState(null);

    const handleEdit = (book) => {
        setEditId(book.id);
        setBookForm({
            isbn: book.isbn,
            title: book.title,
            author: book.author,
            genre: book.genre || '',
            total_quantity: book.total_quantity,
            cover_url: book.cover_url || '',
            created_at: book.created_at
        });
        setIsbnSearch('');
        setShowModal(true);
    };

    const handleSaveBook = async (e, forceAddQuantity = false) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            if (editId) {
                await api.put(`/books/${editId}`, bookForm);
                toast.success('Livro atualizado com sucesso!');
                setShowModal(false);
                setEditId(null);
                setBookForm({ isbn: '', title: '', author: '', genre: '', total_quantity: 1, cover_url: '', created_at: '' });
                fetchBooks(currentPage, searchQuery);
            } else {
                const payload = { ...bookForm, force_add_quantity: forceAddQuantity };
                await api.post('/books', payload);
                toast.success(forceAddQuantity ? 'Quantidade adicionada ao livro existente!' : 'Livro cadastrado com sucesso!');
                setShowModal(false);
                setEditId(null);
                setBookForm({ isbn: '', title: '', author: '', genre: '', total_quantity: 1, cover_url: '', created_at: '' });
                fetchBooks(currentPage, searchQuery);
            }
        } catch (e) {
            if (e.response?.status === 409 && e.response?.data?.requires_confirmation) {
                toast((t) => (
                    <div>
                        <p>{e.response.data.message}</p>
                        <div className="flex gap-2 justify-end mt-2">
                            <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => toast.dismiss(t.id)}>Cancelar</button>
                            <button className="btn btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => {
                                toast.dismiss(t.id);
                                handleSaveBook(null, true);
                            }}>Sim, adicionar</button>
                        </div>
                    </div>
                ), { duration: 10000 });
            } else {
                toast.error(e.response?.data?.message || 'Erro ao salvar livro.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const openCreateModal = () => {
        setEditId(null);
        setBookForm({ isbn: '', title: '', author: '', genre: '', total_quantity: 1, cover_url: '', created_at: '' });
        setIsbnSearch('');
        setShowModal(true);
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div>
                <p>Tem certeza que deseja excluir este livro?</p>
                <div className="flex gap-2 justify-end mt-2">
                    <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => toast.dismiss(t.id)}>Cancelar</button>
                    <button className="btn btn-primary" style={{ backgroundColor: 'var(--color-danger)', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            await api.delete(`/books/${id}`);
                            toast.success('Livro excluído com sucesso!');
                            fetchBooks(currentPage, searchQuery);
                        } catch (e) {
                            toast.error('Erro ao excluir livro.');
                        }
                    }}>Excluir</button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2>Acervo de Livros</h2>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <p>Carregando acervo...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : (
                <>

                    {/* Admin Table View */}
                    {user.role === 'admin' ? (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div className="flex justify-between items-center" style={{ padding: '1.5rem', backgroundColor: 'var(--color-background)' }}>
                                <h3 style={{ margin: 0, color: 'var(--color-text-main)' }}>Tabela de Livros</h3>
                                <div className="flex gap-4">
                                    <input
                                        placeholder="Buscar livro..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ padding: '0.5rem 1rem', width: '250px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                                    />
                                    <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontWeight: 600 }} onClick={openCreateModal}>
                                        + Cadastrar Livro
                                    </button>
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                                <thead style={{ backgroundColor: '#E2E8F0', color: 'var(--color-text-main)' }}>
                                    <tr>
                                        <th style={{ padding: '1rem 1.5rem' }}>Capa</th>
                                        <th style={{ padding: '1rem 0' }}>ISBN</th>
                                        <th>Qtd</th>
                                        <th>Título / Autor</th>
                                        <th>Gênero</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {books.map(book => (
                                        <tr key={book.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                {book.cover_url ? (
                                                    <img src={book.cover_url} alt="Capa" style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px', backgroundColor: 'var(--color-border)' }} />
                                                ) : (
                                                    <div style={{ width: '40px', height: '56px', backgroundColor: '#D1D5DB', borderRadius: '4px' }}></div>
                                                )}
                                            </td>
                                            <td>{book.isbn}</td>
                                            <td>{book.available_quantity}/{book.total_quantity}</td>
                                            <td>
                                                <strong style={{ color: 'var(--color-text-main)' }}>{book.title}</strong><br />
                                                <span style={{ color: 'var(--color-text-muted)' }}>{book.author}</span>
                                            </td>
                                            <td>{book.genre || '-'}</td>
                                            <td>
                                                {book.available_quantity > 0 ? (
                                                    <span style={{ backgroundColor: 'var(--color-success)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Disponível</span>
                                                ) : (
                                                    <span style={{ backgroundColor: 'var(--color-danger)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Indisponível</span>
                                                )}
                                            </td>
                                            <td>
                                                <button onClick={() => handleEdit(book)} style={{ border: 'none', background: 'none', cursor: 'pointer', marginRight: '0.75rem', color: 'var(--color-text-main)' }}><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(book.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Librarian Grid View */
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <input
                                    placeholder="Buscar livro..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ padding: '0.5rem', width: '300px' }}
                                />
                                <button className="btn btn-primary" onClick={openCreateModal}>
                                    <Plus size={18} /> Cadastrar Livro
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem' }}>
                                {books.map(book => (
                                    <div key={book.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
                                        <button onClick={() => handleEdit(book)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                                            <Edit2 size={14} color="var(--color-text-main)" />
                                        </button>
                                        {book.cover_url ? (
                                            <img src={book.cover_url} alt="Capa" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '220px', backgroundColor: 'var(--color-border)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>Sem Capa</div>
                                        )}
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{book.title}</h4>
                                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>{book.author}</p>

                                        {book.available_quantity > 0 ? (
                                            <span style={{ backgroundColor: 'var(--color-success)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginTop: 'auto' }}>Disponível ({book.available_quantity})</span>
                                        ) : (
                                            <span style={{ backgroundColor: 'var(--color-danger)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginTop: 'auto' }}>Indisponível</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && lastPage > 1 && (
                        <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={(page) => fetchBooks(page, searchQuery)} />
                    )}
                </>
            )}

            {/* Modal Cadastro de Livro */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '800px', padding: '2rem' }}>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 style={{ margin: 0 }}>{editId ? 'Editar Livro' : 'Cadastrar Livro'}</h3>
                                {editId && bookForm.created_at && (
                                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                        Registrado no acervo em: {new Date(bookForm.created_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                        </div>

                        <div className="flex gap-2 mb-6 border-b pb-4" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                            <input
                                placeholder="Buscar por ISBN (Preenchimento automático)"
                                value={isbnSearch}
                                onChange={e => setIsbnSearch(e.target.value)}
                            />
                            <button className="btn btn-secondary" onClick={handleSearchISBN} disabled={isSearching}>
                                {isSearching ? 'Buscando...' : <><Search size={20} /> Buscar</>}
                            </button>
                        </div>

                        <form onSubmit={handleSaveBook} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                            {/* Left Col: Cover */}
                            <div>
                                <div style={{ width: '100%', height: '300px', backgroundColor: 'var(--color-background)', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', overflow: 'hidden' }}>
                                    {bookForm.cover_url ? (
                                        <img src={bookForm.cover_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Capa do Livro<br /><small>(Insira a URL ao lado)</small></div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>URL da Capa da Internet</label>
                                    <input value={bookForm.cover_url} onChange={e => setBookForm({ ...bookForm, cover_url: e.target.value })} placeholder="https://exemplo.com/capa.jpg" />
                                </div>
                            </div>

                            {/* Right Col: Details */}
                            <div>
                                <div className="form-group">
                                    <label>Título</label>
                                    <input value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Autor</label>
                                    <input value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>ISBN</label>
                                        <input value={bookForm.isbn} onChange={e => setBookForm({ ...bookForm, isbn: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Gênero</label>
                                        <input value={bookForm.genre} onChange={e => setBookForm({ ...bookForm, genre: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Quantidade Total</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={bookForm.total_quantity}
                                            onChange={e => {
                                                const newTotal = parseInt(e.target.value) || 1;
                                                setBookForm({
                                                    ...bookForm,
                                                    total_quantity: newTotal
                                                });
                                            }}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4 justify-end">
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSaving}>
                                        {isSaving ? 'Salvando...' : (editId ? 'Salvar Alterações' : 'Cadastrar Livro')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
