import mongoose from 'mongoose';

const interviewFeedbackSchema = new mongoose.Schema({
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'interview',
        required: true,
        unique: true
    },
    summary: {
        type: String,
        required: false
    },
    strengths: {
        type: [String],
        default: []
    },
    weaknesses: {
        type: [String],
        default: []
    },
    rating: {
        type: Number,
        min: 0,
        max: 10
    },
    // Detailed metrics
    metrics: {
        technicalKnowledge: {
            score: { type: Number, min: 0, max: 10 },
            feedback: String
        },
        communicationSkills: {
            score: { type: Number, min: 0, max: 10 },
            feedback: String
        },
        problemSolvingApproach: {
            score: { type: Number, min: 0, max: 10 },
            feedback: String
        },
        confidence: {
            score: { type: Number, min: 0, max: 10 },
            feedback: String
        },
        clarityOfAnswers: {
            score: { type: Number, min: 0, max: 10 },
            feedback: String
        },
        depthOfKnowledge: {
            score: { type: Number, min: 0, max: 10 },
            feedback: String
        }
    },
    // Areas for improvement
    recommendations: {
        type: [String],
        default: []
    },
    // Overall impression
    overallImpression: {
        type: String
    }
}, { timestamps: true });

const InterviewFeedback = mongoose.model('interviewFeedback', interviewFeedbackSchema);

export default InterviewFeedback;
