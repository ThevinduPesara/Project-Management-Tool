import React, { useEffect, useState } from 'react';
import notificationService from '../api/notificationService';
import { useAuth } from '../context/AuthContext';
import { Bell, Check } from 'lucide-react';
import './Notifications.css';

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications(user.token);
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await notificationService.markAsRead(id, user.token);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark read");
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="notification-container">
            <button className="notification-bell" onClick={() => setIsOpen(!isOpen)}>
                <Bell size={24} />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <h3>Notifications</h3>
                    {notifications.length === 0 ? (
                        <p className="no-notifs">No notifications</p>
                    ) : (
                        notifications.map(notification => (
                            <div key={notification._id} className={`notification-item ${notification.type} ${notification.isRead ? 'read' : 'unread'}`}>
                                <p>{notification.message}</p>
                                {!notification.isRead && (
                                    <button onClick={() => handleMarkRead(notification._id)} className="mark-read-btn">
                                        <Check size={16} />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Notifications;
