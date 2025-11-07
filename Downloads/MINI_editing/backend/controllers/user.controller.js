import userModel from '../models/user.models.js';
import * as userService from '../services/user.services.js';
import { validationResult } from 'express-validator';
import redis from '../services/redis.services.js';

export const createUserController = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log('Registration validation errors:', errors.array());
        return res.status(400).json({
            errors: errors.array()
        })
    }

    try {
        console.log('Creating new user:', req.body.email);
        const user = await userService.createUser(req.body);

        const token = await user.generateJWT();

        // Store token in Redis with error handling
        try {
            await redis.set(token, JSON.stringify(user), 'EX', 60*60*24);
        } catch (redisError) {
            // Continue without Redis caching
            console.log('Redis cache skipped (not connected)');
        }

        console.log('User registered successfully:', req.body.email);

        res.status(201).json({
            user, token
        })
    }

    catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({
            error: error.message
        })
    }
}

export const loginController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log('Login validation errors:', errors.array());
        return res.status(400).json({
            errors: errors.array()
        })
    }

    try {

        const { email, password } = req.body;
        console.log('Login attempt for email:', email);

        if (!password) {
            return res.status(400).json({
                error: 'Password is required'
            })
        }

        const user = await userModel.findOne({ email }).select('+password')

        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({
                error: 'Invalid email or password'
            })
        }

        const isMatch = await user.isValidPassword(password);

        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(400).json({
                error: 'Invalid email or password'
            })
        }

        const token = await user.generateJWT();

        // Store token in Redis with error handling
        try {
            await redis.set(token, JSON.stringify(user), 'EX', 60*60*24);
        } catch (redisError) {
            // Continue without Redis caching
            console.log('Redis cache skipped (not connected)');
        }

        console.log('Login successful for user:', email);

        res.status(200).json({
            user, token
        });


    }
    catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({
            error: err.message
        })
    }
}

export const profileController = async (req, res) => {
    res.status(200).json({user: req.user});
}

export const logoutController = async (req, res) => {

    try{
        const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
        if(!token){
            return res.status(401).json({
                error: 'Unauthorized'
            });
        }

        // Blacklist the token with error handling
        try {
            await redis.set(`blacklist_${token}`, 'logout', 'EX', 60*60*24);
        } catch (redisError) {
            // Continue with logout even if Redis fails
        }

        res.status(200).json({
            message: 'Logged out successfully'
        })
    }
    catch(err){
        res.status(500).json({
            error: err.message
        })
    }
}

export const getAllUserController = async (req, res) => {
    try {

        const loggedInUser = await userModel.findById(req.user._id);

        const allUsers = await userService.getAllUsers(loggedInUser._id);
        
        res.status(200).json({
            allUsers
        })
    }
    catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}