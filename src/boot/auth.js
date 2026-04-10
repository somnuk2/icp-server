import { boot } from 'quasar/wrappers'

export default boot(({ router, store }) => {
  router.beforeEach((to, from, next) => {
    // 1. ดึงข้อมูลจาก localStorage
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("status");
    const name = localStorage.getItem("name");
    const member_id = localStorage.getItem("member_id");

    // 2. เช็คสถานะใน Store
    // ป้องกัน Error "commit is not a function" โดยการเช็คให้ชัวร์ว่า store มีตัวตน
    if (store && typeof store.commit === 'function') {
      const isAuthenticatedInStore = store.state.authenticate;

      if (!isAuthenticatedInStore && token && savedRole) {
        // กู้คืนสถานะกลับเข้า Store
        store.commit("setMyAuthenticate", true);
        store.commit("setMyStatus", savedRole);
        store.commit("setMyName", name || "");
        store.commit("setMyMember_id", member_id || "");
      }
    }

    // 3. ดึงค่าล่าสุดหลังกู้คืน
    const isAuthenticated = store && store.state ? store.state.authenticate : !!token;
    const userRole = store && store.state ? store.state.status : savedRole;

    // 4. ตรวจสอบสิทธิ์ (RBAC)
    if (to.meta.requiresAuth === true && !isAuthenticated) {
      return next({ name: 'LoginPage' });
    }

    if (to.meta.requiresAuth === true && to.meta.roles) {
      if (!to.meta.roles.includes(userRole)) {
        console.warn(`Access denied for role: ${userRole}`);
        return next({ name: 'IndexPage' });
      }
    }

    // 5. ป้องกันการเข้าหน้า Login ซ้ำซ้อนถ้า Login อยู่แล้ว
    if (to.name === 'LoginPage' && isAuthenticated) {
      return next({ name: 'IndexPage' });
    }

    next();
  });
})
