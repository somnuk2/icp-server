<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          {{
            $store.getters.myStatus != "" ? $store.getters.myStatus + ":" : ""
          }}
          <span>{{ $store.getters.myName }}</span>
        </q-toolbar-title>
        <div>
          <q-toolbar-title shrink class="text-weight-bold">
            <q-btn v-if="!$store.getters.myAuthenticate" label="เข้าสู่ระบบ" flat round dense icon="login"
              to="/LoginPage"><q-tooltip :target="true"> เข้าสู่ระบบ </q-tooltip>
            </q-btn>
            <!-- ออกจากระบ -->
            <q-btn v-if="$store.getters.myAuthenticate" label="ออกจากระบบ" flat round dense icon="logout"
              to="/LogoutPage">
              <q-tooltip :target="true"> ออกจากระบบ </q-tooltip>
            </q-btn>
          </q-toolbar-title>
        </div>
      </q-toolbar>
    </q-header>
    <!-- ผู้ใช้ทั่วไป -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered v-if="
      $store.getters.myAuthenticate == true &&
      $store.getters.myStatus == 'user'
    ">
      <q-list>
        <q-item-label header>
          Individual Career Planning (ผู้ใช้ระบบ)</q-item-label>
        <!-- ค่าคงที่ -->
        <q-item clickable dense>
          <q-item-section avatar>
            <q-icon name="settings_accessibility" /></q-item-section>
          <q-item-section>
            <q-item-label>การจัดการค่าคงที่</q-item-label>
            <q-item-label caption>สถาบัน คณะ ระดับ การจัดการสาขาวิชา</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="keyboard_arrow_right"></q-icon>
          </q-item-section>
          <q-menu anchor="bottom right" self="bottom right">
            <q-list>
              <EssentialLink v-for="link in userLinks" :key="link.title" v-bind="link" />
            </q-list>
          </q-menu>
        </q-item>
        <q-separator></q-separator>
        <!-- เมนูหลัก -->
        <EssentialLink v-for="link in userLinks1" :key="link.title" v-bind="link" />
        <q-separator></q-separator>
      </q-list>
    </q-drawer>
    <!-- ผู้ดูแลระบบ -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered v-if="
      $store.getters.myAuthenticate == true &&
      $store.getters.myStatus == 'admin'
    ">
      <q-list>
        <q-item-label header>
          Individual Career Planning (ผู้ดูแลระบบ)</q-item-label>
        <!-- ค่าคงที่ -->
        <q-item clickable dense>
          <q-item-section avatar>
            <q-icon name="settings_accessibility" /></q-item-section>
          <q-item-section>
            <q-item-label>การจัดการค่าคงที่</q-item-label>
            <q-item-label caption>สถาบัน คณะ ระดับ การจัดการสาขาวิชา</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="keyboard_arrow_right"></q-icon>
          </q-item-section>
          <q-menu anchor="bottom right" self="bottom right">
            <q-list>
              <EssentialLink v-for="link in administrationLinks" :key="link.title" v-bind="link" />
            </q-list>
          </q-menu>
        </q-item>
        <q-separator></q-separator>
        <!-- เมนูหลัก -->
        <EssentialLink v-for="link in administrationLinks1" :key="link.title" v-bind="link" />
        <q-separator></q-separator>
      </q-list>
    </q-drawer>
    <!-- ผู้ดูแลกลุ่ม -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered v-if="
      $store.getters.myAuthenticate == true &&
      $store.getters.myStatus == 'suser'
    ">
      <q-list>
        <q-item-label header>
          Individual Career Planning (ผู้ดูแลกลุ่ม)</q-item-label>
        <!-- ค่าคงที่ -->
        <q-item clickable dense>
          <q-item-section avatar>
            <q-icon name="settings_accessibility" /></q-item-section>
          <q-item-section>
            <q-item-label>การจัดการค่าคงที่</q-item-label>
            <q-item-label caption>สถาบัน คณะ ระดับ การจัดการสาขาวิชา</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="keyboard_arrow_right"></q-icon>
          </q-item-section>
          <q-menu anchor="bottom right" self="bottom right">
            <q-list>
              <EssentialLink v-for="link in superUserLinks" :key="link.title" v-bind="link" />
            </q-list>
          </q-menu>
        </q-item>
        <q-separator></q-separator>
        <!-- เมนูหลัก -->
        <EssentialLink v-for="link in superUserLinks1" :key="link.title" v-bind="link" />
        <q-separator></q-separator>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { date } from "quasar";
import { useQuasar } from "quasar";
import axios from "axios";
import { useStore } from 'vuex'
import { getRestApiUrl } from "../utils/apiConfig";

// ผู้ใช้ทั่วไป
const userList = [
  {
    title: "การตั้งค่าส่วนตัว",
    caption: "ข้อมูลการลงทะเบียน",
    icon: "perm_identity",
    link: "/FormRegistration",
  },
  {
    title: "การกำหนดข้อมูลพื้นฐาน",
    caption: "ข้อมูลอาชีพ คุณสมบัติ/ทักษะ",
    icon: "perm_identity",
    link: "/tapUserConstances",
  },
];
const userList1 = [
  {
    title: "Dashboard การวิเคราะห์",
    caption: "สรุปผล แนะนำการพัฒนา",
    icon: "dashboard",
    link: "/FormDashboard",
  },
  {
    title: "กรอกข้อมูลส่วนตัว",
    caption: "การศึกษา ความพิการ",
    icon: "lock_outline",
    link: "/FormComponent",
  },
  {
    title: "กำหนดอาชีพเป้าหมาย",
    caption: "อาชีพในอนาคต",
    icon: "work_history",
    link: "/FormPlanCareer",
  },
  {
    title: "กำหนดคุณสมบัติ/ทักษะ",
    caption: "คุณสมบัติและทักษะ เป้าหมาย ระดับ",
    icon: "fact_check",
    link: "/FormQualification",
  },
  {
    title: "การพัฒนาตนเอง",
    caption: "ศึกษาเรียนรู้ ฝึกปฏิบัติ",
    icon: "post_add",
    link: "/FormPlan",
  },
  {
    title: "การประเมินตนเอง",
    caption: "เดือน ระดับ",
    icon: "checklist_rtl",
    link: "/FormSelfAssessment",
  },
];
// เมนูรายงานถูกนำออกตามความต้องการของผู้ใช้
// ผู้ดูแลระบบ
const adminList = [
  {
    title: "จัดการลงทะเบียน",
    caption: "ข้อมูลการลงทะเบียน",
    icon: "perm_identity",
    link: "/AdminFormRegistration",
    // link: "/tapRegistration",
  },
  {
    title: "การจัดการสาขาวิชา",
    caption: "สถาบัน คณะ ปริญญา สาขาวิชา",
    icon: "perm_identity",
    link: "/tapFormInstitute",
  },
  {
    title: "จัดการค่าคงที่",
    caption:
      "โครงการ ความพิการ ค่าเป้าหมาย ค่าการประเมิน ค่าระดับความสำคัญ ความสำคัญ กลุ่มอาชีพ กลุ่มคุณสมบัติ/ทักษะ",
    icon: "perm_identity",
    link: "/tapAdminConstances",
  },
  {
    title: "จัดการอาชีพ/คุณสมบัติ/ทักษะ",
    caption: "อาชีพ คุณสมบัติ/ทักษะ",
    icon: "perm_identity",
    link: "/tapAdminConstances1",
  },
];
const adminList1 = [
  {
    title: "จัดการข้อมูลส่วนตัว",
    caption: "การศึกษา ความพิการ",
    icon: "lock_outline",
    link: "/AdminFormComponent",
    // link: "/tapIndividual",
  },
  {
    title: "จัดการอาชีพเป้าหมาย",
    caption: "อาชีพในอนาคต",
    icon: "work_history",
    link: "/AdminFormPlanCareer",
    // link: "/tapPlan_career",
  },
  {
    title: "จัดการคุณสมบัติ/ทักษะ",
    caption: "คุณสมบัติและทักษะ เป้าหมาย ระดับ",
    icon: "fact_check",
    link: "/AdminFormQualification",
    // link: "/tapQualification",
  },
  {
    title: "จัดการพัฒนาตนเอง",
    caption: "ศึกษาเรียนรู้ ฝึกปฏิบัติ",
    icon: "post_add",
    link: "/AdminFormPlan",
    // link: "/tapPlan",
  },
  {
    title: "จัดการประเมินตนเอง",
    caption: "เดือน ระดับ",
    icon: "checklist_rtl",
    link: "/AdminFormSelfAssessment",
    // link: "/tapSelf_assessment",
  },
];
// เมนูรายงานถูกนำออกตามความต้องการของผู้ใช้
// ผู้ดูแลกลุ่ม
const superUserList = [
  {
    title: "จัดการลงทะเบียน",
    caption: "ข้อมูลการลงทะเบียน",
    icon: "perm_identity",
    link: "/SuserFormRegistration",
  },
  {
    title: "การจัดการสาขาวิชา",
    caption: "สถาบัน คณะ ปริญญา สาขาวิชา",
    icon: "perm_identity",
    link: "/s_tapFormInstitute",
  },
  {
    title: "จัดการอาชีพ/คุณสมบัติ/ทักษะ",
    caption: "อาชีพ คุณสมบัติ/ทักษะ",
    icon: "perm_identity",
    link: "/tapSuperUserConstances",
  },
];
const superUserList1 = [
  {
    title: "จัดการข้อมูลส่วนตัว",
    caption: "การศึกษา ความพิการ",
    icon: "lock_outline",
    link: "/SuserFormComponent",
    // link: "/tapIndividual_",
  },
  {
    title: "จัดการอาชีพเป้าหมาย",
    caption: "อาชีพในอนาคต",
    icon: "work_history",
    link: "/SuserFormPlanCareer",
    // link: "/tapPlan_career_",
  },
  {
    title: "จัดการคุณสมบัติ/ทักษะ",
    caption: "คุณสมบัติและทักษะ เป้าหมาย ระดับ",
    icon: "fact_check",
    link: "/SuserFormQualification",
    // link: "/tapQualification_",
  },
  {
    title: "จัดการพัฒนาตนเอง",
    caption: "ศึกษาเรียนรู้ ฝึกปฏิบัติ",
    icon: "post_add",
    link: "/SuserFormPlan",
    // link: "/tapPlan_",
  },
  {
    title: "จัดการประเมินตนเอง",
    caption: "เดือน ระดับ",
    icon: "checklist_rtl",
    link: "/SuserFormSelfAssessment",
    // link: "/tapSelf_assessment_",
  },
];
// เมนูรายงานถูกนำออกตามความต้องการของผู้ใช้
export default defineComponent({
  name: "MainLayout",
  data() {
    return {
      url_api_notification: "",
      member_id: this.$store.getters.myMember_id,
      $q: useQuasar(),
      loading: false,
    };
  },
  components: {
    EssentialLink,
  },
  methods: {
    onLogin() {
      this.$router.replace({ name: "LoginPage" });
    },
    onLogout() {
      this.$router.replace({ name: "LogoutPage" });
    },
    async getUpdateNotify(member_id) {
      if (!member_id) return;
      try {
        const restBaseUrl = getRestApiUrl(this.$store);
        const res = await axios.get(`${restBaseUrl}/notifications/latest`, { params: { member_id } });
        if (res.data && Object.keys(res.data).length > 0) {
          const notification_date = this.dayToYear(res.data.notification_date);
          const frequency_name = res.data.frequency_name;
          const message = res.data.message;
          this.currentDate(notification_date, frequency_name, message);
        }
      } catch (err) {
        console.error("Notification check failed:", err);
      }
    },
    currentDate(specific_, frequency, message) {
      const current = new Date();
      const specific = date.extractDate(specific_, "DD/MM/YYYY");
      const diff_days = date.getDateDiff(current, specific, "days");

      let freq = 0;
      if (frequency === "วัน") freq = 1;
      else if (frequency === "สัปดาห์") freq = 7;
      else if (frequency === "เดือน") freq = 30;

      if (freq > 0 && Math.abs(parseInt(diff_days)) % freq === 0) {
        this.$q.notify({
          message: `ครบกำหนดการแจ้งเตือนราย${frequency}: ${message}`,
          progress: true,
          color: "primary",
          actions: [
            { label: "Dismiss", color: "white", handler: () => { } },
          ],
        });
      }
    },
    dayToYear(dateStr) {
      if (!dateStr) return "";
      // Assumes input is YYYY-MM-DD or YYYY/MM/DD from API
      const parts = dateStr.includes("-") ? dateStr.split("-") : dateStr.split("/");
      if (parts.length !== 3) return dateStr;
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  },
  setup() {
    const leftDrawerOpen = ref(false);
    return {
      userLinks: userList,
      userLinks1: userList1,
      administrationLinks: adminList,
      administrationLinks1: adminList1,
      superUserLinks: superUserList,
      superUserLinks1: superUserList1,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
  mounted() {
    if (this.member_id) {
      this.getUpdateNotify(this.member_id);
    }
  },
});
</script>
