import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Bug, FileText, CheckSquare } from 'lucide-react';
import {
    DndContext,
    rectIntersection,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Sparkles } from 'lucide-react';
import QAModal from './QAModal';

const DraggableTask = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task._id,
        data: { task }
    });

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Bug': return <Bug size={14} className="text-danger" />;
            case 'Story': return <CheckSquare size={14} className="text-primary-light" />;
            default: return <FileText size={14} className="text-muted" />;
        }
    };

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
    } : undefined;

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="kanban-card"
        >
            <div className="card-type-tag">
                {getTypeIcon(task.type)}
                <span>{task.type || 'Task'}</span>
            </div>
            <h4 className="card-title">{task.title}</h4>
            <p className="card-desc">{task.description}</p>

            <div className="card-footer" style={{ flexDirection: 'column', gap: '0.75rem', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="card-meta">
                        <Clock size={12} />
                        <span>{new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="card-user" title={task.assignedTo?.name || 'Unassigned'}>
                        {task.assignedTo ? (
                            <div className="user-avatar-sm">{task.assignedTo.name.charAt(0)}</div>
                        ) : (
                            <User size={14} color="var(--text-muted)" />
                        )}
                    </div>
                </div>

                {task.status === 'Under Review' && (
                    <button
                        className="btn-primary"
                        style={{
                            fontSize: '0.7rem',
                            padding: '0.4rem',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                            background: 'var(--primary-light)'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            window.dispatchEvent(new CustomEvent('open-qa-modal', { detail: task }));
                        }}
                    >
                        <Sparkles size={12} /> Verify with AI
                    </button>
                )}
            </div>
        </motion.div>
    );
};

const DroppableColumn = ({ id, title, tasks, color }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: { status: id }
    });

    return (
        <div
            className="kanban-column"
            ref={setNodeRef}
            style={{
                backgroundColor: isOver ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                transition: 'background-color 0.2s',
                minHeight: '500px'
            }}
        >
            <div className="column-header">
                <span className="column-dot" style={{ backgroundColor: color }}></span>
                <h3>{title}</h3>
                <span className="count">{tasks.length}</span>
            </div>

            <div className="column-content">
                {tasks.map(task => (
                    <DraggableTask key={task._id} task={task} />
                ))}
                {tasks.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', border: '2px dashed var(--border)', borderRadius: '1rem', marginTop: '1rem' }}>
                        Drop here
                    </div>
                )}
            </div>
        </div>
    );
};


const KanbanBoard = ({ tasks, onStatusChange }) => {
    const [activeId, setActiveId] = useState(null);
    const [qaTask, setQaTask] = useState(null);

    const columns = [
        { title: 'To Do', status: 'To Do', color: 'var(--text-muted)' },
        { title: 'In Progress', status: 'In Progress', color: 'var(--warning)' },
        { title: 'Under Review', status: 'Under Review', color: '#6366f1' },
        { title: 'Done', status: 'Done', color: 'var(--success)' },
    ];

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleQAVerifyRequest = (event) => {
        setQaTask(event.detail);
    };

    React.useEffect(() => {
        window.addEventListener('open-qa-modal', handleQAVerifyRequest);
        return () => window.removeEventListener('open-qa-modal', handleQAVerifyRequest);
    }, []);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const taskId = active.id;

        // Determine the target status
        let newStatus = over.id;
        if (over.data.current && over.data.current.task) {
            newStatus = over.data.current.task.status;
        } else if (over.data.current && over.data.current.status) {
            newStatus = over.data.current.status;
        }

        const task = active.data.current.task;

        // Only update if status actually changed
        if (task.status !== newStatus) {
            onStatusChange(taskId, newStatus);
            if (newStatus === 'Under Review') {
                setQaTask(task);
            }
        }
    };

    const handleQAVerified = (taskId, status) => {
        onStatusChange(taskId, status);
        setQaTask(null);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="kanban-board" style={{ height: '100%', minHeight: '600px' }}>
                {columns.map(col => (
                    <DroppableColumn
                        key={col.status}
                        id={col.status}
                        title={col.title}
                        tasks={tasks.filter(t => t.status === col.status)}
                        color={col.color}
                    />
                ))}
            </div>

            <DragOverlay dropAnimation={null}>
                {activeId ? (
                    <div style={{ transform: 'rotate(2deg)', opacity: 0.8, pointerEvents: 'none' }}>
                        <DraggableTask task={tasks.find(t => t._id === activeId)} />
                    </div>
                ) : null}
            </DragOverlay>

            <QAModal
                isOpen={!!qaTask}
                onClose={() => setQaTask(null)}
                task={qaTask}
                onVerified={handleQAVerified}
            />
        </DndContext>
    );
};

export default KanbanBoard;
