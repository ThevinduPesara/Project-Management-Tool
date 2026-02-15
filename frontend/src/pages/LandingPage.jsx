import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Users, ArrowRight, Layout, BrainCircuit, MessageSquare, CheckCircle } from 'lucide-react';

const LandingPage = () => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            overflowX: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Navbar */}
            <nav style={{
                padding: '1.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}>
                        <Layout color="white" size={24} />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>UniTask</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/login" className="btn-ghost" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '0.75rem 1.5rem', fontWeight: '500' }}>Login</Link>
                    <Link to="/register" className="btn-primary" style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        Get Started <ArrowRight size={16} />
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '6rem 2rem',
                textAlign: 'center',
                position: 'relative'
            }}>
                {/* Background decorative blobs */}
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '10%',
                    width: '300px',
                    height: '300px',
                    background: '#6366f1',
                    filter: 'blur(100px)',
                    opacity: 0.1,
                    borderRadius: '50%',
                    zIndex: 0
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '10%',
                    width: '400px',
                    height: '400px',
                    background: '#ec4899',
                    filter: 'blur(120px)',
                    opacity: 0.1,
                    borderRadius: '50%',
                    zIndex: 0
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ position: 'relative', zIndex: 1 }}
                >
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        padding: '0.5rem 1rem',
                        borderRadius: '100px',
                        marginBottom: '2rem',
                        color: '#a5b4fc',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}>
                        <Sparkles size={16} />
                        <span>AI-Powered Project Management</span>
                    </div>

                    <h1 style={{
                        fontSize: '4.5rem',
                        fontWeight: '800',
                        lineHeight: 1.1,
                        marginBottom: '1.5rem',
                        letterSpacing: '-0.02em',
                        background: 'linear-gradient(to bottom, #ffffff, #cbd5e1)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Collaborate smarter, <br />
                        <span style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>not harder.</span>
                    </h1>

                    <p style={{
                        fontSize: '1.25rem',
                        color: '#94a3b8',
                        maxWidth: '700px',
                        margin: '0 auto 3rem',
                        lineHeight: 1.6
                    }}>
                        The all-in-one workspace for student groups. Manage tasks, chat in real-time, and let AI plan your project roadmap in seconds.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/register" style={{
                            background: 'white',
                            color: '#0f172a',
                            padding: '1rem 2.5rem',
                            borderRadius: '16px',
                            textDecoration: 'none',
                            fontWeight: '700',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 20px 25px -5px rgba(255, 255, 255, 0.1)'
                        }}>
                            Start for Free <Zap size={20} fill="#0f172a" />
                        </Link>
                        <Link to="/login" style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            padding: '1rem 2.5rem',
                            borderRadius: '16px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '1.1rem',
                            backdropFilter: 'blur(10px)'
                        }}>
                            View Demo
                        </Link>
                    </div>
                </motion.div>
            </header>

            {/* Features Grid */}
            <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem 8rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <FeatureCard
                        icon={<BrainCircuit size={32} color="#6366f1" />}
                        title="AI Project Planner"
                        description="Upload your project brief and let our AI generate a complete task list, assign members, and estimate difficulty instantly."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={<Layout size={32} color="#ec4899" />}
                        title="Drag & Drop Kanban"
                        description="Visualize your workflow with our intuitive Kanban board. Move tasks from To Do to Done with a simple swipe."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={<MessageSquare size={32} color="#8b5cf6" />}
                        title="Real-time Chat"
                        description="Ditch external apps. Chat with your team directly in the project dashboard with group messaging and file sharing."
                        delay={0.3}
                    />
                </div>
            </section>

            {/* Trust/Footer */}
            <footer style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#64748b'
            }}>
                <p>&copy; 2026 UniTask. Built for high-performance student teams.</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ y: -5 }}
        style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            padding: '2rem',
            backdropFilter: 'blur(10px)'
        }}
    >
        <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
        }}>
            {icon}
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>{title}</h3>
        <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{description}</p>
    </motion.div>
);

export default LandingPage;
