import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authUser } from '../middlewares/auth.middleware.js';
import projectModel from '../models/project.model.js';
import StudyRoom from '../models/studyroom.model.js';

const router = express.Router();

// Helper to extract user id from JWT payload set by auth middleware
const getUserId = (req) => {
    if (!req || !req.user) return null;
    return req.user._id || req.user.userId || req.user.id || null;
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'projects');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const studyRoomUploadsDir = path.join(process.cwd(), 'uploads', 'studyrooms');
if (!fs.existsSync(studyRoomUploadsDir)) {
    fs.mkdirSync(studyRoomUploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Allow common file types
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, documents, and archives are allowed.'));
        }
    }
});

// Upload file to project
router.post('/upload/:projectId', authUser, upload.single('file'), async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = getUserId(req);

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const project = await projectModel.findById(projectId);

        if (!project) {
            // Delete uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if user is a participant
        if (!project.isParticipant(userId) && !project.isOwner(userId)) {
            fs.unlinkSync(req.file.path);
            return res.status(403).json({ error: 'You are not a participant of this project' });
        }

        // Add file info to project
        const fileInfo = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            uploadedBy: userId,
            uploadedAt: new Date(),
            size: req.file.size,
            mimetype: req.file.mimetype,
            path: req.file.path
        };

        project.files.push(fileInfo);
        await project.save();
        await project.populate('files.uploadedBy', 'email');

        res.status(200).json({
            message: 'File uploaded successfully',
            file: fileInfo
        });
    } catch (error) {
        console.error('File upload error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Download file from project
router.get('/download/:projectId/:filename', authUser, async (req, res) => {
    try {
        const { projectId, filename } = req.params;
        const userId = getUserId(req);

        const project = await projectModel.findById(projectId);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if user is a participant
        if (!project.isParticipant(userId) && !project.isOwner(userId)) {
            return res.status(403).json({ error: 'You are not a participant of this project' });
        }

        // Find file
        const fileInfo = project.files.find(f => f.filename === filename);

        if (!fileInfo) {
            return res.status(404).json({ error: 'File not found' });
        }

        const filePath = path.join(uploadsDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on server' });
        }

        res.download(filePath, fileInfo.originalName);
    } catch (error) {
        console.error('File download error:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});

// Get files list for a project
router.get('/list/:projectId', authUser, async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = getUserId(req);

        const project = await projectModel.findById(projectId)
            .populate('files.uploadedBy', 'email');

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if user is a participant
        if (!project.isParticipant(userId) && !project.isOwner(userId)) {
            return res.status(403).json({ error: 'You are not a participant of this project' });
        }

        res.status(200).json({ files: project.files });
    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// Delete file from project (uploader or owner only)
router.delete('/delete/:projectId/:filename', authUser, async (req, res) => {
    try {
        const { projectId, filename } = req.params;
        const userId = getUserId(req);

        const project = await projectModel.findById(projectId);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Find file
        const fileInfo = project.files.find(f => f.filename === filename);

        if (!fileInfo) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Check if user is owner or uploader
        if (!project.isOwner(userId) && fileInfo.uploadedBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'You do not have permission to delete this file' });
        }

        // Delete file from filesystem
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove from database
        project.files = project.files.filter(f => f.filename !== filename);
        await project.save();

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('File delete error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// ===== STUDY ROOM FILE ROUTES =====

// Configure multer for study room files
const studyRoomStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, studyRoomUploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const studyRoomUpload = multer({
    storage: studyRoomStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Allow common file types
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, documents, and archives are allowed.'));
        }
    }
});

// Upload file to study room
router.post('/studyroom/upload/:studyRoomId', authUser, studyRoomUpload.single('file'), async (req, res) => {
    try {
        const { studyRoomId } = req.params;
        const userId = getUserId(req);

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const studyRoom = await StudyRoom.findById(studyRoomId);

        if (!studyRoom) {
            // Delete uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Study room not found' });
        }

        // Check if user is a participant
        if (!studyRoom.isParticipant(userId) && !studyRoom.isOwner(userId)) {
            fs.unlinkSync(req.file.path);
            return res.status(403).json({ error: 'You are not a participant of this study room' });
        }

        // Add file info to study room
        const fileInfo = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            uploadedBy: userId,
            uploadedAt: new Date(),
            size: req.file.size,
            mimetype: req.file.mimetype,
            path: req.file.path
        };

        studyRoom.files.push(fileInfo);
        await studyRoom.save();
        await studyRoom.populate('files.uploadedBy', 'email');

        res.status(200).json({
            message: 'File uploaded successfully',
            file: fileInfo
        });
    } catch (error) {
        console.error('Study room file upload error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Download file from study room
router.get('/studyroom/download/:studyRoomId/:filename', authUser, async (req, res) => {
    try {
        const { studyRoomId, filename } = req.params;
        const userId = getUserId(req);

        const studyRoom = await StudyRoom.findById(studyRoomId);

        if (!studyRoom) {
            return res.status(404).json({ error: 'Study room not found' });
        }

        // Check if user is a participant
        if (!studyRoom.isParticipant(userId) && !studyRoom.isOwner(userId)) {
            return res.status(403).json({ error: 'You are not a participant of this study room' });
        }

        // Find file
        const fileInfo = studyRoom.files.find(f => f.filename === filename);

        if (!fileInfo) {
            return res.status(404).json({ error: 'File not found' });
        }

        const filePath = path.join(studyRoomUploadsDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on server' });
        }

        res.download(filePath, fileInfo.originalName);
    } catch (error) {
        console.error('Study room file download error:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});

// Get files list for a study room
router.get('/studyroom/list/:studyRoomId', authUser, async (req, res) => {
    try {
        const { studyRoomId } = req.params;
        const userId = getUserId(req);

        const studyRoom = await StudyRoom.findById(studyRoomId)
            .populate('files.uploadedBy', 'email');

        if (!studyRoom) {
            return res.status(404).json({ error: 'Study room not found' });
        }

        // Check if user is a participant
        if (!studyRoom.isParticipant(userId) && !studyRoom.isOwner(userId)) {
            return res.status(403).json({ error: 'You are not a participant of this study room' });
        }

        res.status(200).json({ files: studyRoom.files });
    } catch (error) {
        console.error('Get study room files error:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// Delete file from study room - Delete for me (hide) or Delete for everyone (owner/uploader only)
router.post('/studyroom/delete/:studyRoomId/:filename', authUser, async (req, res) => {
    try {
        const { studyRoomId, filename } = req.params;
        const { deleteForEveryone } = req.body;
        const userId = getUserId(req);

        const studyRoom = await StudyRoom.findById(studyRoomId);

        if (!studyRoom) {
            return res.status(404).json({ error: 'Study room not found' });
        }

        // Find file
        const fileInfo = studyRoom.files.find(f => f.filename === filename);

        if (!fileInfo) {
            return res.status(404).json({ error: 'File not found' });
        }

        if (deleteForEveryone) {
            // Only owner or uploader can delete for everyone
            if (!studyRoom.isOwner(userId) && fileInfo.uploadedBy.toString() !== userId.toString()) {
                return res.status(403).json({ error: 'Only the owner or uploader can delete this file for everyone' });
            }

            // Delete file from filesystem
            const filePath = path.join(studyRoomUploadsDir, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // Remove from database
            studyRoom.files = studyRoom.files.filter(f => f.filename !== filename);
            await studyRoom.save();

            res.status(200).json({ message: 'File deleted for everyone' });
        } else {
            // Delete for me - just hide it
            if (!fileInfo.deletedBy) {
                fileInfo.deletedBy = [];
            }
            if (!fileInfo.deletedBy.includes(userId)) {
                fileInfo.deletedBy.push(userId);
            }
            await studyRoom.save();

            res.status(200).json({ message: 'File hidden for you' });
        }
    } catch (error) {
        console.error('Study room file delete error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

export default router;
