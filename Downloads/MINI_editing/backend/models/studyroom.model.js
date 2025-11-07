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
            ref: 'user'
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
        path: String
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
    return this.owner.toString() === userId.toString();
};

// Check if a user is a participant
studyRoomSchema.methods.isParticipant = function(userId) {
    return this.participants.some(p => p.user.toString() === userId.toString());
};

// Check if a user is removed
studyRoomSchema.methods.isRemoved = function(userId) {
    return this.removedUsers.some(r => r.user.toString() === userId.toString());
};

const StudyRoom = mongoose.model('studyroom', studyRoomSchema);

export default StudyRoom;
