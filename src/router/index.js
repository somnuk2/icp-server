
import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes.js'


/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */
export default defineRouter(function ({ store /* , ssrContext */ }) {
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
    // 1. Session Restoration (If Vuex state lost on refresh but sessionStorage remains)
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("status");
    const name = sessionStorage.getItem("name");
    const member_id = sessionStorage.getItem("member_id");

    if (token && !store.getters.myAuthenticate) {
      store.commit("setMyAuthenticate", true);
      store.commit("setMyMember_id", member_id);
      store.commit("setMyName", name);
      store.commit("setMyStatus", role);
    }

    // 2. Routing Protection
    if (to.meta.requiresAuth === true) {
      // Check for token in sessionStorage
      if (!sessionStorage.getItem("token")) {
        // Not logged in -> Redirect to login
        if (to.path.startsWith("/Admin") || to.path.startsWith("/Suser") || to.path.startsWith("/s_") || to.path.startsWith("/tapAdmin") || to.path.startsWith("/tapSuper") ) {
          next({ name: "AdminLoginPage" });
        } else {
          next({ name: "LoginPage" });
        }
      } else {
        // Logged in -> Check Roles if defined
        const userRole = sessionStorage.getItem("status");
        if (to.meta.roles && !to.meta.roles.includes(userRole)) {
          // Role not allowed
          next({ name: "IndexPage" });
        } else {
          next();
        }
      }
    } else {
      // Not a protected route
      next();
    }
  });

  return Router
})
