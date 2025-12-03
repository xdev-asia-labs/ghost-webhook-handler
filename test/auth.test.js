const assert = require('assert');
const bcrypt = require('bcrypt');
const auth = require('../auth');

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
    it('should return false for non-existent user', async () => {
      const result = await auth.authenticateUser('nonexistent', 'password');
      assert.strictEqual(result, false);
    });

    it('should return false for wrong password', async () => {
      // Assuming there's a test user in database
      const result = await auth.authenticateUser('admin', 'wrongpassword');
      assert.strictEqual(result, false);
    });
  });

  describe('requireAuth middleware', () => {
    it('should redirect to login if not authenticated', () => {
      const req = { session: {} };
      const res = {
        redirected: false,
        redirect(url) {
          this.redirected = true;
          this.redirectUrl = url;
        }
      };
      const next = () => {};

      auth.requireAuth(req, res, next);
      
      assert.strictEqual(res.redirected, true);
      assert.strictEqual(res.redirectUrl, '/admin/login');
    });

    it('should call next if authenticated', () => {
      const req = { session: { userId: 1 } };
      const res = {};
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      auth.requireAuth(req, res, next);
      
      assert.strictEqual(nextCalled, true);
    });
  });
});
