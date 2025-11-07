import mongoose, { Schema } from 'mongoose';

const projectSchema = new mongoose.Schema({
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
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
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
        reason: String
    }],
    warningCount: {
        type: Map,
        of: Number,
        default: new Map()
    },
    whiteboardState: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate a random 6-digit code
projectSchema.statics.generateRoomCode = function() {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check if a user is the owner
projectSchema.methods.isOwner = function(userId) {
    return this.owner.toString() === userId.toString();
};

// Check if a user is a participant
projectSchema.methods.isParticipant = function(userId) {
    return this.users.some(u => u.toString() === userId.toString());
};

// Check if a user is removed
projectSchema.methods.isRemoved = function(userId) {
    return this.removedUsers.some(r => r.user.toString() === userId.toString());
};

const Project = mongoose.model('project', projectSchema);

export default Project;