import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Folder, File, Image as ImageIcon, Download, ExternalLink, Calendar, User, Search, Filter } from 'lucide-react';
import api from '../api/axios';

const ResourceShare = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const res = await api.get('/files/my-resources');
                setResources(res.data);
            } catch (err) {
                console.error('Error fetching resources:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, []);

    const filteredResources = resources.filter(res => {
        const matchesSearch = res.originalName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             res.group.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || 
                           (filterType === 'image' && res.mimeType.startsWith('image/')) ||
                           (filterType === 'doc' && !res.mimeType.startsWith('image/'));
        return matchesSearch && matchesType;
    });

    if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading resources...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2rem' }}
            >
                <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Resource Share</h1>
                <p style={{ color: 'var(--text-dim)' }}>All shared files and documents across your projects.</p>
            </motion.header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by filename or project..."
                        className="glass-input"
                        style={{ width: '100%', paddingLeft: '3rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                        className={filterType === 'all' ? 'btn-primary' : 'btn-outline'}
                        onClick={() => setFilterType('all')}
                        style={{ padding: '0.6rem 1rem' }}
                    >
                        All
                    </button>
                    <button 
                        className={filterType === 'image' ? 'btn-primary' : 'btn-outline'}
                        onClick={() => setFilterType('image')}
                        style={{ padding: '0.6rem 1rem' }}
                    >
                        Images
                    </button>
                    <button 
                        className={filterType === 'doc' ? 'btn-primary' : 'btn-outline'}
                        onClick={() => setFilterType('doc')}
                        style={{ padding: '0.6rem 1rem' }}
                    >
                        Documents
                    </button>
                </div>
            </div>

            {filteredResources.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    <Folder size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                    <p>No resources found.</p>
                </div>
            ) : (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                    gap: '1.5rem' 
                }}>
                    {filteredResources.map((resource, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card resource-card"
                            style={{ overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ 
                                height: '160px', 
                                background: 'rgba(255, 255, 255, 0.03)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                position: 'relative'
                            }}>
                                {resource.mimeType.startsWith('image/') ? (
                                    <img 
                                        src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || `${window.location.protocol}//${window.location.hostname}:5000`}${resource.url}`} 
                                        alt={resource.originalName}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <File size={48} color="var(--primary-light)" />
                                )}
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '0.5rem', 
                                    right: '0.5rem',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    background: 'rgba(0,0,0,0.5)',
                                    fontSize: '0.7rem',
                                    color: 'white'
                                }}>
                                    {resource.mimeType.split('/')[1].toUpperCase()}
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <h3 style={{ 
                                    fontSize: '1rem', 
                                    fontWeight: '600', 
                                    marginBottom: '0.5rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {resource.originalName}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Folder size={14} /> <span>{resource.group.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <User size={14} /> <span>{resource.sender.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={14} /> <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                                    <a 
                                        href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || `${window.location.protocol}//${window.location.hostname}:5000`}${resource.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary"
                                        style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                                    >
                                        <ExternalLink size={14} /> View
                                    </a>
                                    <a 
                                        href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || `${window.location.protocol}//${window.location.hostname}:5000`}${resource.url}`}
                                        download={resource.originalName}
                                        className="btn-outline"
                                        style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                                    >
                                        <Download size={14} /> Save
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResourceShare;
