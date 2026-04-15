import { boot } from 'quasar/wrappers'

export default boot(({ router, store }) => {
  router.beforeEach((to, from, next) => {
    // 1. ดึงข้อมูลจาก localStorage หรือ sessionStorage
    const token = (localStorage.getItem("token") || sessionStorage.getItem("token"))?.trim();
    const rawRole = (localStorage.getItem("status") || sessionStorage.getItem("status"))?.trim() || "";
    const userRole = rawRole.toLowerCase();

    // 2. ตรวจสอบสถานะ Login
    let isAuthenticated = false;

    if (store?.state?.authenticate) {
      isAuthenticated = true;
    } else if (token && userRole) {
      // กู้คืน Store จาก Storage (กรณีรีเฟรชหน้า)
      isAuthenticated = true;
      if (store && typeof store.commit === 'function') {
        store.commit("setMyAuthenticate", true);
        store.commit("setMyStatus", rawRole);
        store.commit("setMyName", localStorage.getItem("name") || sessionStorage.getItem("name") || "");
        store.commit("setMyMember_id", localStorage.getItem("member_id") || sessionStorage.getItem("member_id") || "");
      }
    }

    // 3. เฉพาะหน้าที่ต้องการสิทธิ์ Login เท่านั้น
    if (to.meta.requiresAuth === true) {
      // ก. ยังไม่ได้ Login → ไปหน้า Login
      if (!isAuthenticated) {
        return next({ name: 'LoginPage' });
      }

      // ข. Login แล้วแต่ Role ไม่ตรง → ไปหน้าแรก
      if (to.meta.roles) {
        const allowedRoles = to.meta.roles.map(r => r.toLowerCase());
        if (!allowedRoles.includes(userRole)) {
          console.warn(`[Auth] Role '${rawRole}' not in [${to.meta.roles}] for ${to.path}`);
          return next({ name: 'IndexPage' });
        }
      }
    }

    // 4. ผ่านทุกเงื่อนไข → อนุญาต
    next();
  });
})
