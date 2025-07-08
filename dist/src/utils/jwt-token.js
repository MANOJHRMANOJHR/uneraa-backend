import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY;
export function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        name: user.firstName,
    }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
        console.log('token verification failed');
        return null;
    }
}
