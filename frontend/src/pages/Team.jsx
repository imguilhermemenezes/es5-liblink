import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Trash2, Plus } from 'lucide-react';

export default function Team() {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    
    // Formulário Nova Equipe
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'librarian' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', newUser);
            setNewUser({ name: '', email: '', password: '', role: 'librarian' });
            setShowModal(false);
            fetchUsers();
        } catch (e) {
            alert('Erro ao adicionar membro da equipe.');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Excluir este membro?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (e) {
            alert(e.response?.data?.message || 'Erro ao excluir.');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2>Gestão de Bibliotecários</h2>
            </div>

            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h3 style={{ margin: 0 }}>Bibliotecários Cadastrados</h3>
                    <div className="flex gap-2">
                        <input placeholder="Buscar Bibliotecário (Nome, E-mail)..." style={{ padding: '0.5rem', width: '300px' }} />
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} /> Registrar Bibliotecário
                        </button>
                    </div>
                </div>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead style={{ backgroundColor: 'var(--color-background)' }}>
                        <tr>
                            <th style={{ padding: '0.75rem 1rem' }}>Nome completo</th>
                            <th>Usuário/Login</th>
                            <th>Data Registro</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-main)', fontWeight: 600 }}>
                                        {u.name.charAt(0)}
                                    </div>
                                    {u.name}
                                </td>
                                <td>{u.email}</td>
                                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                <td>
                                    <span style={{ backgroundColor: 'var(--color-success)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>Ativo</span>
                                </td>
                                <td>
                                    {u.role !== 'admin' && (
                                        <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                        <h3 className="mb-4">Adicionar Bibliotecário</h3>
                        <form onSubmit={handleAddUser}>
                            <div className="form-group">
                                <label>Nome Completo</label>
                                <input required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>E-mail</label>
                                <input type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Senha provisória</label>
                                <input type="password" required minLength={8} value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Adicionar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
