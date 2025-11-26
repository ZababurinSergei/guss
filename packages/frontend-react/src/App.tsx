import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { LoginPage } from './pages/LoginPage';
import { RoundsList } from './pages/RoundsList';
import { RoundPage } from './pages/RoundPage';
import './index.css';

const AppContent: React.FC = () => {
    const { user, loading } = useApp();

    // Показываем загрузку только при первоначальной проверке авторизации
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
            }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid rgba(255,255,255,0.3)',
                        borderTop: '4px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <div>Проверка авторизации...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/rounds" replace />} />
            <Route path="/rounds" element={<RoundsList />} />
            <Route path="/rounds/:id" element={<RoundPage />} />
            <Route path="*" element={<Navigate to="/rounds" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <AppProvider>
                <AppContent />
            </AppProvider>
        </Router>
    );
};

export default App;