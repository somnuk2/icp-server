
import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes.js'
import store from '../store/index.js'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */
export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // ✅ Authentication & Session Guard
  Router.beforeEach((to, from, next) => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("status");
    const name = sessionStorage.getItem("name");
    const member_id = sessionStorage.getItem("member_id");

    // 1. Session Restoration (If Vuex state lost on refresh but sessionStorage remains)
    if (token && store && !store.getters.myAuthenticate) {
      store.commit("setMyAuthenticate", true);
      store.commit("setMyMember_id", member_id);
      store.commit("setMyName", name);
      store.commit("setMyStatus", role);
    }

    // 2. Prevent visiting Login pages if already authenticated
    if (to.name === "LoginPage" || to.name === "AdminLoginPage") {
      if (token) {
        return next({ name: "IndexPage" });
      }
    }

    // 3. Routing Protection
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (requiresAuth) {
      if (!token) {
        const isAdminRoute = to.path.match(/^\/(Admin|Suser|s_|tapAdmin|tapSuper)/i);
        return next({ name: isAdminRoute ? "AdminLoginPage" : "LoginPage" });
      } else {
        // Role based check (Normalized to lowercase and trimmed)
        const userRole = (role || "").trim().toLowerCase();
        const allAllowedRoles = to.matched
          .filter(record => record.meta && record.meta.roles)
          .flatMap(record => record.meta.roles)
          .map(r => String(r).trim().toLowerCase());

        if (allAllowedRoles.length > 0 && !allAllowedRoles.includes(userRole)) {
          console.warn(`RouterGuard: Role mismatch for "${to.path}". Allowed: ${JSON.stringify([...new Set(allAllowedRoles)])}, Found: "${userRole}"`);
          return next({ name: "IndexPage" });
        }
      }
    }

    // Default: Allow navigation
    next();
  });

  return Router
})
