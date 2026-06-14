const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'farmplus_jwt_secret_key_2024';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function generateToken(phoneNumber) {
  return jwt.sign(
    { phone_number: phoneNumber, iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = { authMiddleware, generateToken };
