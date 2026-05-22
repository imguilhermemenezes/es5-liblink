import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao realizar login.');
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <BookOpen size={32} />
                        Liblink
                    </div>
                    <p>Entre no sistema da sua escola.</p>
                </div>

                {error && <div className="text-danger mb-4 text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>E-mail</label>
                        <input 
                            type="email" 
                            required 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            placeholder="biblioteca@escola.com" 
                        />
                    </div>
                    <div className="form-group">
                        <label>Senha</label>
                        <input 
                            type="password" 
                            required 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            placeholder="••••••••" 
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Acessar Sistema
                    </button>
                </form>

                <div className="text-center mt-4">
                    <p>Ainda não registrou sua escola?</p>
                    <Link to="/onboarding" className="mt-1" style={{ display: 'inline-block' }}>
                        Cadastre-se aqui (Onboarding)
                    </Link>
                </div>
            </div>
        </div>
    );
}
