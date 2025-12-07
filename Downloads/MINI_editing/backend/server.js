import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import StudyRoom from './models/studyroom.model.js';
import Message from './models/message.model.js';
import { generateResult } from './services/ai.services.js';
import { processWarning, aiModerateContent } from './services/moderation.service.js';

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

        // Checkpoint: Validate project/studyroom if provided
        if(projectId){
            if(!mongoose.Types.ObjectId.isValid(projectId)){
                return next(new Error('Invalid project ID format'));
            }

            // Try to find as project first (backward compatibility)
            let project = await projectModel.findById(projectId);
            
            // Get consistent user ID
            const userId = (decoded._id || decoded.userId || decoded.id);
            const userIdStr = userId?.toString();
            
            if(project){
                // Check if user is removed from project
                if(project.removedUsers && project.removedUsers.some(r => r.user.toString() === userIdStr)){
                    return next(new Error('You have been permanently removed from this room'));
                }
                socket.project = project;
                socket.roomType = 'project';
            } else {
                // Try as study room
                const studyRoom = await StudyRoom.findById(projectId);
                if(studyRoom){
                    // Check if user is removed from study room
                    if(studyRoom.removedUsers && studyRoom.removedUsers.some(r => r.user.toString() === userIdStr)){
                        return next(new Error('You have been permanently removed from this room'));
                    }
                    socket.project = studyRoom;
                    socket.roomType = 'studyroom';
                } else {
                    // If not found as either, allow for backward compatibility
                    socket.project = { _id: projectId };
                    socket.roomType = 'studyroom';
                }
            }
        } else {
            // Allow connection without project for testing
            socket.project = { _id: 'no-project', name: 'No Project' };
            socket.roomType = 'testing';
        }

        next();

    }catch(error){
        next(error);
    }
});

io.on('connection', (socket) => {

    console.log('A User Connected:', socket.user.email || socket.user.userId);

    socket.roomId = socket.project._id.toString();

    // Use consistent user ID (handle both _id and userId from token)
    const userId = socket.user._id || socket.user.userId || socket.user.id;
    
    activeUsers.set(userId, {
        socketId: socket.id,
        userInfo: socket.user,
        projectId: socket.project._id
    });

    socket.join(socket.roomId);
    console.log(`User ${userId} joined room ${socket.roomId}`);

    socket.on('project-message', async (data)=>{

        const message = data.message;

        // Enhanced moderation: Check with AI for better detection
        try {
            const moderationResult = await aiModerateContent(message);
            
            if(moderationResult.inappropriate){
                // Get the room (project or studyroom)
                let room;
                if(socket.roomType === 'project'){
                    room = await projectModel.findById(socket.project._id)
                        .populate('owner', 'email')
                        .populate('users', 'email');
                } else if(socket.roomType === 'studyroom'){
                    room = await StudyRoom.findById(socket.project._id)
                        .populate('owner', 'email')
                        .populate('participants.user', 'email');
                }

                if(room){
                    // Get consistent user ID
                    const userId = (socket.user._id || socket.user.userId || socket.user.id);
                    const result = await processWarning(room, userId);

                    // Notify the user about the warning
                    socket.emit('moderation-warning', {
                        message: `⚠️ Warning: Inappropriate content detected (${moderationResult.reason}). Warning ${result.warningCount}/3`,
                        warningCount: result.warningCount,
                        removed: result.removed
                    });

                    // If user is removed, disconnect them and prevent rejoining
                    if(result.removed){

                        // Remove from active users
                        activeUsers.delete(userId);

                        // Notify the removed user with a specific message
                        socket.emit('permanently-banned', {
                            message: 'You have been permanently removed from this room due to 3 strikes for inappropriate content.',
                            reason: 'Automatic removal - 3 strikes',
                            canRejoin: false
                        });

                        // Notify all other users in the room
                        socket.to(socket.roomId).emit('user-removed', {
                            userId: userId,
                            email: socket.user.email,
                            reason: 'Automatic removal due to inappropriate content (3 strikes)',
                            permanent: true
                        });

                        // Broadcast updated participant list
                        if(socket.roomType === 'studyroom'){
                            // Refresh room from database to get updated participants
                            const updatedRoom = await StudyRoom.findById(socket.project._id)
                                .populate('participants.user', 'email name');
                            
                            if(updatedRoom){
                                io.to(socket.roomId).emit('participants-updated', {
                                    participants: updatedRoom.participants
                                });
                            }
                        } else if(socket.roomType === 'project'){
                            // Also update for projects
                            const updatedProject = await projectModel.findById(socket.project._id)
                                .populate('users', 'email name');
                            
                            if(updatedProject){
                                io.to(socket.roomId).emit('participants-updated', {
                                    participants: updatedProject.users
                                });
                            }
                        }

                        // Wait a moment to ensure messages are sent before disconnect
                        setTimeout(() => {
                            socket.disconnect(true);
                        }, 500);
                        return;
                    }
                }

                // Don't broadcast the inappropriate message
                return;
            }
        } catch (error) {
            console.error('Moderation error:', error);
            // Continue with message if moderation fails
        }

        const aiIsPresentInMessage = message.includes('@ai');

        if(aiIsPresentInMessage){
            const prompt = message.replace('@ai','').trim();
            
            const result = await generateResult(prompt, 'STUDY_ROOM');
            
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

    // Edit message
    socket.on('edit-message', async (data) => {
        try {
            const { messageId, newMessage } = data;
            const userId = socket.user._id || socket.user.userId || socket.user.id;
            
            // Find the message and verify ownership
            const message = await Message.findById(messageId);
            if (!message) {
                return socket.emit('error', { message: 'Message not found' });
            }
            
            // Check if user owns the message
            if (message.sender.toString() !== userId.toString()) {
                return socket.emit('error', { message: 'You can only edit your own messages' });
            }
            
            // Update the message
            await Message.findByIdAndUpdate(messageId, {
                message: newMessage,
                edited: true,
                editedAt: new Date()
            });
            
            // Broadcast to all users in the room
            io.to(socket.roomId).emit('message-edited', { 
                messageId, 
                newMessage,
                edited: true
            });
        } catch (error) {
            console.error('Error editing message:', error);
            socket.emit('error', { message: 'Failed to edit message' });
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
        const userId = socket.user._id || socket.user.userId || socket.user.id;
        console.log('A User Disconnected:', userId);
        activeUsers.delete(userId);
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