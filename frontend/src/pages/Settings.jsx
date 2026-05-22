import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth, setAppColors } from '../context/AuthContext';
import { Upload } from 'lucide-react';

export default function Settings() {
    const { school, user } = useAuth();
    const [config, setConfig] = useState({
        name: '', max_loan_days: 14, max_books_per_student: 3, logo_url: '',
        primary_color: '#B3D0D8', penalty_fine_per_day: 0, penalty_block_loans: true
    });

    useEffect(() => {
        if (school) setConfig(school);
    }, [school]);

    const handleSaveConfig = async (e) => {
        e.preventDefault();
        try {
            await api.put('/settings/school', config);
            setAppColors(config.primary_color);
            alert('Configurações salvas!');
        } catch (e) {
            alert('Erro ao salvar configurações');
        }
    };

    return (
        <div>
            <h2 className="mb-4">Configurações</h2>
            <form onSubmit={handleSaveConfig} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

                {/* Bloco 1: Personalização */}
                <div className="card">
                    <h3 className="mb-4" style={{ textAlign: 'center' }}>Personalização</h3>

                    <div className="form-group">
                        <label style={{ textAlign: 'center', marginBottom: '1rem' }}>Logo da Escola</label>
                        <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--color-background)', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', overflow: 'hidden' }}>
                            {config.logo_url ? (
                                <img src={config.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <>
                                    <Upload size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }} />
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Visualização da Logo</div>
                                </>
                            )}
                        </div>
                        <input
                            placeholder="URL da Logo (Ex: https://escola.com/logo.png)"
                            value={config.logo_url || ''}
                            onChange={e => setConfig({ ...config, logo_url: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Cor Primária do Sistema</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input
                                type="color"
                                value={config.primary_color || '#B3D0D8'}
                                onChange={e => setConfig({ ...config, primary_color: e.target.value })}
                                style={{ width: '50px', height: '50px', padding: '0', cursor: 'pointer', border: 'none' }}
                            />
                            <button type="button" className="btn btn-secondary" onClick={() => setConfig({ ...config, primary_color: '#B3D0D8' })} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Restaurar Padrão</button>
                        </div>
                    </div>
                </div>

                {/* Bloco 2: Regras de Uso */}
                <div className="card">
                    <h3 className="mb-4" style={{ textAlign: 'center' }}>Regras de Uso</h3>

                    <div className="form-group">
                        <label>Nome da Instituição</label>
                        <input value={config.name || ''} onChange={e => setConfig({ ...config, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Prazo Padrão de Empréstimo (Dias)</label>
                        <input type="number" min="1" value={config.max_loan_days || 14} onChange={e => setConfig({ ...config, max_loan_days: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Limite de Livros por Aluno</label>
                        <input type="number" min="1" value={config.max_books_per_student || 3} onChange={e => setConfig({ ...config, max_books_per_student: e.target.value })} required />
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-border)', margin: '1.5rem 0' }}></div>
                    <h4 style={{ marginBottom: '1rem' }}>Regras de Penalidade</h4>

                    <div className="form-group">
                        <label>Multa Diária por Atraso (R$)</label>
                        <input type="number" step="0.01" min="0" value={config.penalty_fine_per_day || 0} onChange={e => setConfig({ ...config, penalty_fine_per_day: e.target.value })} />
                        <small style={{ color: 'var(--color-text-muted)' }}>Deixe 0 se não houver cobrança.</small>
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            style={{ width: 'auto' }}
                            checked={config.penalty_block_loans}
                            onChange={e => setConfig({ ...config, penalty_block_loans: e.target.checked })}
                        />
                        <label style={{ margin: 0 }}>Bloquear novos empréstimos para alunos com pendências?</label>
                    </div>

                    <button type="submit" className="btn btn-primary mt-4" style={{ width: '100%' }}>Salvar Alterações</button>
                </div>
            </form>
        </div>
    );
}
