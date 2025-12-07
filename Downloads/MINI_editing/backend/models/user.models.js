import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: false, // Made optional for backward compatibility
        trim: true,
        minLength: [2, 'Name must be at least 2 characters'],
        maxLength: [50, 'Name must be less than 50 characters']
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: [6, 'Email must be at least 6 characters'],
        maxLength: [32, 'Email must be less than 32 characters']
    },

    password: {
        type: String,
        select: false,
    },

    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    }

}, { timestamps: true })

userSchema.statics.hashpassword = async function(password){
    return await bcrypt.hash(password, 10);
}

userSchema.methods.isValidPassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateJWT = function (){
    return jwt.sign({
        id: this._id,
        _id: this._id, // Keep for backward compatibility
        email: this.email,
        name: this.name || this.email.split('@')[0], // Fallback to email username
        role: this.role || 'student'
    }, process.env.JWT_SECRET, {expiresIn: '7d'});
}

const User = mongoose.model('user', userSchema);

export default User;