import socket from 'socket.io-client';

let socketInstance = null;

export const intializeSocket = (projectId) => {
    // Checkpoint: Disconnect existing socket if switching rooms
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }

    // Checkpoint: Create new socket connection
    socketInstance = socket('http://localhost:3000', {
        auth: {
            token: localStorage.getItem('token'),
            projectId: projectId
        },
        query: {
            projectId: projectId
        },
        extraHeaders: {
            projectid: projectId
        }
    });

    // Checkpoint: Handle connection events
    socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
    });

    socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
    });

    // Checkpoint: Set up event listeners
    socketInstance.on('user-status', () => {
        // User status received
    });

    socketInstance.on('active-users', () => {
        // Active users list received
    });

    return socketInstance;
};

export const recieveMessage = (eventname, callback) => {
    // Checkpoint: Validate socket instance
    console.log('[SOCKET LISTENER SETUP]', eventname);
    if (!socketInstance) {
        console.error('[SOCKET ERROR] Socket not initialized for receiving');
        return;
    }
    
    // Remove existing listener for this event to prevent duplicates
    socketInstance.off(eventname);
    
    // Add new listener
    socketInstance.on(eventname, (data) => {
        console.log('[SOCKET RECEIVE]', eventname, 'Data:', data);
        callback(data);
    });
};

export const sendMessage = (eventname, data) => {
    // Checkpoint: Validate socket instance
    console.log('[SOCKET SEND]', eventname, 'Data:', data);
    if (!socketInstance) {
        console.error('[SOCKET ERROR] Socket not initialized');
        return;
    }
    socketInstance.emit(eventname, data);
    console.log('[SOCKET SEND COMPLETE]', eventname);
};

// Check if a specific user is connected
export const checkUserStatus = (userId) => {
    // Checkpoint: Validate socket instance
    if (!socketInstance) {
        return;
    }
    socketInstance.emit('check-user-status', userId);
};

// Get list of all active users
export const getActiveUsers = () => {
    // Checkpoint: Validate socket instance
    if (!socketInstance) {
        return;
    }
    socketInstance.emit('get-active-users');
};

// Check if current socket is connected
export const isConnected = () => {
    return socketInstance && socketInstance.connected;
};

// Get current socket ID
export const getSocketId = () => {
    return socketInstance ? socketInstance.id : null;
};

// Disconnect socket
export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
};