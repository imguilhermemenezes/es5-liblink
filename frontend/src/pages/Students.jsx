import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search } from 'lucide-react';

export default function Students() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', classroom: '' });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/students');
            setStudents(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/students', newStudent);
            setShowModal(false);
            setNewStudent({ name: '', classroom: '' });
            fetchStudents();
        } catch (e) {
            alert('Erro ao registrar aluno.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este aluno?')) return;
        try {
            await api.delete(`/students/${id}`);
            fetchStudents();
        } catch (e) {
            alert('Erro ao excluir aluno.');
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.classroom.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2>Alunos da Escola</h2>
                <div className="flex gap-4">
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-text-muted)' }} />
                        <input
                            placeholder="Buscar Aluno ou Turma"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '2.5rem', width: '300px' }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Novo Aluno</button>
                </div>
            </div>

            <div className="card">
                <h3 className="mb-4">Lista de Alunos</h3>
                {filteredStudents.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead style={{ backgroundColor: 'var(--color-background)' }}>
                            <tr>
                                <th style={{ padding: '0.75rem' }}>ID</th>
                                <th>Nome do Aluno</th>
                                <th>Turma / Sala</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)' }}>#{student.id}</td>
                                    <td style={{ fontWeight: 500 }}>{student.name}</td>
                                    <td>{student.classroom}</td>
                                    <td>
                                        <button
                                            className="btn"
                                            style={{ backgroundColor: 'var(--color-danger)', color: 'white', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                            onClick={() => handleDelete(student.id)}
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Nenhum aluno encontrado.</p>
                )}
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <p>Carregando alunos...</p>
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <h3 className="mb-4">Cadastrar Novo Aluno</h3>
                        <form onSubmit={handleCreateStudent}>
                            <div className="form-group">
                                <label>Nome Completo do Aluno</label>
                                <input
                                    required
                                    value={newStudent.name}
                                    onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                                    placeholder="Ex: João Silva"
                                />
                            </div>
                            <div className="form-group">
                                <label>Turma / Sala</label>
                                <input
                                    required
                                    value={newStudent.classroom}
                                    onChange={e => setNewStudent({ ...newStudent, classroom: e.target.value })}
                                    placeholder="Ex: 8º Ano A"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Salvar Aluno</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
