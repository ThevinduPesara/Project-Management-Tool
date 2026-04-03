import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Folder, File, Image as ImageIcon, Download, ExternalLink, 
    Calendar, User, Search, Filter, Plus, Trash2, Pencil, X, Upload, Loader2 
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ResourceShare = () => {
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Modal states
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [resourceToDelete, setResourceToDelete] = useState(null);
    const [editName, setEditName] = useState('');
    const [uploadGroupId, setUploadGroupId] = useState('');
    const [uploadFile, setUploadFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const res = await api.get('/files/my-resources');
            setResources(res.data);
        } catch (err) {
            console.error('Error fetching resources:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await api.get('/groups/my-groups');
            setGroups(res.data);
        } catch (err) {
            console.error('Error fetching groups:', err);
        }
    };

    useEffect(() => {
        fetchResources();
        fetchGroups();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile || !uploadGroupId) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('groupId', uploadGroupId);

        try {
            await api.post('/files/upload-resource', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsUploadModalOpen(false);
            setUploadFile(null);
            setUploadGroupId('');
            fetchResources();
        } catch (err) {
            alert(err.response?.data?.error || 'Upload failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editName.trim() || !selectedResource) return;

        setIsSubmitting(true);
        try {
            await api.put(`/files/${selectedResource.messageId}/${selectedResource.filename}`, {
                originalName: editName
            });
            setIsEditModalOpen(false);
            fetchResources();
        } catch (err) {
            alert(err.response?.data?.error || 'Update failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (resource) => {
        setResourceToDelete(resource);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!resourceToDelete) return;

        setIsSubmitting(true);
        try {
            await api.delete(`/files/${resourceToDelete.messageId}/${resourceToDelete.filename}`);
            setIsDeleteModalOpen(false);
            setResourceToDelete(null);
            fetchResources();
        } catch (err) {
            alert(err.response?.data?.error || 'Delete failed');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}
            >
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Resource Share</h1>
                    <p style={{ color: 'var(--text-dim)' }}>All shared files and documents across your projects.</p>
                </div>
                <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="btn-primary" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
                >
                    <Plus size={20} /> Upload Resource
                </button>
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

                                {user?._id === resource.sender?._id && (
                                    <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', display: 'flex', gap: '0.4rem' }}>
                                        <button 
                                            onClick={() => {
                                                setSelectedResource(resource);
                                                setEditName(resource.originalName);
                                                setIsEditModalOpen(true);
                                            }}
                                            style={{ background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(resource)}
                                            style={{ background: 'rgba(220, 38, 38, 0.8)', border: 'none', color: 'white', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
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

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyCenter: 'center', zIndex: 1000, padding: '1rem' }}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card" 
                            style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative', margin: 'auto' }}
                        >
                            <button 
                                onClick={() => setIsUploadModalOpen(false)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Upload New Resource</h2>
                            <form onSubmit={handleUpload}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Select Project/Group</label>
                                    <select 
                                        required
                                        value={uploadGroupId}
                                        onChange={(e) => setUploadGroupId(e.target.value)}
                                        className="glass-input"
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                    >
                                        <option value="" style={{ background: '#1a1a1a' }}>-- Select a Group --</option>
                                        {groups.map(g => (
                                            <option key={g._id} value={g._id} style={{ background: '#1a1a1a' }}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Choose File</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type="file" 
                                            required
                                            onChange={(e) => setUploadFile(e.target.files[0])}
                                            style={{ width: '100%', color: 'var(--text-dim)' }}
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting || !uploadFile || !uploadGroupId}
                                    className="btn-primary" 
                                    style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                                    {isSubmitting ? 'Uploading...' : 'Share Resource'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyCenter: 'center', zIndex: 1000, padding: '1rem' }}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card" 
                            style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative', margin: 'auto' }}
                        >
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Rename Resource</h2>
                            <form onSubmit={handleUpdate}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Filename</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="glass-input"
                                        style={{ width: '100%' }}
                                        placeholder="Enter new filename..."
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button 
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="btn-outline" 
                                        style={{ flex: 1, padding: '0.75rem' }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting || !editName.trim()}
                                        className="btn-primary" 
                                        style={{ flex: 2, padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                                        {isSubmitting ? 'Updating...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyCenter: 'center', zIndex: 1000, padding: '1rem' }}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card" 
                            style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative', margin: 'auto', textAlign: 'center' }}
                        >
                            <div style={{ 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '30px', 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                color: '#ef4444', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                margin: '0 auto 1.5rem' 
                            }}>
                                <Trash2 size={30} />
                            </div>
                            
                            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Delete Resource?</h2>
                            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', lineHeight: '1.5' }}>
                                Are you sure you want to delete <strong>"{resourceToDelete?.originalName}"</strong>? This action cannot be undone.
                            </p>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button 
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="btn-outline" 
                                    style={{ flex: 1, padding: '0.75rem' }}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete}
                                    className="btn-primary" 
                                    style={{ flex: 1, padding: '0.75rem', background: '#ef4444', borderColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                                    {isSubmitting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ResourceShare;
