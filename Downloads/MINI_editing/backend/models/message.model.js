import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    isAI: {
        type: Boolean,
        default: false
    },
    deletedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    deletedForEveryone: {
        type: Boolean,
        default: false
    },
    edited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    }
});

messageSchema.index({ project: 1, timestamp: -1 });

const Message = mongoose.model('message', messageSchema);

export default Message;
