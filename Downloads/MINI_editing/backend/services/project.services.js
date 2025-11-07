import projectModel from '../models/project.model.js';
import mongoose from 'mongoose';

export const createProject = async ({
    name, users
}) => {
    if (!name || !users) {
        throw new Error('Name and users are required');
    }

    // Validate users array
    if (!Array.isArray(users)) {
        throw new Error('Users must be an array');
    }

    if (users.length === 0) {
        throw new Error('At least one user ID is required');
    }

    // Validate each user ID in the array
    for (const userId of users) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error(`Invalid user ID format: ${userId}`);
        }
    }

    try {
        const project = await projectModel.create({
            name,
            users
        });
        return project;
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Project with this name already exists');
        }
        throw error;
    }
}

export const getAllProjectByUserId = async (userId) => {
    if (!userId) {
        throw new Error('User ID is required');
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format');
    }

    const allUserProjects = await projectModel.find({
        users: userId
    });

    return allUserProjects;
}

export const addUsersToProject = async ({ projectId, users, userId }) => {

    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!users) {
        throw new Error("users are required")
    }

    if (!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
        throw new Error("Invalid userId(s) in users array")
    }

    if (!userId) {
        throw new Error("userId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId")
    }


    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    });

    if (!project) {
        throw new Error("User not belong to this project")
    }

    const updatedProject = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        $addToSet: {
            users: {
                $each: users
            }
        }
    }, {
        new: true
    });

    return updatedProject;
};

export const getProjectById = async (projectId) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    const project = await projectModel.findById(projectId).populate('users');

    if (!project) {
        throw new Error("Project not found")
    }

    return project;
}
