import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    jobRole: {
        type: String,
        required: false,
        trim: true
    },
    sourceType: {
        type: String,
        enum: ['resume', 'jd'],
        required: true
    },
    resumeUrl: {
        type: String,
        required: false,
        trim: true
    },
    jobDescription: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'ready', 'completed'],
        default: 'pending'
    }
}, { timestamps: true });

// Optional questions array (appended to keep existing schema intact)
interviewSchema.add({
    questions: {
        type: [String],
        default: []
    }
});

const Interview = mongoose.model('interview', interviewSchema);

export default Interview;
