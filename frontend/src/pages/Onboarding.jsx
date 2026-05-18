import { useState } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Onboarding() {
    const [formData, setFormData] = useState({
        school_name: '',
        inep_code: '',
        admin_name: '',
        admin_email: '',
        admin_password: '',
        admin_password_confirmation: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // We can use the login function from context to automatically set the user state after register
    // But since register returns the token, we can just save it and reload
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.admin_password !== formData.admin_password_confirmation) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/register-school', formData);

            // Store token and reload app to hydrate AuthContext
            localStorage.setItem('liblink_token', response.data.access_token);
            window.location.href = '/';

        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao registrar escola.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout" style={{ padding: '2rem' }}>
            <div className="auth-card" style={{ maxWidth: '600px' }}>
                <div className="auth-header">
                    <div className="auth-logo">
                        <BookOpen size={32} />
                        Liblink
                    </div>
                    <p>Cadastre sua Escola e seja o Gestor da Biblioteca</p>
                </div>

                {error && <div className="text-danger mb-4 text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Nome da Escola</label>
                            <input name="school_name" required onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Código INEP</label>
                            <input name="inep_code" required onChange={handleChange} />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Seu Nome (Gestor)</label>
                            <input name="admin_name" required onChange={handleChange} />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>E-mail (Gestor)</label>
                            <input name="admin_email" type="email" required onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Senha</label>
                            <input name="admin_password" type="password" required minLength={8} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Confirmar Senha</label>
                            <input name="admin_password_confirmation" type="password" required minLength={8} onChange={handleChange} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary mt-4" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Registrando...' : 'Finalizar Cadastro'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <Link to="/login">Já possui conta? <strong>Faça Login</strong></Link>
                </div>
            </div>
        </div>
    );
}
