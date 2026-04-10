import { boot } from 'quasar/wrappers'
import axios from 'axios'

export default boot(({ router, store }) => {
  router.beforeEach((to, from, next) => {
    // 1. ดึงเข้าข้อมูลจาก localStorage
    const token = localStorage.getItem("token")?.trim();
    const rawRole = localStorage.getItem("status")?.trim() || "";
    const userRole = rawRole.toLowerCase();

    let isAuthenticated = false;

    // 2. ตรวจสอบสถานะเข้มข้น
    if (store && store.state && store.state.authenticate) {
      isAuthenticated = true;
    } else if (token && userRole) {
      isAuthenticated = true;
      // กู้คืนเข้า Store
      if (store && typeof store.commit === 'function') {
        store.commit("setMyAuthenticate", true);
        store.commit("setMyStatus", rawRole);
        store.commit("setMyName", localStorage.getItem("name") || "");
        store.commit("setMyMember_id", localStorage.getItem("member_id") || "");
      }
    }

    // 🛰️ ล้าง Header เก่าทิ้งถ้าไม่ได้ Auth (ป้องกัน Session ค้าง)
    if (!isAuthenticated) {
       delete axios.defaults.headers.common['Authorization'];
    } else {
       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // 3. กฎการเข้าถึง
    
    // หน้า Login: ถ้า Login อยู่แล้ว ให้ไปหน้าแรกเลย
    if ((to.name === 'LoginPage' || to.name === 'AdminLoginPage') && isAuthenticated) {
      return next({ name: 'IndexPage' });
    }

    if (to.meta.requiresAuth === true) {
       if (!isAuthenticated) {
         return next({ name: 'LoginPage' });
       }

       if (to.meta.roles) {
         const allowedRoles = to.meta.roles.map(r => r.toLowerCase());
         if (!allowedRoles.includes(userRole)) {
           return next({ name: 'IndexPage' });
         }
       }
    }

    next();
  });
})
