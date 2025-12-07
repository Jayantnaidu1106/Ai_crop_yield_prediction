import mongoose from 'mongoose';

const interviewTurnSchema = new mongoose.Schema({
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'interview',
        required: true
    },
    speaker: {
        type: String,
        enum: ['user', 'ai'],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const InterviewTurn = mongoose.model('interviewTurn', interviewTurnSchema);

export default InterviewTurn;
