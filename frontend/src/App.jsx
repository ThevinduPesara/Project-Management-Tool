import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupDetails from './pages/GroupDetails';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import MainLayout from './components/MainLayout';
import Projects from './pages/Projects';
import MyTasks from './pages/MyTasks';
import Team from './pages/Team';
import Settings from './pages/Settings';

const App = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '20%' }}>Loading...</div>;

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />

                {/* Private Routes wrapped in MainLayout */}
                <Route path="/dashboard" element={user ? <MainLayout><Dashboard /></MainLayout> : <Navigate to="/login" />} />
                <Route path="/projects" element={user ? <MainLayout><Projects /></MainLayout> : <Navigate to="/login" />} />
                <Route path="/my-tasks" element={user ? <MainLayout><MyTasks /></MainLayout> : <Navigate to="/login" />} />
                <Route path="/team" element={user ? <MainLayout><Team /></MainLayout> : <Navigate to="/login" />} />
                <Route path="/settings" element={user ? <MainLayout><Settings /></MainLayout> : <Navigate to="/login" />} />
                <Route path="/group/:groupId" element={user ? <MainLayout><GroupDetails /></MainLayout> : <Navigate to="/login" />} />
            </Routes>
        </Router>
    );
};

export default App;
