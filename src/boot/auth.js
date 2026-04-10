import { boot } from 'quasar/wrappers'

export default boot(({ router, store }) => {
  router.beforeEach((to, from, next) => {
    // 1. ตรวจสอบว่าใน Store มีข้อมูลไหม ถ้าไม่มีให้ลองดึงจาก localStorage (กรณีหูแผ่วหลัง Refresh)
    let isAuthenticated = store.state.authenticate;
    let userRole = store.state.status;

    if (!isAuthenticated) {
      const token = localStorage.getItem("token");
      const savedRole = localStorage.getItem("status");
      const name = localStorage.getItem("name");
      const member_id = localStorage.getItem("member_id");

      if (token && savedRole) {
        // กู้คืนสถานะกลับเข้า Store
        store.commit("setMyAuthenticate", true);
        store.commit("setMyStatus", savedRole);
        store.commit("setMyName", name || "");
        store.commit("setMyMember_id", member_id || "");
        
        isAuthenticated = true;
        userRole = savedRole;
      }
    }

    // 2. ตรวจสอบว่าหน้านี้ต้องใช้การยืนยันตัวตนไหม
    if (to.meta.requiresAuth === true && !isAuthenticated) {
      console.log('Auth Required but not authenticated - redirecting to Login');
      return next({ name: 'LoginPage' });
    }

    // 3. ตรวจสอบสิทธิ์ (Roles)
    if (to.meta.requiresAuth === true && to.meta.roles) {
      if (!to.meta.roles.includes(userRole)) {
        console.warn(`Access denied: Role '${userRole}' not allowed for ${to.path}`);
        return next({ name: 'IndexPage' });
      }
    }

    // 4. อนุญาตให้ไปต่อได้
    next();
  });
})
