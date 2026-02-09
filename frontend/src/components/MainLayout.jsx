import React from 'react';
import Sidebar from './Sidebar';
import Notifications from './Notifications';

const MainLayout = ({ children }) => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                marginLeft: '260px',
                padding: '2.5rem',
                width: 'calc(100% - 260px)'
            }}>
                <div style={{ position: 'fixed', top: '1.5rem', right: '2rem', zIndex: 1000 }}>
                    <Notifications />
                </div>
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
