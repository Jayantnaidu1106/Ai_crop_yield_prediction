// Content moderation service for study rooms
// Detects inappropriate content and auto-removes users after warnings

const inappropriateKeywords = [
    // Inappropriate content keywords
    'abuse', 'abusive', 'violence', 'violent', 'hate', 'hatred', 'harassment', 'harass',
    'bullying', 'bully', 'threat', 'threaten', 'threatening',
    'racist', 'racism', 'sexist', 'sexism', 'discriminat', 'offensive', 'explicit',
    'fuck', 'shit', 'damn', 'ass', 'bitch', 'bastard', 'crap', 'hell',
    'stupid', 'idiot', 'moron', 'dumb', 'loser', 'ugly', 'fat',
    'kill', 'die', 'death', 'suicide', 'murder',
    'porn', 'sex', 'nude', 'xxx', 'nsfw',
    'spam', 'scam', 'fraud', 'fake'
];

// Check if message contains inappropriate content
export const containsInappropriateContent = (message) => {
    if (!message || typeof message !== 'string') return false;

    const lowerMessage = message.toLowerCase();
    
    // Check for inappropriate keywords
    for (const keyword of inappropriateKeywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
            return true;
        }
    }

    // Check for excessive caps (possible shouting/harassment)
    const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
    if (message.length > 10 && capsRatio > 0.7) {
        return true;
    }

    // Check for spam (repeated characters)
    if (/(.)\1{10,}/.test(message)) {
        return true;
    }

    return false;
};

// Process warning for a user
export const processWarning = async (project, userId) => {
    try {
        // Get current warning count
        const warningCount = project.warningCount.get(userId.toString()) || 0;
        const newWarningCount = warningCount + 1;

        // Update warning count
        project.warningCount.set(userId.toString(), newWarningCount);

        // If user has 3 warnings, remove them
        if (newWarningCount >= 3) {
            // Remove from users array
            project.users = project.users.filter(
                u => u.toString() !== userId.toString()
            );

            // Add to removed users
            project.removedUsers.push({
                user: userId,
                removedAt: new Date(),
                removedBy: project.owner,
                reason: 'Automatic removal due to inappropriate content (3 warnings)'
            });

            await project.save();
            return { removed: true, warningCount: newWarningCount };
        }

        await project.save();
        return { removed: false, warningCount: newWarningCount };
    } catch (error) {
        console.error('Process warning error:', error);
        throw error;
    }
};

// Get warning count for a user
export const getWarningCount = (project, userId) => {
    return project.warningCount.get(userId.toString()) || 0;
};

// Reset warnings for a user (owner only)
export const resetWarnings = async (project, userId) => {
    try {
        project.warningCount.delete(userId.toString());
        await project.save();
        return true;
    } catch (error) {
        console.error('Reset warnings error:', error);
        return false;
    }
};

// Enhanced AI-based content moderation (optional - requires AI service)
export const aiModerateContent = async (message) => {
    // This can be enhanced with actual AI moderation API like:
    // - OpenAI Moderation API
    // - Perspective API (Google)
    // - Azure Content Moderator
    
    // For now, using keyword-based approach
    return containsInappropriateContent(message);
};
