export const createAuthService = ({ signInWithGoogle, signOut, getCurrentUser } = {}) => Object.freeze({
  async signIn() {
    if (typeof signInWithGoogle !== 'function') throw new Error('AUTH_NOT_CONFIGURED');
    return signInWithGoogle();
  },
  async signOut() {
    if (typeof signOut !== 'function') throw new Error('AUTH_NOT_CONFIGURED');
    return signOut();
  },
  async currentUser() {
    if (typeof getCurrentUser !== 'function') return null;
    return getCurrentUser();
  },
});

export const authStatus = Object.freeze({ provider: 'google', configured: false, guestSimulation: true });
