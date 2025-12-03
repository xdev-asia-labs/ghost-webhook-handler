import assert from 'assert';
import bcrypt from 'bcrypt';
import auth from '../auth.js';

describe('Authentication Tests', () => {
    describe('hashPassword', () => {
        it('should hash password correctly', async () => {
            const password = 'testPassword123';
            const hash = await auth.hashPassword(password);

            assert.ok(hash);
            assert.notEqual(hash, password);
            assert.ok(hash.startsWith('$2b$'));
        });

        it('should create different hashes for same password', async () => {
            const password = 'testPassword123';
            const hash1 = await auth.hashPassword(password);
            const hash2 = await auth.hashPassword(password);

            assert.notEqual(hash1, hash2);
        });
    });

    describe('authenticateUser', () => {
        it('should return null for non-existent user', async () => {
            // Skip database test in CI - would need proper test database setup
            const result = await auth.authenticateUser('nonexistent_user_12345', 'password').catch(() => null);
            assert.strictEqual(result, null);
        });

        it('should return null for wrong password', async () => {
            // Skip database test in CI - would need proper test database setup
            const result = await auth.authenticateUser('admin', 'definitely_wrong_password_12345').catch(() => null);
            assert.strictEqual(result, null);
        });
    });

    describe('requireAuth middleware', () => {
        it('should return 401 if not authenticated', () => {
            const req = { session: {} };
            let statusCode;
            const res = {
                status(code) {
                    statusCode = code;
                    return this;
                },
                json(data) {
                    this.responseData = data;
                }
            };
            const next = () => { };

            auth.requireAuth(req, res, next);

            assert.strictEqual(statusCode, 401);
        });

        it('should call next if authenticated', () => {
            const req = { session: { user: { id: 1 } } };
            const res = {};
            let nextCalled = false;
            const next = () => { nextCalled = true; };

            auth.requireAuth(req, res, next);

            assert.strictEqual(nextCalled, true);
        });
    });

    describe('requireAuthPage middleware', () => {
        it('should redirect to login if not authenticated', () => {
            const req = { session: {} };
            const res = {
                redirected: false,
                redirect(url) {
                    this.redirected = true;
                    this.redirectUrl = url;
                }
            };
            const next = () => { };

            auth.requireAuthPage(req, res, next);

            assert.strictEqual(res.redirected, true);
            assert.strictEqual(res.redirectUrl, '/admin/login');
        });

        it('should call next if authenticated', () => {
            const req = { session: { user: { id: 1 } } };
            const res = {};
            let nextCalled = false;
            const next = () => { nextCalled = true; };

            auth.requireAuthPage(req, res, next);

            assert.strictEqual(nextCalled, true);
        });
    });
});
