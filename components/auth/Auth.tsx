import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, Package } from 'lucide-react';
import './Auth.css';

export const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isRegistering) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro na autenticação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <Package size={32} />
                    </div>
                    <h1 className="auth-title">Gestão Almoxarifado</h1>
                    <p className="auth-subtitle">
                        {isRegistering ? 'Crie sua conta para começar' : 'Entre com suas credenciais'}
                    </p>
                </div>

                {error && (
                    <div className="auth-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleAuth}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">E-mail</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                id="email"
                                type="email"
                                className="auth-input"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Senha</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                id="password"
                                type="password"
                                className="auth-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button className="auth-button" type="submit" disabled={loading}>
                        {loading ? (
                            <div className="spinner"></div>
                        ) : isRegistering ? (
                            <>
                                <UserPlus size={18} />
                                <span>Cadastrar</span>
                            </>
                        ) : (
                            <>
                                <LogIn size={18} />
                                <span>Entrar</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                        {isRegistering ? 'Já possui uma conta?' : 'Ainda não tem uma conta?'}
                    </span>
                    <button
                        className="auth-toggle"
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError(null);
                        }}
                    >
                        {isRegistering ? 'Fazer login' : 'Cadastre-se'}
                    </button>
                </div>
            </div>
        </div>
    );
};
