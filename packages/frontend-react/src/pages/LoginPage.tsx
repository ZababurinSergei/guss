import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import styles from './LoginPage.module.css';

export function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useApp();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(username, password);
            navigate('/rounds');
        } catch (err) {
            // Error handling is done in the context
        }
    };

    return (
        <div className={styles['loginContainer']}>
            <div className={styles['loginCard']}>
                <h2>The Last of Guss</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles['formGroup']}>
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <div className={styles['formGroup']}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    {error && <div className={styles['errorMessage']}>{error}</div>}
                    <button
                        type="submit"
                        className={`${styles['loginBtn']} ${loading ? styles['loading'] : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}