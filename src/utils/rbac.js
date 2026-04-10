/**
 * RBAC Helper Utilities
 * 
 * use this in components to check for role-based permissions or show/hide UI elements.
 */

/**
 * Checks if the current user profile has a specific role.
 * @param {Object} store - The Vuex store instance
 * @param {string|string[]} roles - Single role or array of roles
 * @returns {boolean}
 */
export const hasRole = (store, roles) => {
  const userRole = store.state.status;
  if (!userRole) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(userRole);
  }
  return userRole === roles;
};

/**
 * Checks if a user is currently authenticated.
 * @param {Object} store - The Vuex store instance
 * @returns {boolean}
 */
export const isAuthenticated = (store) => {
  return !!store.state.authenticate;
};

/**
 * Common Role Definitions
 */
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_USER: 'super_user'
};
