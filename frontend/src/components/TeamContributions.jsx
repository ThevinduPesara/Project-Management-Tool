import React from 'react';

const TeamContributions = ({ members }) => {
    return (
        <div className="glass-card" style={{ height: '100%', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--primary-light)' }}>↗</span> Team Contributions
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>Aggregated project progress</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {members.map((member, index) => (
                    <div key={index}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--bg-main)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: 'var(--text-muted)',
                                    border: '1px solid var(--border)'
                                }}>
                                    {member?.name ? member.name.split(' ').map(n => n[0]).join('') : 'U'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{member.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {member.completed} of {member.total} tasks completed
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontWeight: 'bold', color: 'var(--warning)', fontSize: '0.9rem' }}>
                                {member.score}%
                            </div>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${member.score}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--warning), var(--secondary))',
                                borderRadius: '4px'
                            }} />
                        </div>
                    </div>
                ))}
                {members.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No data available</p>
                )}
            </div>
        </div>
    );
};

export default TeamContributions;
