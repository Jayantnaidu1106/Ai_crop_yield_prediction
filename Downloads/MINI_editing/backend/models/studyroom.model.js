import mongoose from 'mongoose';

const studyRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        length: 6
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    files: [{
        filename: String,
        originalName: String,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        size: Number,
        mimetype: String,
        path: String,
        deletedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }],
        deletedForEveryone: {
            type: Boolean,
            default: false
        }
    }],
    removedUsers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        removedAt: {
            type: Date,
            default: Date.now
        },
        removedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    }],
    warningCount: {
        type: Map,
        of: Number,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate a random 6-digit code
studyRoomSchema.statics.generateRoomCode = function() {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check if a user is the owner
studyRoomSchema.methods.isOwner = function(userId) {
    const ownerId = this.owner._id ? this.owner._id.toString() : this.owner.toString();
    return ownerId === userId.toString();
};

// Check if a user is a participant
studyRoomSchema.methods.isParticipant = function(userId) {
    return this.participants.some(p => {
        const participantId = p.user._id ? p.user._id.toString() : p.user.toString();
        return participantId === userId.toString();
    });
};

// Check if a user is removed
studyRoomSchema.methods.isRemoved = function(userId) {
    return this.removedUsers.some(r => {
        const removedUserId = r.user._id ? r.user._id.toString() : r.user.toString();
        return removedUserId === userId.toString();
    });
};

// Pre-save hook to prevent duplicate participants
studyRoomSchema.pre('save', function(next) {
    if (this.isModified('participants')) {
        // Remove duplicates based on user ID
        const uniqueParticipants = [];
        const seenUsers = new Set();
        
        for (const participant of this.participants) {
            const userId = participant.user.toString();
            if (!seenUsers.has(userId)) {
                seenUsers.add(userId);
                uniqueParticipants.push(participant);
            }
        }
        
        this.participants = uniqueParticipants;
    }
    next();
});

const StudyRoom = mongoose.model('studyroom', studyRoomSchema);

export default StudyRoom;
