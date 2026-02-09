import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    Users, Layout, Settings, Briefcase, ClipboardList
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <aside style={{
            background: 'var(--bg-sidebar)',
            padding: '1.5rem',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            width: '260px',
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--primary-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layout size={20} color="white" />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', lineHeight: '1' }}>UniTask</h1>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Project Manager</p>
                </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <SidebarItem to="/dashboard" icon={Layout} label="Dashboard" />
                <SidebarItem to="/projects" icon={Briefcase} label="Projects" />
                <SidebarItem to="/my-tasks" icon={ClipboardList} label="My Tasks" />
                <SidebarItem to="/team" icon={Users} label="Team" />
                <SidebarItem to="/settings" icon={Settings} label="Settings" />
            </nav>

            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.name || 'User'}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user?.role || 'Member'}</p>
                </div>
                <button onClick={logout} style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: '0.25rem', cursor: 'pointer' }}>
                    <Settings size={18} />
                </button>
            </div>
        </aside>
    );
};

const SidebarItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: isActive ? '#818cf8' : '#94a3b8',
            fontWeight: isActive ? '600' : '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textDecoration: 'none'
        })}
    >
        <Icon size={20} />
        {label}
    </NavLink>
);

export default Sidebar;
