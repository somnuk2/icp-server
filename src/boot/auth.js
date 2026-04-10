import { boot } from 'quasar/wrappers'

export default boot(({ router, store }) => {
  router.beforeEach((to, from, next) => {
    // 1. Get auth state from store
    const isAuthenticated = store.state.authenticate;
    const userRole = store.state.status;

    // 2. Check if route requires auth
    if (to.meta.requiresAuth === true && !isAuthenticated) {
      // Not authenticated, redirect to login
      return next({ name: 'LoginPage' });
    }

    // 3. Check role requirements
    if (to.meta.roles && !to.meta.roles.includes(userRole)) {
      // Authenticated but no permission
      console.warn(`Access denied for role: ${userRole} to route: ${to.path}`);
      return next({ name: 'IndexPage' });
    }

    // 4. Default: allow navigation
    next();
  });
})
