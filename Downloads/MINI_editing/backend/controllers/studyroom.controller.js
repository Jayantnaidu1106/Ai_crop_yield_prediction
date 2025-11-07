import StudyRoom from '../models/studyroom.model.js';
import User from '../models/user.models.js';

// Helper to robustly extract user id from auth middleware / JWT
const getUserId = (req) => {
    if (!req || !req.user) return null;
    const u = req.user;
    // token payload may contain _id, id, userId, or nested _doc
    const candidates = [u._id, u.userId, u.id, u._doc && u._doc._id, u._doc && u._doc.id];
    for (const c of candidates) {
        if (c) {
            try {
                // If it's an object (like ObjectId), convert to string
                if (typeof c === 'object' && c.toString) return c.toString();
            } catch (e) {
                return c; // fallback
            }
            return c;
        }
    }
    return null;
};

// Create a new study room
export const createStudyRoom = async (req, res) => {
    try {
    const { name, isPrivate } = req.body;
    // debug: show decoded token payload when creating room
    console.debug('createStudyRoom - req.user:', req.user);
    const ownerId = getUserId(req);
    console.debug('createStudyRoom - resolved ownerId:', ownerId);

        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Study room name is required' });
        }

        // Generate unique room code
        let code;
        let isUnique = false;
        while (!isUnique) {
            code = StudyRoom.generateRoomCode();
            const existing = await StudyRoom.findOne({ code });
            if (!existing) isUnique = true;
        }

        const studyRoom = new StudyRoom({
            name: name.trim(),
            code,
            isPrivate: isPrivate || false,
            owner: ownerId,
            participants: [{ user: ownerId, joinedAt: new Date() }]
        });

        await studyRoom.save();
        await studyRoom.populate('owner', 'email');
        await studyRoom.populate('participants.user', 'email');

        res.status(201).json({
            message: 'Study room created successfully',
            studyRoom
        });
    } catch (error) {
        console.error('Create study room error:', error);
        res.status(500).json({ error: 'Failed to create study room' });
    }
};

// Get all public study rooms
export const getPublicStudyRooms = async (req, res) => {
    try {
        const rooms = await StudyRoom.find({ isPrivate: false })
            .populate('owner', 'email')
            .populate('participants.user', 'email')
            .sort({ createdAt: -1 });

        res.status(200).json({ studyRooms: rooms });
    } catch (error) {
        console.error('Get public study rooms error:', error);
        res.status(500).json({ error: 'Failed to fetch study rooms' });
    }
};

// Get user's study rooms (as owner or participant)
export const getUserStudyRooms = async (req, res) => {
    try {
    const userId = getUserId(req);

        const rooms = await StudyRoom.find({
            $or: [
                { owner: userId },
                { 'participants.user': userId }
            ]
        })
            .populate('owner', 'email')
            .populate('participants.user', 'email')
            .sort({ createdAt: -1 });

        res.status(200).json({ studyRooms: rooms });
    } catch (error) {
        console.error('Get user study rooms error:', error);
        res.status(500).json({ error: 'Failed to fetch your study rooms' });
    }
};

// Join a study room by code (for private rooms)
export const joinStudyRoom = async (req, res) => {
    try {
        const { code, roomCode } = req.body;
    const userId = getUserId(req);
        const finalCode = code || roomCode;

        if (!finalCode) {
            return res.status(400).json({ error: 'Room code is required' });
        }

        const studyRoom = await StudyRoom.findOne({ code: finalCode })
            .populate('owner', 'email')
            .populate('participants.user', 'email');

        if (!studyRoom) {
            return res.status(404).json({ error: 'Study room not found' });
        }

        // Check if user is removed
        if (studyRoom.isRemoved(userId)) {
            return res.status(403).json({ error: 'You have been removed from this room' });
        }

        // Check if already a participant
        if (studyRoom.isParticipant(userId)) {
            return res.status(200).json({
                message: 'You are already in this study room',
                studyRoom
            });
        }

        // Add user to participants
        studyRoom.participants.push({ user: userId, joinedAt: new Date() });
        await studyRoom.save();
        await studyRoom.populate('participants.user', 'email');

        res.status(200).json({
            message: 'Successfully joined study room',
            studyRoom
        });
    } catch (error) {
        console.error('Join study room error:', error);
        res.status(500).json({ error: 'Failed to join study room' });
    }
};

// Join a study room by ID (for public rooms or direct links)
export const joinStudyRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);

        const studyRoom = await StudyRoom.findById(id)
            .populate('owner', 'email')
            .populate('participants.user', 'email');

        if (!studyRoom) {
            return res.status(404).json({ error: 'Study room not found' });
        }

        // Check if user is removed
        if (studyRoom.isRemoved(userId)) {
            return res.status(403).json({ error: 'You have been removed from this room' });
        }

        // Check if already a participant or owner
        if (studyRoom.isParticipant(userId) || studyRoom.isOwner(userId)) {
            // Clean up any duplicate participants before returning
            const uniqueParticipants = [];
            const seenUsers = new Set();
            
            for (const participant of studyRoom.participants) {
                const participantId = participant.user._id.toString();
                if (!seenUsers.has(participantId)) {
                    seenUsers.add(participantId);
                    uniqueParticipants.push(participant);
                }
            }
            
            // Only save if we removed duplicates
            if (uniqueParticipants.length !== studyRoom.participants.length) {
                console.log(`Cleaned up ${studyRoom.participants.length - uniqueParticipants.length} duplicate participants`);
                studyRoom.participants = uniqueParticipants;
                await studyRoom.save();
                await studyRoom.populate('participants.user', 'email');
            }
            
            return res.status(200).json({
                message: 'You are already in this study room',
                studyRoom,
                alreadyJoined: true
            });
        }

        // Add user to participants
        studyRoom.participants.push({ user: userId, joinedAt: new Date() });
        await studyRoom.save();
        await studyRoom.populate('participants.user', 'email');

        res.status(200).json({
            message: 'Successfully joined study room',
            studyRoom,
            alreadyJoined: false
        });
    } catch (error) {
        console.error('Join study room by ID error:', error);
        res.status(500).json({ error: 'Failed to join study room' });
    }
};

// Get study room by ID
export const getStudyRoomById = async (req, res) => {
    try {
        const { id } = req.params;
    const userId = getUserId(req);

        const studyRoom = await StudyRoom.findById(id)
            .populate('owner', 'email')
            .populate('participants.user', 'email')
            .populate('files.uploadedBy', 'email');

        if (!studyRoom) {
            return res.status(404).json({ error: 'Study room not found' });
        }

        // Check if user has access
        if (studyRoom.isPrivate && !studyRoom.isParticipant(userId) && !studyRoom.isOwner(userId)) {
            return res.status(403).json({ error: 'You do not have access to this study room' });
        }

        res.status(200).json({ studyRoom });
    } catch (error) {
        console.error('Get study room error:', error);
        res.status(500).json({ error: 'Failed to fetch study room' });
    }
};

// Remove participant from study room (owner only)
export const removeParticipant = async (req, res) => {
    try {
        const { roomId, userId: participantId } = req.body;
    const ownerId = getUserId(req);

        const studyRoom = await StudyRoom.findById(roomId);

        if (!studyRoom) {
            return res.status(404).json({ error: 'Study room not found' });
        }

        if (!studyRoom.isOwner(ownerId)) {
            return res.status(403).json({ error: 'Only the room owner can remove participants' });
        }

        if (participantId === ownerId) {
            return res.status(400).json({ error: 'Owner cannot remove themselves' });
        }

        // Remove from participants
        studyRoom.participants = studyRoom.participants.filter(
            p => p.user.toString() !== participantId.toString()
        );

        // Add to removed users
        studyRoom.removedUsers.push({
            user: participantId,
            removedAt: new Date(),
            removedBy: ownerId
        });

        await studyRoom.save();

        res.status(200).json({
            message: 'Participant removed successfully',
            removedUserId: participantId
        });
    } catch (error) {
        console.error('Remove participant error:', error);
        res.status(500).json({ error: 'Failed to remove participant' });
    }
};

// Leave study room
export const leaveStudyRoom = async (req, res) => {
    try {
        const { roomId } = req.body;
    const userId = getUserId(req);

        const studyRoom = await StudyRoom.findById(roomId);

        if (!studyRoom) {
            return res.status(404).json({ error: 'Study room not found' });
        }

        if (studyRoom.isOwner(userId)) {
            return res.status(400).json({ error: 'Owner cannot leave the room. Delete the room instead.' });
        }

        // Remove from participants
        studyRoom.participants = studyRoom.participants.filter(
            p => p.user.toString() !== userId.toString()
        );

        await studyRoom.save();

        res.status(200).json({ message: 'Successfully left the study room' });
    } catch (error) {
        console.error('Leave study room error:', error);
        res.status(500).json({ error: 'Failed to leave study room' });
    }
};

// Delete study room (owner only)
export const deleteStudyRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);

        const studyRoom = await StudyRoom.findById(id);

        if (!studyRoom) {
            return res.status(404).json({ error: 'Study room not found' });
        }

        if (!studyRoom.isOwner(userId)) {
            return res.status(403).json({ error: 'Only the room owner can delete the room' });
        }

        await StudyRoom.findByIdAndDelete(id);

        res.status(200).json({ message: 'Study room deleted successfully' });
    } catch (error) {
        console.error('Delete study room error:', error);
        res.status(500).json({ error: 'Failed to delete study room' });
    }
};
