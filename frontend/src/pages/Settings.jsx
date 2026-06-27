import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth, setAppColors } from '../context/AuthContext';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
    const { school, setSchool, user } = useAuth();
    const logoInputRef = useRef(null);
    const [config, setConfig] = useState({
        name: '', max_loan_days: 14, max_books_per_student: 3, block_multiple_loans: false, logo_url: '',
        primary_color: '#B3D0D8', penalty_fine_per_day: 0, penalty_block_loans: true
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');

    useEffect(() => {
        if (school) setConfig(school);
    }, [school]);

    const handleSaveConfig = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.keys(config).forEach(key => {
                if (config[key] !== null && config[key] !== undefined) {
                    if (typeof config[key] === 'boolean') {
                        formData.append(key, config[key] ? 1 : 0);
                    } else {
                        formData.append(key, config[key]);
                    }
                }
            });
            if (logoFile) {
                formData.append('logo_image', logoFile);
            }
            formData.append('_method', 'PUT');

            const res = await api.post('/settings/school', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSchool(res.data.school);
            setAppColors(res.data.school.primary_color);
            setLogoFile(null);
            setLogoPreview('');
            toast.success('Configurações salvas!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erro ao salvar configurações');
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
                        <div
                            onClick={() => logoInputRef.current.click()}
                            style={{
                                width: '100%',
                                height: '200px',
                                backgroundColor: 'var(--color-background)',
                                border: '2px dashed var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                transition: 'all 0.2s ease',
                                marginBottom: '1rem',
                                position: 'relative'
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                        >
                            {logoPreview || config.logo_url ? (
                                <img src={logoPreview || config.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <>
                                    <Upload size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }} />
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Carregar Logo</div>
                                    <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', opacity: 0.7 }}>Clique para selecionar (Máx 5MB)</small>
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={logoInputRef}
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={e => {
                                const file = e.target.files[0];
                                if (file) {
                                    setLogoFile(file);
                                    setLogoPreview(URL.createObjectURL(file));
                                    setConfig({ ...config, logo_url: '' });
                                }
                            }}
                        />
                        <div className="form-group">
                            <label>Link da Logo (Internet)</label>
                            <input
                                placeholder="URL da Logo (Ex: https://escola.com/logo.png)"
                                value={config.logo_url || ''}
                                onChange={e => {
                                    setConfig({ ...config, logo_url: e.target.value });
                                    setLogoFile(null);
                                    setLogoPreview('');
                                }}
                            />
                        </div>
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
                            checked={!!config.penalty_block_loans}
                            onChange={e => setConfig({ ...config, penalty_block_loans: e.target.checked })}
                        />
                        <label style={{ margin: 0 }}>Bloquear novos empréstimos para alunos com pendências?</label>
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <input
                            type="checkbox"
                            style={{ width: 'auto' }}
                            checked={!!config.block_multiple_loans}
                            onChange={e => setConfig({ ...config, block_multiple_loans: e.target.checked })}
                        />
                        <label style={{ margin: 0 }}>Proibir que aluno com livro emprestado pegue outro?</label>
                    </div>

                    <button type="submit" className="btn btn-primary mt-4" style={{ width: '100%' }}>Salvar Alterações</button>
                </div>
            </form>
        </div>
    );
}
