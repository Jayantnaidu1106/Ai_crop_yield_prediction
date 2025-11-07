import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import Message from './models/message.model.js';
import { generateResult } from './services/ai.services.js';
import { containsInappropriateContent, processWarning } from './services/moderation.service.js';

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const server = http.createServer(app);

const io = new Server(server,{
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Track active users
const activeUsers = new Map();

// Track whiteboard state per project
const whiteboardState = new Map();

io.use(async (socket,next)=>{
    try{
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
        const projectId = socket.handshake.headers?.projectid || socket.handshake.query?.projectId || socket.handshake.auth?.projectId;

        // Checkpoint: Validate token
        if(!token){
            return next(new Error('Unauthorized - No token provided'));
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return next(new Error('Unauthorized - Invalid token'));
        }
        socket.user = decoded;

        // Checkpoint: Validate project if provided
        if(projectId){
            if(!mongoose.Types.ObjectId.isValid(projectId)){
                return next(new Error('Invalid project ID format'));
            }

            socket.project = await projectModel.findById(projectId);
            if(!socket.project){
                return next(new Error('Project not found'));
            }
        } else {
            // Allow connection without project for testing
            socket.project = { _id: 'no-project', name: 'No Project' };
        }

        next();

    }catch(error){
        next(error);
    }
});

io.on('connection', (socket) => {

    console.log('A User Connected');

    socket.roomId = socket.project._id.toString();

    activeUsers.set(socket.user.userId, {
        socketId: socket.id,
        userInfo: socket.user,
        projectId: socket.project._id
    });

    socket.join(socket.roomId);

    socket.on('project-message', async (data)=>{

        const message = data.message;

        // Check for inappropriate content
        if(containsInappropriateContent(message)){
            try {
                const project = await projectModel.findById(socket.project._id)
                    .populate('owner', 'email')
                    .populate('users', 'email');

                const result = await processWarning(project, socket.user._id || socket.user.userId);

                // Notify the user about the warning
                socket.emit('moderation-warning', {
                    message: `⚠️ Warning: Inappropriate content detected. Warning ${result.warningCount}/3`,
                    warningCount: result.warningCount,
                    removed: result.removed
                });

                // If user is removed, disconnect them
                if(result.removed){
                    // Remove user from project.users array in database
                    const userId = socket.user._id || socket.user.userId;
                    project.users = project.users.filter(u => u._id.toString() !== userId.toString());
                    await project.save();

                    // Notify all users in the room
                    io.to(socket.roomId).emit('user-removed', {
                        userId: userId,
                        email: socket.user.email,
                        reason: 'Automatic removal due to inappropriate content'
                    });

                    // Disconnect the user's socket
                    socket.disconnect();
                    return;
                }

                // Don't broadcast the inappropriate message
                return;
            } catch (error) {
                console.error('Moderation error:', error);
            }
        }

        const aiIsPresentInMessage = message.includes('@ai');

        if(aiIsPresentInMessage){
            const prompt = message.replace('@ai','').trim();
            
            const result = await generateResult(prompt);
            
            // Save AI message to database
            const aiMessage = new Message({
                project: socket.project._id,
                sender: socket.user._id || socket.user.userId,
                message: result,
                isAI: true,
                timestamp: new Date()
            });
            await aiMessage.save();
            
            io.to(socket.roomId).emit('project-message',{
                _id: aiMessage._id,
                message: result,
                sender: 'ai',
                timestamp: aiMessage.timestamp,
                user: {name:'AI', email:'ai@example.com'},
                projectId: socket.project._id
            });
            return;
        }

        // Save regular message to database
        try {
            const newMessage = new Message({
                project: socket.project._id,
                sender: data.sender,
                message: data.message,
                timestamp: data.timestamp || new Date()
            });
            await newMessage.save();
            
            // Emit message with database ID
            io.to(socket.roomId).emit('project-message', {
                ...data,
                _id: newMessage._id
            });
        } catch (error) {
            console.error('Error saving message:', error);
            io.to(socket.roomId).emit('project-message', data);
        }
    });
    
    // Delete message for me
    socket.on('delete-message-for-me', async (data) => {
        try {
            const { messageId } = data;
            const userId = socket.user._id || socket.user.userId;
            
            await Message.findByIdAndUpdate(messageId, {
                $addToSet: { deletedBy: userId }
            });
            
            socket.emit('message-deleted-for-me', { messageId });
        } catch (error) {
            console.error('Error deleting message for user:', error);
        }
    });

    // Delete message for everyone
    socket.on('delete-message-for-everyone', async (data) => {
        try {
            const { messageId } = data;
            
            await Message.findByIdAndUpdate(messageId, {
                deletedForEveryone: true
            });
            
            io.to(socket.roomId).emit('message-deleted-for-everyone', { messageId });
        } catch (error) {
            console.error('Error deleting message for everyone:', error);
        }
    });

    // Clear all chat for me
    socket.on('clear-all-chat-for-me', async () => {
        try {
            const userId = socket.user._id || socket.user.userId;
            const projectId = socket.project._id;
            
            await Message.updateMany(
                { project: projectId },
                { $addToSet: { deletedBy: userId } }
            );
            
            socket.emit('all-chat-cleared-for-me');
        } catch (error) {
            console.error('Error clearing all chat:', error);
        }
    });

    // Save whiteboard state
    socket.on('save-whiteboard', async (data) => {
        try {
            const { whiteboardData } = data;
            await projectModel.findByIdAndUpdate(socket.project._id, {
                whiteboardState: whiteboardData
            });
        } catch (error) {
            console.error('Error saving whiteboard:', error);
        }
    });

    // Broadcast whiteboard changes to others
    socket.on('whiteboard-update', (data) => {
        socket.to(socket.roomId).emit('whiteboard-update', data);
    });

    socket.on('disconnect', () => {
        console.log('A User Disconnected');
        activeUsers.delete(socket.user.userId);
    });


    socket.on('check-user-status', (userId) => {
        const isConnected = activeUsers.has(userId);
        socket.emit('user-status', { userId, isConnected });
    });


    socket.on('get-active-users', () => {
        const users = Array.from(activeUsers.values()).map(user => ({
            userId: user.userInfo.userId,
            email: user.userInfo.email,
            projectId: user.projectId,
            connectedAt: user.connectedAt
        }));
        socket.emit('active-users', users);
    });

    // Whiteboard Events
    socket.on('whiteboard:request-init', (data) => {
        const projectId = data.projectId || socket.roomId;
        const history = whiteboardState.get(projectId) || [];
        console.log(`Sending whiteboard init to user. Project: ${projectId}, History items: ${history.length}`);
        socket.emit('whiteboard:init', { history });
    });

    socket.on('whiteboard:draw', (data) => {
        if (!data || !data.points) return;
        
        console.log(`Whiteboard draw from user ${data.userId}, points: ${data.points.length}`);
        
        // Store in whiteboard history
        const projectId = data.projectId || socket.roomId;
        const history = whiteboardState.get(projectId) || [];
        history.push(data);
        
        // Limit history to last 1000 actions to prevent memory issues
        if (history.length > 1000) {
            history.shift();
        }
        
        whiteboardState.set(projectId, history);
        
        // Broadcast to ALL users in the room (including sender for sync)
        console.log(`Broadcasting draw to room ${socket.roomId}`);
        io.to(socket.roomId).emit('whiteboard:draw', data);
    });

    socket.on('whiteboard:clear', (data) => {
        const projectId = data.projectId || socket.roomId;
        console.log(`Clearing whiteboard for project ${projectId}`);
        whiteboardState.set(projectId, []);
        // Broadcast to ALL users
        io.to(socket.roomId).emit('whiteboard:clear', data);
    });

    socket.on('whiteboard:undo', (data) => {
        const projectId = data.projectId || socket.roomId;
        const history = whiteboardState.get(projectId) || [];
        
        if (history.length > 0) {
            history.pop();
            whiteboardState.set(projectId, history);
            console.log(`Undo whiteboard action. Remaining: ${history.length}`);
        }
        
        // Broadcast to ALL users
        io.to(socket.roomId).emit('whiteboard:undo', data);
    });

    socket.on('whiteboard:cursor', (data) => {
        // Broadcast cursor position to other users (don't need to send to self)
        socket.broadcast.to(socket.roomId).emit('whiteboard:cursor', data);
    });

    // Study Room specific events
    socket.on('kick-user', async (data) => {
        if(socket.roomType !== 'studyroom') return;

        try {
            const { userId: targetUserId } = data;
            
            const studyRoom = await StudyRoom.findById(socket.studyRoom._id);
            
            // Only owner can kick users
            if(!studyRoom.isOwner(socket.user.userId)){
                socket.emit('error', { message: 'Only the room owner can remove participants' });
                return;
            }

            // Remove participant
            studyRoom.participants = studyRoom.participants.filter(
                p => p.user.toString() !== targetUserId.toString()
            );

            // Add to removed users
            studyRoom.removedUsers.push({
                user: targetUserId,
                removedAt: new Date(),
                removedBy: socket.user.userId
            });

            await studyRoom.save();

            // Notify the room
            io.to(socket.roomId).emit('user-kicked', {
                userId: targetUserId,
                kickedBy: socket.user.userId
            });

            // Disconnect the kicked user
            const kickedUserData = activeUsers.get(targetUserId);
            if(kickedUserData){
                io.sockets.sockets.get(kickedUserData.socketId)?.disconnect();
            }
        } catch (error) {
            console.error('Kick user error:', error);
            socket.emit('error', { message: 'Failed to remove user' });
        }
    });

    socket.on('file-uploaded', (data) => {
        // Broadcast file upload notification to room
        socket.broadcast.to(socket.roomId).emit('file-uploaded', data);
    });

    socket.on('file-deleted', (data) => {
        // Broadcast file deletion notification to room
        socket.broadcast.to(socket.roomId).emit('file-deleted', data);
    });
});

// Utility function to check if user is connected (can be used in routes)
export const isUserConnected = (userId) => {
    return activeUsers.has(userId);
};

// Utility function to get all active users (can be used in routes)
export const getActiveUsers = () => {
    return Array.from(activeUsers.values()).map(user => ({
        userId: user.userInfo.userId,
        email: user.userInfo.email,
        projectId: user.projectId,
        connectedAt: user.connectedAt
    }));
};

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});