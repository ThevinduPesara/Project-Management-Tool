import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token || !user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        // Create socket connection with authentication
        const socketUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
        console.log('Connecting to socket at:', socketUrl);

        const newSocket = io(socketUrl, {
            auth: {
                token
            },
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('Socket connected successfully');
            setConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            setConnected(false);
        });

        setSocket(newSocket);

        // Cleanup on unmount or when dependencies change
        return () => {
            console.log('Closing socket connection');
            newSocket.close();
        };
    }, [user]); // Re-run when user state changes

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};
