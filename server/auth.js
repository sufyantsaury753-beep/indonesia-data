/**
 * Authentication Module for Nusantara DataLens
 * Handles Session tokens, login, and credential management
 */

const crypto = require('node:crypto');
const Database = require('./database.js');

// In-memory session store (token -> { userId, username, role, expiresAt })
const sessions = new Map();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function createSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const sessionData = {
    userId: user.id,
    username: user.username,
    role: user.role || 'admin',
    expiresAt
  };
  sessions.set(token, sessionData);
  return { token, ...sessionData };
}

function getSession(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

function deleteSession(token) {
  if (!token) return false;
  return sessions.delete(token);
}

function authenticateRequest(req) {
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'] || '';
  let token = authHeader;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }
  return getSession(token);
}

module.exports = {
  login(username, password) {
    if (!username || !password) {
      return { success: false, error: 'Username dan password wajib diisi' };
    }
    const result = Database.verifyLogin(username.trim(), password);
    if (!result.success) {
      return result;
    }
    const session = createSession(result.user);
    return {
      success: true,
      token: session.token,
      user: {
        username: result.user.username,
        role: result.user.role
      }
    };
  },

  changeCredentials(currentUsername, currentPassword, newUsername, newPassword) {
    if (!currentUsername || !currentPassword) {
      return { success: false, error: 'Kredensial saat ini wajib diisi untuk verifikasi' };
    }
    // Verify current credentials first
    const verification = Database.verifyLogin(currentUsername, currentPassword);
    if (!verification.success) {
      return { success: false, error: 'Password saat ini tidak sesuai' };
    }

    if (newPassword && newPassword.length < 6) {
      return { success: false, error: 'Password baru minimal harus 6 karakter' };
    }

    if (newUsername && newUsername.trim().length < 3) {
      return { success: false, error: 'Username baru minimal harus 3 karakter' };
    }

    const updateResult = Database.updateUserCredentials(
      currentUsername,
      newUsername ? newUsername.trim() : null,
      newPassword || null
    );

    if (!updateResult.success) {
      return updateResult;
    }

    // Invalidate all old sessions for this user
    for (const [t, s] of sessions.entries()) {
      if (s.username === currentUsername) {
        sessions.delete(t);
      }
    }

    // Create fresh session with updated username
    const updatedUser = Database.getUserByUsername(updateResult.username);
    const newSession = createSession(updatedUser);

    return {
      success: true,
      message: 'Kredensial berhasil diperbarui. Silakan gunakan kredensial baru.',
      token: newSession.token,
      username: updateResult.username
    };
  },

  logout(token) {
    return deleteSession(token);
  },

  authenticateRequest,
  getSession
};
