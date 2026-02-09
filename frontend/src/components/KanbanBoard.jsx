import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Bug, FileText, CheckSquare } from 'lucide-react';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

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

            <div className="card-footer">
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
        </motion.div>
    );
};

const DroppableColumn = ({ column, tasks }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: column.status,
        data: { status: column.status }
    });

    return (
        <div className="kanban-column" ref={setNodeRef}>
            <div className="column-header">
                <span className="column-dot" style={{ backgroundColor: column.color }}></span>
                <h3>{column.title}</h3>
                <span className="count">{tasks.length}</span>
            </div>

            <div
                className="column-content"
                style={{
                    backgroundColor: isOver ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                    transition: 'background-color 0.2s'
                }}
            >
                {tasks.map(task => (
                    <DraggableTask key={task._id} task={task} />
                ))}
            </div>
        </div>
    );
};

const KanbanBoard = ({ tasks, onStatusChange }) => {
    const columns = [
        { title: 'To Do', status: 'To Do', color: 'var(--text-muted)' },
        { title: 'In Progress', status: 'In Progress', color: 'var(--warning)' },
        { title: 'Done', status: 'Done', color: 'var(--success)' },
    ];

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) return;

        const taskId = active.id;
        const newStatus = over.id;
        const task = active.data.current.task;

        // Only update if status actually changed
        if (task.status !== newStatus) {
            onStatusChange(taskId, newStatus);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
        >
            <div className="kanban-board">
                {columns.map(column => (
                    <DroppableColumn
                        key={column.status}
                        column={column}
                        tasks={tasks.filter(t => t.status === column.status)}
                    />
                ))}
            </div>
        </DndContext>
    );
};

export default KanbanBoard;

