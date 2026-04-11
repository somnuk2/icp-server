
import MainLayout from "layouts/MainLayout.vue";
import IndexPage from "layouts/IndexPage.vue";
// User
// Mangagement
import FormComponent from "pages/forms/FormComponent.vue";
// import FormPivotTable from "pages/forms/FormPivotTable.vue";
import FormPlan from "pages/forms/FormPlan.vue";
import FormPlanCareer from "pages/forms/FormPlanCareer.vue";
import FormQualification from "pages/forms/FormQualification.vue";
import FormSelfAssessment from "pages/forms/FormSelfAssessment.vue";
// import FormReference from "pages/forms/FormReference.vue";
// import FormReport from "pages/forms/FormReport.vue";
import FormRegistration from "pages/forms/FormRegistration.vue";
// import FormNotification from "pages/forms/FormNotification.vue"; // ถูกนำออกจากเมนูและ routes
import FormDashboard from "pages/forms/FormDashboard.vue";
// registration
import LoginPage from "src/pages/registration/LoginPage.vue";
import LogoutPage from "pages/registration/LogoutPage.vue";
import RegistrationPage from "pages/registration/RegistrationPage.vue";

// Admin
import AdminFormComponent from "pages/admin_forms/FormComponent.vue";
import AdminFormPlan from "pages/admin_forms/FormPlan.vue";
import AdminFormPlanCareer from "pages/admin_forms/FormPlanCareer.vue";
import AdminFormQualification from "pages/admin_forms/FormQualification.vue";
import AdminFormSelfAssessment from "pages/admin_forms/FormSelfAssessment.vue";
import AdminFormRegistration from "pages/admin_forms/FormRegistration.vue";
// import AdminFormNotification from "pages/admin_forms/FormNotification.vue"; // ถูกนำออกจากเมนูและ routes
// registration
import AdminLoginPage from "src/pages/admin_registration/LoginPage.vue";
import AdminLogoutPage from "pages/admin_registration/LogoutPage.vue";
import AdminRegistrationPage from "pages/admin_registration/RegistrationPage.vue";

// SUPER USER - SUSER
import SuserFormComponent from "pages/super_user_forms/FormComponent.vue";
import SuserFormPlan from "pages/super_user_forms/FormPlan.vue";
import SuserFormPlanCareer from "pages/super_user_forms/FormPlanCareer.vue";
import SuserFormQualification from "pages/super_user_forms/FormQualification.vue";
import SuserFormSelfAssessment from "pages/super_user_forms/FormSelfAssessment.vue";
import SuserFormRegistration from "pages/super_user_forms/FormRegistration.vue";
// import SuserFormNotification from "pages/super_user_forms/FormNotification.vue"; // ถูกนำออกจากเมนูและ routes

//sub admin forms
import instituteForm from "pages/sub_admin_forms/instituteForm.vue";
import facultyForm from "pages/sub_admin_forms/facultyForm.vue";
import degreeForm from "pages/sub_admin_forms/degreeForm.vue";
import departmentForm from "pages/sub_admin_forms/departmentForm.vue";
import tapFormInstitute from "pages/sub_admin_forms/tapFormInstitute.vue";

//sub admin forms
import s_instituteForm from "pages/sub_super_user_forms/instituteForm.vue";
import s_facultyForm from "pages/sub_super_user_forms/facultyForm.vue";
import s_degreeForm from "pages/sub_super_user_forms/degreeForm.vue";
import s_departmentForm from "pages/sub_super_user_forms/departmentForm.vue";
import s_tapFormInstitute from "pages/sub_super_user_forms/tapFormInstitute.vue";

import tapAdminConstances from "pages/admin_constances/tapAdminConstances.vue";
import tapUserConstances from "pages/user_constances/tapUserConstances.vue";
import tapAdminReports from "pages/admin_reports/tapAdminReports.vue";
import tapSuperUserConstances from "pages/super_user_constances/tapSuperUserConstances.vue";
import tapAdminConstances1 from "pages/admin_constances1/tapAdminConstances1.vue";
import tapSuperReports from "pages/super_reports/tapSuperReports.vue";
import tapUserReports from "pages/user_reports/tapUserReports.vue";

// admin-form-report
import tapRegistration from "pages/admin_forms/registration_reports/tapRegistration.vue";
import tapIndividual from "pages/admin_forms/individual_reports/tapIndividual.vue";
import tapPlan_career from "pages/admin_forms/plan_career_reports/tapPlan_career.vue";
import tapQualification from "pages/admin_forms/qualification_reports/tapQualification.vue";
import tapPlan from "pages/admin_forms/plan_reports/tapPlan.vue";
import tapSelf_assessment from "pages/admin_forms/self_assessment_reports/tapSelf_assessment.vue";
import tapNotification from "pages/admin_forms/Notification_reports/tapNotification.vue";
// super_user_forms
import tapRegistration_ from "pages/super_user_forms/registration_reports/tapRegistration.vue";
import tapIndividual_ from "pages/super_user_forms/individual_reports/tapIndividual.vue";
import tapPlan_career_ from "pages/super_user_forms/plan_career_reports/tapPlan_career.vue";
import tapQualification_ from "pages/super_user_forms/qualification_reports/tapQualification.vue";
import tapPlan_ from "pages/super_user_forms/plan_reports/tapPlan.vue";
import tapSelf_assessment_ from "pages/super_user_forms/self_assessment_reports/tapSelf_assessment.vue";
import tapNotification_ from "pages/super_user_forms/Notification_reports/tapNotification.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: MainLayout,
    children: [
      {
        path: "/",
        name: "IndexPage",
        component: IndexPage,
        meta: { requiresAuth: false }
      },
    ],

  },

  // Always leave this as last one,
  // but you can also remove it
  {

    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
  // User forms
  {
    path: "/FormRegistration",
    name: "FormRegistration",
    component: FormRegistration,
    meta: { requiresAuth: true, roles: ['user', 'admin', 'super_user', 'superuser', 'suser'] }
  },
  {
    path: "/FormComponent",
    name: "FormComponent",
    component: FormComponent,
    meta: { requiresAuth: true, roles: ['user', 'admin', 'super_user', 'superuser', 'suser'] }
  },
  {
    path: "/FormPlan",
    name: "FormPlan",
    component: FormPlan,
    meta: { requiresAuth: true, roles: ['user', 'admin', 'super_user', 'superuser', 'suser'] }
  },
  {
    path: "/FormPlanCareer",
    name: "FormPlanCareer",
    component: FormPlanCareer,
    meta: { requiresAuth: true, roles: ['user', 'admin', 'super_user', 'superuser', 'suser'] }
  },
  {
    path: "/FormQualification",
    name: "FormQualification",
    component: FormQualification,
    meta: { requiresAuth: true, roles: ['user', 'admin', 'super_user', 'superuser', 'suser'] }
  },
  {
    path: "/FormSelfAssessment",
    name: "FormSelfAssessment",
    component: FormSelfAssessment,
    meta: { requiresAuth: true, roles: ['user', 'admin', 'super_user', 'superuser', 'suser'] }
  },
  {
    path: "/LoginPage",
    name: "LoginPage",
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: "/LogoutPage",
    name: "LogoutPage",
    component: LogoutPage,
    meta: { requiresAuth: false }
  },
  {
    path: "/RegistrationPage",
    name: "RegistrationPage",
    component: RegistrationPage,
    meta: { requiresAuth: false }
  },
  // {
  //   path: "/FormReference",
  //   name: "FormReference",
  //   component: FormReference,
  // },
  // FormNotification ถูกนำออกจาก routes แล้ว
  // {
  //   path: "/FormNotification",
  //   name: "FormNotification",
  //   component: FormNotification,
  //   meta: { requiresAuth: true, roles: ['user', 'admin', 'super_user', 'superuser', 'suser'] }
  // },
  {
    path: "/FormDashboard",
    name: "FormDashboard",
    component: FormDashboard,
    meta: { requiresAuth: true, roles: ['user', 'admin', 'super_user', 'superuser', 'suser'] }
  },
  // Admin forms
  {
    path: "/AdminFormRegistration",
    name: "AdminFormRegistration",
    component: AdminFormRegistration,
    meta: { requiresAuth: true, roles: ['admin', 'super_user', 'superuser', 'suser'] }
  },
  {
    path: "/AdminFormComponent",
    name: "AdminFormComponent",
    component: AdminFormComponent,
    meta: { requiresAuth: true, roles: ['admin', 'super_user', 'superuser', 'suser'] }
  },
  // {
  //   path: "/AdminFormPivotTable",
  //   name: "AdminFormPivotTable",
  //   component: AdminFormPivotTable,
  // },
  // {
  //   path: "/AdminFormReport",
  //   name: "AdminFormReport",
  //   component: AdminFormReport,
  // },
  {
    path: "/AdminFormPlan",
    name: "AdminFormPlan",
    component: AdminFormPlan,
    meta: { requiresAuth: true, roles: ['admin', 'super_user', 'superuser', 'suser'] }
  },
  {
    path: "/AdminFormPlanCareer",
    name: "AdminFormPlanCareer",
    component: AdminFormPlanCareer,
    meta: { requiresAuth: true, roles: ['admin', 'super_user', 'superuser', 'suser'] }
  },
  {
    path: "/AdminFormQualification",
    name: "AdminFormQualification",
    component: AdminFormQualification,
    meta: { requiresAuth: true, roles: ['admin', 'super_user', 'superuser', 'suser'] }
  },
  {
    path: "/AdminFormSelfAssessment",
    name: "AdminFormSelfAssessment",
    component: AdminFormSelfAssessment,
    meta: { requiresAuth: true, roles: ['admin', 'super_user', 'superuser', 'suser'] }
  },
  // AdminFormNotification ถูกนำออกจาก routes แล้ว
  // {
  //   path: "/AdminFormNotification",
  //   name: "AdminFormNotification",
  //   component: AdminFormNotification,
  //   meta: { requiresAuth: true, roles: ['admin', 'super_user', 'superuser', 'suser'] }
  // },
  {
    path: "/AdminLoginPage",
    name: "AdminLoginPage",
    component: AdminLoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: "/AdminLogoutPage",
    name: "AdminLogoutPage",
    component: AdminLogoutPage,
    meta: { requiresAuth: false }
  },
  {
    path: "/AdminRegistrationPage",
    name: "AdminRegistrationPage",
    component: AdminRegistrationPage,
    meta: { requiresAuth: false }
  },
  // Super user forms
  {
    path: "/SuserFormRegistration",
    name: "SuserFormRegistration",
    component: SuserFormRegistration,
    meta: { requiresAuth: true, roles: ['super_user', 'superuser', 'suser'] }
  },
  {
    path: "/SuserFormComponent",
    name: "SuserFormComponent",
    component: SuserFormComponent,
    meta: { requiresAuth: true, roles: ['super_user', 'superuser', 'suser'] }
  },
  // {
  //   path: "/SuserFormPivotTable",
  //   name: "SuserFormPivotTable",
  //   component: SuserFormPivotTable,
  // },
  // {
  //   path: "/SuserFormReport",
  //   name: "SuserFormReport",
  //   component: SuserFormReport,
  // },
  {
    path: "/SuserFormPlan",
    name: "SuserFormPlan",
    component: SuserFormPlan,
    meta: { requiresAuth: true, roles: ['super_user', 'superuser', 'suser'] }
  },
  {
    path: "/SuserFormPlanCareer",
    name: "SuserFormPlanCareer",
    component: SuserFormPlanCareer,
    meta: { requiresAuth: true, roles: ['super_user', 'superuser', 'suser'] }
  },
  {
    path: "/SuserFormQualification",
    name: "SuserFormQualification",
    component: SuserFormQualification,
    meta: { requiresAuth: true, roles: ['super_user', 'superuser', 'suser'] }
  },
  {
    path: "/SuserFormSelfAssessment",
    name: "SuserFormSelfAssessment",
    component: SuserFormSelfAssessment,
    meta: { requiresAuth: true, roles: ['super_user', 'superuser', 'suser'] }
  },
  // SuserFormNotification ถูกนำออกจาก routes แล้ว
  // {
  //   path: "/SuserFormNotification",
  //   name: "SuserFormNotification",
  //   component: SuserFormNotification,
  //   meta: { requiresAuth: true, roles: ['super_user', 'superuser', 'suser'] }
  // },
  // sub admin education
  {
    path: "/instituteForm",
    name: "instituteForm",
    component: instituteForm,
  },
  {
    path: "/tapFormInstitute",
    name: "tapFormInstitute",
    component: tapFormInstitute,
  },
  {
    path: "/facultyForm",
    name: "facultyForm",
    component: facultyForm,
  },
  {
    path: "/degreeForm",
    name: "degreeForm",
    component: degreeForm,
  },
  {
    path: "/departmentForm",
    name: "departmentForm",
    component: departmentForm,
  },
  // sub_super_user education
  {
    path: "/s_instituteForm",
    name: "s_instituteForm",
    component: s_instituteForm,
  },
  {
    path: "/s_tapFormInstitute",
    name: "s_tapFormInstitute",
    component: s_tapFormInstitute,
  },
  {
    path: "/s_facultyForm",
    name: "s_facultyForm",
    component: s_facultyForm,
  },
  {
    path: "/s_degreeForm",
    name: "s_degreeForm",
    component: s_degreeForm,
  },
  {
    path: "/s_departmentForm",
    name: "s_departmentForm",
    component: s_departmentForm,
  },
  // Admin constance
  {
    path: "/tapAdminConstances",
    name: "tapAdminConstances",
    component: tapAdminConstances,
  },
  ,
  // User constances
  {
    path: "/tapUserConstances",
    name: "tapUserConstances",
    component: tapUserConstances,
  },
  // // User constances
  // {
  //   path: "/tapAdminReports",
  //   name: "tapAdminReports",
  //   component: tapAdminReports,
  // },
  //  Super User Constances
  {
    path: "/tapSuperUserConstances",
    name: "tapSuperUserConstances",
    component: tapSuperUserConstances,
  },
  // User constances
  {
    path: "/tapAdminConstances1",
    name: "tapAdminGroupConstances",
    component: tapAdminConstances1,
  },
  // // Super user report
  // {
  //   path: "/tapSuperReports",
  //   name: "tapSuperReports",
  //   component: tapSuperReports,
  // },
  // // User report
  // {
  //   path: "/tapUserReports",
  //   name: "tapUserReports",
  //   component: tapUserReports,
  // },
  // // tap Registration
  // {
  //   path: "/tapRegistration",
  //   name: "tapRegistration",
  //   component: tapRegistration,
  //   meta: { requiresAuth: true, roles: ['admin', 'super_user', 'superuser', 'suser'] }
  // },
  // //tap Individual
  // {
  //   path: "/tapIndividual",
  //   name: "tapIndividual",
  //   component: tapIndividual,
  //   meta: { requiresAuth: true, roles: ['admin', 'super_user', 'superuser', 'suser'] }
  // },
  // // tap plan career
  // {
  //   path: "/tapPlan_career",
  //   name: "tapPlan_career",
  //   component: tapPlan_career,
  //   meta: { requiresAuth: true, roles: ['admin', 'super_user', 'superuser', 'suser'] }
  // },
  // //tap qualification
  // {
  //   path: "/tapQualification",
  //   name: "tapQualification",
  //   component: tapQualification,
  //   meta: { requiresAuth: true, roles: ['admin', 'super_user', 'superuser', 'suser'] }
  // },
  // //tap plan
  // {
  //   path: "/tapPlan",
  //   name: "tapPlan",
  //   component: tapPlan,
  //   meta: { requiresAuth: true, roles: ['admin', 'super_user', 'superuser', 'suser'] }
  // },
  // //tap self assessment
  // {
  //   path: "/tapSelf_assessment",
  //   name: "tapSelf_assessment",
  //   component: tapSelf_assessment,
  //   meta: { requiresAuth: true, roles: ['admin', 'super_user', 'superuser', 'suser'] }
  // },
  // //tap Notification
  // {
  //   path: "/tapNotification",
  //   name: "tapNotification",
  //   component: tapNotification,
  //   meta: { requiresAuth: true, roles: ['admin', 'super_user', 'superuser', 'suser'] }
  // },
  // //----------------------------------
  // // tap Registration
  // {
  //   path: "/tapRegistration_",
  //   name: "tapRegistration_",
  //   component: tapRegistration_,
  //   meta: { requiresAuth: true, roles: ['super_user', 'superuser', 'suser'] }
  // },
  // //tap Individual
  // {
  //   path: "/tapIndividual_",
  //   name: "tapIndividual_",
  //   component: tapIndividual_,
  //   meta: { requiresAuth: true, roles: ['super_user', 'superuser', 'suser'] }
  // },
  // // tap plan career
  // {
  //   path: "/tapPlan_career_",
  //   name: "tapPlan_career_",
  //   component: tapPlan_career_,
  //   meta: { requiresAuth: true, roles: ['super_user', 'superuser', 'suser'] }
  // },
  // //tap qualification
  // {
  //   path: "/tapQualification_",
  //   name: "tapQualification_",
  //   component: tapQualification_,
  //   meta: { requiresAuth: true, roles: ['super_user', 'superuser', 'suser'] }
  // },
  // //tap plan
  // {
  //   path: "/tapPlan_",
  //   name: "tapPlan_",
  //   component: tapPlan_,
  //   meta: { requiresAuth: true, roles: ['super_user', 'superuser', 'suser'] }
  // },
  // //tap self assessment
  // {
  //   path: "/tapSelf_assessment_",
  //   name: "tapSelf_assessment_",
  //   component: tapSelf_assessment_,
  //   meta: { requiresAuth: true, roles: ['super_user', 'superuser', 'suser'] }
  // },
  // //tap Notification
  // {
  //   path: "/tapNotification_",
  //   name: "tapNotification_",
  //   component: tapNotification_,
  //   meta: { requiresAuth: true, roles: ['super_user', 'superuser', 'suser'] }
  // },
];

export default routes;

