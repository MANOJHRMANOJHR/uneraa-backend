import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRY = process.env.JWT_EXPIRY!;

export function generateToken(user: any) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.firstName,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY } as SignOptions
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.log('token verification failed', error);
    return null;
  }
}
