import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.services.js';
import { validationResult } from 'express-validator';
import userModel from '../models/user.models.js';

export const createProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const { name, isPrivate } = req.body;

    try {
        const loggedInUser = await userModel.findById(req.user._id);
        
        // Generate unique 6-digit code
        let code;
        let isUnique = false;
        while (!isUnique) {
            code = projectModel.generateRoomCode();
            const existing = await projectModel.findOne({ code });
            if (!existing) isUnique = true;
        }

        const newProject = new projectModel({
            name: name.trim(),
            code,
            isPrivate: isPrivate || false,
            owner: loggedInUser._id,
            users: [loggedInUser._id]
        });

        await newProject.save();
        await newProject.populate('owner', 'email');
        await newProject.populate('users', 'email');

        res.status(201).json({
            message: 'Project created successfully',
            newProject: newProject
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({
            error: error.message
        });
    }
}

export const getAllProjects = async (req, res) => {
    try {
        const loggedInUser = await userModel.findById(req.user._id);

        const allUserProjects = await projectService.getAllProjectByUserId(loggedInUser._id);

        res.status(200).json({
            allUserProjects
        });
    }
    catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, users } = req.body

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })


        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        })

        return res.status(200).json({
            project,
        })

    } catch (err) {
        res.status(400).json({ error: err.message });
    }


}

export const getProjectById = async (req,res) => {
    const {projectId}  = req.params;

    try {
        const project = await projectModel.findById(projectId)
            .populate('owner', 'email')
            .populate('users', 'email');

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if user has access
        const userId = req.user._id.toString();
        
        // Check if user is removed from the project
        const isRemoved = project.removedUsers && project.removedUsers.some(r => 
            r.user.toString() === userId
        );
        
        if (isRemoved) {
            return res.status(403).json({ error: 'You have been removed from this project', removed: true });
        }
        
        const ownerId = project.owner._id ? project.owner._id.toString() : project.owner.toString();
        const isOwner = userId === ownerId;
        const isParticipant = project.users.some(u => {
            const participantId = u._id ? u._id.toString() : u.toString();
            return participantId === userId;
        });

        if (project.isPrivate && !isParticipant && !isOwner) {
            return res.status(403).json({ error: 'You do not have access to this project' });
        }

        res.status(200).json({
            project
        });
    } catch(err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// Get all public projects
export const getPublicProjects = async (req, res) => {
    try {
        const projects = await projectModel.find({ isPrivate: false })
            .populate('owner', 'email')
            .populate('users', 'email')
            .sort({ createdAt: -1 });

        res.status(200).json({ projects });
    } catch (error) {
        console.error('Get public projects error:', error);
        res.status(500).json({ error: 'Failed to fetch public projects' });
    }
};

// Join project by code (for private projects)
export const joinProjectByCode = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user._id;

        if (!code || code.length !== 6) {
            return res.status(400).json({ error: '6-digit code is required' });
        }

        const project = await projectModel.findOne({ code })
            .populate('owner', 'email')
            .populate('users', 'email');

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if user is removed
        if (project.isRemoved(userId)) {
            return res.status(403).json({ error: 'You have been removed from this project' });
        }

        // Check if already a participant
        if (project.isParticipant(userId) || project.isOwner(userId)) {
            return res.status(200).json({
                message: 'You are already in this project',
                project
            });
        }

        // Add user to project
        project.users.push(userId);
        await project.save();
        await project.populate('users', 'email');

        res.status(200).json({
            message: 'Successfully joined project',
            project
        });
    } catch (error) {
        console.error('Join project error:', error);
        res.status(500).json({ error: 'Failed to join project' });
    }
};

// Join project by ID (for public projects)
export const joinProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const project = await projectModel.findById(id)
            .populate('owner', 'email')
            .populate('users', 'email');

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if user is removed
        if (project.isRemoved(userId)) {
            return res.status(403).json({ error: 'You have been removed from this project' });
        }

        // Check if already a participant
        if (project.isParticipant(userId) || project.isOwner(userId)) {
            return res.status(200).json({
                message: 'You are already in this project',
                project,
                alreadyJoined: true
            });
        }

        // Add user to project
        project.users.push(userId);
        await project.save();
        await project.populate('users', 'email');

        res.status(200).json({
            message: 'Successfully joined project',
            project,
            alreadyJoined: false
        });
    } catch (error) {
        console.error('Join project by ID error:', error);
        res.status(500).json({ error: 'Failed to join project' });
    }
};

// Remove user from project (owner only)
export const removeUserFromProject = async (req, res) => {
    try {
        const { projectId, userId } = req.body;
        const requesterId = req.user._id.toString();

        const project = await projectModel.findById(projectId)
            .populate('owner', 'email')
            .populate('users', 'email');

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if requester is the owner
        const ownerId = project.owner._id ? project.owner._id.toString() : project.owner.toString();
        if (requesterId !== ownerId) {
            return res.status(403).json({ error: 'Only the owner can remove users' });
        }

        // Cannot remove owner
        const userToRemoveId = userId.toString();
        if (userToRemoveId === ownerId) {
            return res.status(400).json({ error: 'Cannot remove the project owner' });
        }

        // Remove user from participants
        project.users = project.users.filter(u => {
            const participantId = u._id ? u._id.toString() : u.toString();
            return participantId !== userToRemoveId;
        });
        
        // Add to removed users list
        project.removedUsers.push({
            user: userId,
            removedAt: new Date(),
            reason: 'Removed by owner'
        });

        await project.save();
        await project.populate('users', 'email');

        res.status(200).json({
            message: 'User removed successfully',
            project
        });
    } catch (error) {
        console.error('Remove user error:', error);
        res.status(500).json({ error: 'Failed to remove user' });
    }
};

// Leave project
export const leaveProject = async (req, res) => {
    try {
        const { projectId } = req.body;
        const userId = req.user._id.toString();

        const project = await projectModel.findById(projectId);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Cannot leave if you're the owner
        const ownerId = project.owner.toString();
        if (userId === ownerId) {
            return res.status(400).json({ error: 'Owner cannot leave the project. Delete it instead.' });
        }

        // Remove user
        project.users = project.users.filter(u => u.toString() !== userId);
        await project.save();

        res.status(200).json({ message: 'Left project successfully' });
    } catch (error) {
        console.error('Leave project error:', error);
        res.status(500).json({ error: 'Failed to leave project' });
    }
};

// Delete project (owner only)
export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id.toString();

        const project = await projectModel.findById(id);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if requester is the owner
        const ownerId = project.owner.toString();
        if (userId !== ownerId) {
            return res.status(403).json({ error: 'Only the owner can delete the project' });
        }

        await projectModel.findByIdAndDelete(id);

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
};
