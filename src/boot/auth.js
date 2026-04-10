import { boot } from 'quasar/wrappers'

export default boot(({ router, store }) => {
  router.beforeEach((to, from, next) => {
    // 1. ดึงเข้าข้อมูลจาก localStorage และทำให้เป็นตัวพิมพ์เล็กทั้งหมดเพื่อป้องกัน Case Sensitive
    const token = localStorage.getItem("token")?.trim();
    const rawRole = localStorage.getItem("status")?.trim() || "";
    const userRole = rawRole.toLowerCase(); // แปลงเป็นตัวเล็ก (เช่น Admin -> admin)

    let isAuthenticated = false;

    // 2. ตรวจสอบสถานะเข้มข้น
    if (store && store.state && store.state.authenticate) {
      isAuthenticated = true;
    } else if (token && userRole) {
      isAuthenticated = true;
      // กู้คืนเข้า Store
      if (store && typeof store.commit === 'function') {
        store.commit("setMyAuthenticate", true);
        store.commit("setMyStatus", rawRole); // ใช้ค่าดั้งเดิมเก็บเข้า Store
        store.commit("setMyName", localStorage.getItem("name") || "");
        store.commit("setMyMember_id", localStorage.getItem("member_id") || "");
      }
    }

    // 🛰️ LOG สำหรับตรวจสอบหน้างาน (สำคัญมาก)
    console.log(`[AuthGuard] Target: ${to.path} | Auth: ${isAuthenticated} | RoleFromDB: ${rawRole}`);

    // 3. กฎการเข้าถึง
    
    // หน้า LoginPage: ถ้าเข้าสู่ระบบแล้ว ไม่ต้องเข้าหน้านี้
    if (to.name === 'LoginPage' && isAuthenticated) {
      return next({ name: 'IndexPage' });
    }

    // หน้าที่ต้องใช้สิทธิพิเศษ
    if (to.meta.requiresAuth === true) {
       // ก) ถ้ายังไม่ได้ Login
       if (!isAuthenticated) {
         console.warn('Redirecting to Login: Not Authenticated');
         return next({ name: 'LoginPage' });
       }

       // ข) ถ้ามีกำหนด Roles ไว้
       if (to.meta.roles) {
         // ตรวจสอบทั้งแบบตัวเล็ก ตัวใหญ่ และเผื่อกรณีค่าเป็นตัวเลข
         const allowedRoles = to.meta.roles.map(r => r.toLowerCase());
         const isAllowed = allowedRoles.includes(userRole);

         if (!isAllowed) {
           console.error(`Access Denied: Your role '${rawRole}' is not in allowed list [${to.meta.roles}]`);
           // ถ้าเป็น User ธรรมดาแต่อยากเข้าหน้า Admin ให้ส่งไปหน้าแรก
           return next({ name: 'IndexPage' });
         }
       }
    }

    // ผ่านทุกเงื่อนไข
    next();
  });
})
