import React from 'react';
import Sidebar from './Sidebar';

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
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
