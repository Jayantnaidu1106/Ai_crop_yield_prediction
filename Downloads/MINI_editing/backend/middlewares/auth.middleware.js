import jwt from 'jsonwebtoken';
import redis from '../services/redis.services.js';

export const authUser = async (req,res,next) =>{
    try{
        const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

        if(!token){
            return res.status(401).json({
                error: 'Unauthorized'
            });
        }

        // Check if token is blacklisted with Redis error handling
        try {
            const isBlackListed = await redis.get(`blacklist_${token}`);
            if(isBlackListed){
                res.cookie('token', '');
                return res.status(401).json({
                    error: 'Unauthorized'
                });
            }
        } catch (redisError) {
            // Continue without blacklist check if Redis is down
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();

    }
    catch(err){
        res.status(401).json({error: 'Unauthorized'});
    }
}