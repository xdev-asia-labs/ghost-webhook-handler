import bcrypt from 'bcrypt';
import { getUser, createUser } from './db.js';

const SALT_ROUNDS = 10;

/**
 * Hash password
 */
export async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password
 */
export async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

/**
 * Authenticate user
 */
export async function authenticateUser(username, password) {
    const user = await getUser(username);

    if (!user) {
        return null;
    }

    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
        return null;
    }

    return {
        id: user.id,
        username: user.username
    };
}

/**
 * Register new user
 */
export async function registerUser(username, password) {
    // Check if user exists
    const existingUser = await getUser(username);
    if (existingUser) {
        throw new Error('User already exists');
    }

    const passwordHash = await hashPassword(password);
    return createUser(username, passwordHash);
}

/**
 * Middleware to check if user is authenticated
 */
export function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

/**
 * Middleware to check if user is authenticated (for HTML pages)
 */
export function requireAuthPage(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.redirect('/admin/login');
    }
    next();
}
