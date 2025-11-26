import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Layout.module.css';
import type { User } from '../types';

interface LayoutProps {
    user: User;
    onLogout: () => void;
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Вы уверены, что хотите выйти?')) {
            onLogout();
            navigate('/');
        }
    };

    return (
        <div className={styles['appContainer']}>
            <header className={styles['userHeader']}>
                <div className={styles['userInfo']}>
                    <span className={styles['username']}>👤 {user.username}</span>
                    <span className={styles['userRole']}>({user.role})</span>
                </div>
                <button
                    className={styles['logoutBtn']}
                    onClick={handleLogout}
                    type="button"
                >
                    Выйти
                </button>
            </header>
            <main>
                {children}
            </main>
        </div>
    );
};