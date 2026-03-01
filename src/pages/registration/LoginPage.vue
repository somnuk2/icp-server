<template>
  <q-layout view="hHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <q-page padding class="row items-center justify-center" style="background: linear-gradient(#74c588, #0ad13c)">
        <div class="row full-width">
          <div class="col-md-8 offset-md-2 col-xs-12 q-pa-xs">
            <q-card flat class="bg-white text-black">
              <q-card-section class="bg-deep-purple-7">
                <h4 class="text-h5 text-white q-my-xs text-center">
                  {{ title }}
                </h4>
              </q-card-section>
              <div class="row">
                <div class="col-md-5 col-xs-12 q-pa-xs">
                  <q-img placeholder-src="~assets/images/pics_topic_103.jpg" src="~assets/images/pics_topic_103.jpg"
                    spinner-color="white"></q-img>
                </div>

                <div class="col-md-7 col-xs-12">
                  <div class="q-pa-md">
                    <q-form @submit="OnLogin()" class="q-gutter-md">
                      <q-input ref="email" square clearable v-model="input.username" type="email" lazy-rules
                        :rules="[this.required, this.isEmail, this.short]" label="อีเมล:">
                        <template v-slot:prepend>
                          <q-icon name="email" />
                        </template>
                      </q-input>
                      <q-input ref="password" square clearable v-model="input.password" :type="passwordFieldType"
                        lazy-rules :rules="[this.required, this.short]" label="รหัสผ่าน:">
                        <template v-slot:prepend>
                          <q-icon name="lock" />
                        </template>
                        <template v-slot:append>
                          <q-icon :name="visibilityIcon" @click="switchVisibility" class="cursor-pointer" />
                        </template>
                      </q-input>

                      <q-input square clearable v-model="input.gemini_api_key" :type="passwordFieldType"
                        label="Gemini API Key (Option):" placeholder="ใส่รหัสเพื่อใช้งาน AI ส่วนตัว">
                        <template v-slot:prepend>
                          <q-icon name="auto_awesome" />
                        </template>
                      </q-input>
                      <q-input ref="repassword" v-if="register" square clearable v-model="repassword"
                        :type="passwordFieldType" lazy-rules :rules="[this.required, this.short, this.diffPassword]"
                        label="ใส่รหัสผ่านซ้ำ">
                        <template v-slot:prepend>
                          <q-icon name="lock" />
                        </template>
                        <template v-slot:append>
                          <q-icon :name="visibilityIcon" @click="switchVisibility" class="cursor-pointer" />
                        </template>
                      </q-input>

                      <div>
                        <q-btn icon="login" label="เข้าระบบ" type="submit" color="primary" />
                        <q-btn icon="assignment_ind" label="ลงทะเบียน" color="primary" flat class="q-pa-xs"
                          to="/RegistrationPage" />
                        <q-btn icon="logout" label="ออก" color="primary" flat class="q-pa-xs" to="/" />
                      </div>
                    </q-form>
                  </div>
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import axios from "axios";
import { ref } from "vue";
import { useQuasar } from "quasar";
import { getRestApiUrl } from "../../utils/apiConfig.js";

export default {
  name: "LoginPage2",
  data() {
    return {
      apiUrl: "",
      register: false,
      title: "เข้าสู่ระบบ",
      passwordFieldType: "password",
      visibility: false,
      visibilityIcon: "visibility",
      input: {
        username: "",
        password: "",
        gemini_api_key: "",
      },
      $q: useQuasar(),
    };
  },

  methods: {
    OnLogin() {
      if (this.input.username !== "" && this.input.password !== "") {
        this.checkMember();
      }
    },
    async checkMember() {
      try {
        const response = await axios.post(`${this.apiUrl}/auth/login`, {
          email: this.input.username.trim(),
          password: this.input.password.trim(),
          gemini_api_key: this.input.gemini_api_key?.trim() || null,
        });

        const { token, member_id, full_name, role } = response.data;

        if (token) {
          localStorage.setItem("token", token);
          if (response.data.gemini_api_key) {
            localStorage.setItem("gemini_api_key", response.data.gemini_api_key);
          }
          this.storeCommit(member_id, full_name, role);
        }
      } catch (error) {
        console.error("Login failed:", error);
        this.$q.dialog({
          title: "คำเตือน",
          message: error.response?.data?.error || "ชื่อผู้ใช้/รหัสผ่านไม่ถูกต้อง",
          persistent: true,
        }).onOk(() => {
          this.input.password = "";
        });
      }
    },
    storeCommit(member_id, full_name, status) {
      this.$store.commit("setMyAuthenticate", true);
      this.$store.commit("setMyMember_id", member_id);
      this.$store.commit("setMyName", full_name);
      this.$store.commit("setMyStatus", status);
      this.$router.replace({ path: "/" });
    },
    required(val) {
      return (val && val.length > 0) || "ช่องที่ต้องกรอก";
    },
    short(val) {
      return (val && val.length > 3) || "ค่าสั้นเกินไป";
    },
    isEmail(val) {
      const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
      return emailPattern.test(val) || "กรุณาใส่อีเมลที่ถูกต้อง";
    },

    switchVisibility() {
      this.visibility = !this.visibility;
      this.passwordFieldType = this.visibility ? "text" : "password";
      this.visibilityIcon = this.visibility ? "visibility_off" : "visibility";
    },
  },
  created() {
    this.apiUrl = getRestApiUrl(this.$store);
    // Clear state on login page load
    this.$store.commit("setMyAuthenticate", false);
    this.$store.commit("setMyMember_id", 0);
    this.$store.commit("setMyName", "");
    this.$store.commit("setMyStatus", "");
    localStorage.removeItem("token");
  },
};
</script>
